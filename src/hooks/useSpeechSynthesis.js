import { useEffect, useRef, useState } from 'react';

/** TTS secuencial y robusto: speak/pause/resume/stop + {isSpeaking,isPaused,status} */
export function useSpeechSynthesis({ lang = 'es-ES', rate = 1, pitch = 1, voiceURI = '' } = {}) {
  const synthRef = useRef(window.speechSynthesis);
  const [voices, setVoices] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'speaking' | 'paused'

  // Internos (no causan renders)
  const partsRef = useRef([]);
  const idxRef = useRef(0);
  const canceledRef = useRef(false);
  const pausedRef = useRef(false);
  const nextRef = useRef(null);
  const chosenVoiceRef = useRef(null);
  const endCbRef = useRef(null);
  const startCbRef = useRef(null);

  useEffect(() => {
    const load = () => setVoices(synthRef.current.getVoices());
    load();
    synthRef.current.addEventListener('voiceschanged', load);
    return () => synthRef.current.removeEventListener('voiceschanged', load);
  }, []);

  const isSpeaking = status === 'speaking';
  const isPaused = status === 'paused';

  function chunkText(text, maxLen = 180) {
    const out = [];
    const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?…])\s+/);
    let buf = '';
    for (const s of sentences) {
      if ((buf + ' ' + s).trim().length > maxLen) {
        if (buf) out.push(buf.trim());
        if (s.length > maxLen) {
          for (let i = 0; i < s.length; i += maxLen) out.push(s.slice(i, i + maxLen));
          buf = '';
        } else buf = s;
      } else buf = (buf ? buf + ' ' : '') + s;
    }
    if (buf) out.push(buf.trim());
    return out.filter(Boolean);
  }

  function pickVoice() {
    const list = voices.length ? voices : synthRef.current.getVoices();
    return (
      list.find(v => v.voiceURI === voiceURI) ||
      list.find(v => v.lang?.startsWith(lang)) ||
      list[0] ||
      null
    );
  }

  function speak({ text, onChunkStart, onEnd } = {}) {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de voz.');
      return;
    }
    const t = (text || '').trim();
    if (!t) return;

    stop(); // limpia todo estado previo, cancela colas
    canceledRef.current = false;
    pausedRef.current = false;
    startCbRef.current = onChunkStart || null;
    endCbRef.current = onEnd || null;

    partsRef.current = chunkText(t);
    idxRef.current = 0;
    chosenVoiceRef.current = pickVoice();

    const speakNext = () => {
      if (canceledRef.current) return;

      if (idxRef.current >= partsRef.current.length) {
        setStatus('idle');
        endCbRef.current && endCbRef.current();
        return;
      }

      const p = partsRef.current[idxRef.current];
      const u = new SpeechSynthesisUtterance(p);
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      if (chosenVoiceRef.current) u.voice = chosenVoiceRef.current;

      u.onstart = () => {
        setStatus(pausedRef.current ? 'paused' : 'speaking');
        startCbRef.current && startCbRef.current(idxRef.current, partsRef.current.length);
      };

      const onDone = () => {
        if (canceledRef.current) return;
        idxRef.current += 1;
        // Si está pausado justo entre trozos, NO avances hasta que se reanude
        if (pausedRef.current) return;
        setTimeout(speakNext, 0);
      };

      u.onend = onDone;
      u.onerror = onDone;

      synthRef.current.speak(u);
    };

    nextRef.current = speakNext;
    speakNext();
  }

  function pause() {
    // Pausa siempre; si no está hablando, no pasa nada
    pausedRef.current = true;
    synthRef.current.pause();
    setStatus('paused');
  }

  function resume() {
    // Reanuda siempre
    pausedRef.current = false;
    synthRef.current.resume();
    setStatus('speaking');

    // Si estaba pausado EXACTO entre trozos (no hay nada sonando ahora), empuja el siguiente
    setTimeout(() => {
      if (!synthRef.current.speaking && !synthRef.current.paused && !canceledRef.current) {
        if (idxRef.current < partsRef.current.length) {
          nextRef.current && nextRef.current();
        }
      }
    }, 0);
  }

  function stop() {
    canceledRef.current = true;
    pausedRef.current = false;
    synthRef.current.cancel();
    setStatus('idle');
    partsRef.current = [];
    idxRef.current = 0;
  }

  return { speak, pause, resume, stop, voices, isSpeaking, isPaused, status };
}