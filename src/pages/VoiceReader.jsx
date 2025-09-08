import { useEffect, useRef, useState } from 'react';
import styles from '../styles/voice.module.css';

import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useImageRotation } from '../hooks/useImageRotation';
import { randomImages, hasUnsplashKey } from '../lib/unsplash';
import { preloadImages } from '../lib/preload';

import ImageRotator from '../components/ImageRotator';

import FormField from '../components/ui/FormField';
import AppInput from '../components/ui/AppInput';
import AppTextArea from '../components/ui/AppTextArea';
import AppButton from '../components/ui/AppButton';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, StopOutlined } from '@ant-design/icons';

export default function VoiceReader() {
  // Texto + categoría
  const [text, setText]   = useState(() => localStorage.getItem('vr:text') || '');
  const [query, setQuery] = useState(() => localStorage.getItem('vr:query') || '');
  const [imgError, setImgError] = useState('');

  // Voz (usa valores por defecto del hook: lang=es-ES, rate=1, pitch=1)
  const { speak, pause, resume, stop, isSpeaking, isPaused } = useSpeechSynthesis({});

  // Estado maestro para controlar también la rotación de imágenes
  const [isPlayingMedia, setIsPlayingMedia] = useState(false);

  // Imágenes
  const [images, setImages] = useState([]);
  const [ready,  setReady]  = useState(false);

  // Rotación cada 2s gobernada por el mismo play/pause/resume/stop
  const { index, reset } = useImageRotation({
    total: images.length,
    intervalMs: 2000,
    active: isPlayingMedia
  });

  // Persistencia mínima
  useEffect(() => localStorage.setItem('vr:text', text), [text]);
  useEffect(() => localStorage.setItem('vr:query', query), [query]);

  // --- Autocarga aleatoria al teclear categoría (debounce 500 ms) ---
  const debounceRef = useRef();
  useEffect(() => {
    const q = (query || '').trim();

    // Si queda vacío, limpia
    if (!q) {
      setImages([]);
      setReady(false);
      setImgError('');
      reset();
      return;
    }

    // Si no hay key, avisa y no llames a la API
    if (!hasUnsplashKey()) {
      setImages([]);
      setReady(false);
      setImgError('Falta la Access Key de Unsplash (.env VITE_UNSPLASH_KEY o localStorage).');
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setImgError('');
        setReady(false);
        reset();
        const list = await randomImages(q, 12);
        setImages(list);
        await preloadImages(list);
        setReady(true);
        if (!list.length) setImgError('No se encontraron imágenes para esa categoría.');
      } catch (e) {
        console.error('[AutoLoad] error:', e);
        setImgError('Error cargando imágenes. Revisa la clave de Unsplash o la cuota.');
        setImages([]);
        setReady(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
    // Nota: no hace falta poner "reset" en deps si tu hook ya lo memoiza.
  }, [query]);

  // Deducir tema del texto si no hay query
  function inferQueryFromText(t) {
    const clean = t.replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    return clean.split(' ').slice(0, 5).join(' ');
  }

  // Nueva tanda manual
  async function shuffleImages() {
    const q = (query || inferQueryFromText(text)).trim();
    if (!q) return;
    if (!hasUnsplashKey()) {
      setImgError('Falta la Access Key de Unsplash (.env VITE_UNSPLASH_KEY o localStorage).');
      return;
    }
    try {
      setImgError('');
      setReady(false);
      reset();
      const list = await randomImages(q, 12);
      setImages(list);
      await preloadImages(list);
      setReady(true);
      if (!list.length) setImgError('No se encontraron imágenes para esa categoría.');
    } catch (e) {
      console.error('[Shuffle] error:', e);
      setImgError('Error cargando imágenes. Revisa la clave de Unsplash o la cuota.');
      setImages([]);
      setReady(false);
    }
  }

  // === Controles unificados ===
  async function handlePlay() {
    // Asegura imágenes listas
    if (!images.length) await shuffleImages();

    const t = (text || '').trim();
    if (t) {
      // Si estaba en pausa, reanuda; si no, empieza a leer y al terminar detenemos el pase.
      if (isPaused) {
        resume();
      } else if (!isSpeaking) {
        speak({
          text: t,
          onEnd: () => setIsPlayingMedia(false),
        });
      }
    }
    // Activa el pase de imágenes aunque no haya texto (slideshow)
    setIsPlayingMedia(true);
  }

  function handlePause() {
    // Pausa SIEMPRE voz e imágenes (evita quedarte “entre frases”)
    pause();
    setIsPlayingMedia(false);
  }

  function handleResume() {
    // Reanuda SIEMPRE voz e imágenes (si estaba entre trozos, el hook empuja el siguiente)
    resume();
    setIsPlayingMedia(true);
  }

  function handleStop() {
    stop();               // voz fuera
    setIsPlayingMedia(false); // imágenes fuera
    reset();              // vuelve a la primera imagen
  }

  return (
    <div className={styles.wrap}>
      {/* Panel izquierdo */}
      <section className={styles.left}>
        <div className="panel">
          <h3 className="panelTitle">Lector</h3>
          <FormField label="Texto a narrar">
            <AppTextArea
              rows={10}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Pega aquí el texto a narrar…"
            />
          </FormField>
        </div>

        <div className="panel">
          <h3 className="panelTitle">Imágenes (Unsplash)</h3>
          <div className={styles.row}>
            <FormField
              label="Categoría / Tema"
              extra="Se cargan fotos aleatorias automáticamente al teclear."
            >
              <AppInput
                placeholder="Ej: energía solar, bosques, ciudades nocturnas…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </FormField>
            <AppButton onClick={shuffleImages} style={{ height: 40 }}>
              🔄 Nueva tanda
            </AppButton>
          </div>
          {imgError && <div className="help" style={{ color: '#ff7875' }}>{imgError}</div>}
        </div>

        {/* Controles unificados */}
        <div className="panel">
          <h3 className="panelTitle">Controles</h3>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {!isPlayingMedia ? (
              <AppButton type="primary" icon={<PlayCircleOutlined />} onClick={handlePlay}>
                Reproducir
              </AppButton>
            ) : (
              <AppButton danger icon={<StopOutlined />} onClick={handleStop}>
                Parar
              </AppButton>
            )}
            <AppButton onClick={handlePause} icon={<PauseCircleOutlined />}>Pausa</AppButton>
            <AppButton onClick={handleResume} icon={<StepForwardOutlined />}>Reanudar</AppButton>
          </div>
          <div className="help" style={{ marginTop:8 }}>
            Estos botones controlan a la vez la <strong>lectura</strong> y el <strong>pase de imágenes</strong>.
            Si el texto está vacío, actúan como un <em>slideshow</em>.
          </div>
        </div>
      </section>

      {/* Panel derecho */}
      <section className={styles.right}>
        <h3 className="panelTitle" style={{ margin: '0 0 -4px 0' }}>Vista</h3>
        <ImageRotator images={images} index={index} ready={ready} />
      </section>
    </div>
  );
}