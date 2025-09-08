// src/pages/Player.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import css from '../styles/player.module.css';

import { useSession } from '../state/SessionContext.jsx';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useImageRotation } from '../hooks/useImageRotation';
import { randomImages, hasUnsplashKey } from '../lib/unsplash';
import { preloadImages } from '../lib/preload';

import ImageRotator from '../components/ImageRotator';
import AppButton from '../components/ui/AppButton';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  StopOutlined,
  ArrowLeftOutlined,
  HomeOutlined,              // <-- icono para “Volver al inicio”
} from '@ant-design/icons';

export default function Player() {
  const navigate = useNavigate();
  const { text, query } = useSession();

  // Voz (usa valores por defecto del hook)
  const { speak, pause, resume, stop, isSpeaking, isPaused } = useSpeechSynthesis({});

  // Estado maestro para el pase de imágenes
  const [isPlayingMedia, setIsPlayingMedia] = useState(false);

  // Imágenes
  const [images, setImages] = useState([]);
  const [ready,  setReady]  = useState(false);
  const [imgError, setImgError] = useState('');

  // Rotación cada 2s controlada por los mismos botones
  const { index, reset } = useImageRotation({
    total: images.length, intervalMs: 2000, active: isPlayingMedia
  });

  // Autocarga imágenes por query (debounce)
  const debounceRef = useRef();
  useEffect(() => {
    const q = (query || '').trim();
    if (!q) { setImages([]); setReady(false); setImgError(''); reset(); return; }

    if (!hasUnsplashKey()) {
      setImages([]); setReady(false);
      setImgError('Falta la Access Key de Unsplash (.env VITE_UNSPLASH_KEY o localStorage).');
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setImgError(''); setReady(false); reset();
        const list = await randomImages(q, 12);
        setImages(list);
        await preloadImages(list);
        setReady(true);
        if (!list.length) setImgError('No se encontraron imágenes para esa categoría.');
      } catch (e) {
        console.error('[AutoLoad] error:', e);
        setImgError('Error cargando imágenes. Revisa la clave de Unsplash o la cuota.');
        setImages([]); setReady(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, reset]);

  async function ensureImages() {
    if (!images.length && (query || '').trim()) {
      try {
        setReady(false); reset();
        const list = await randomImages(query.trim(), 12);
        setImages(list);
        await preloadImages(list);
        setReady(true);
      } catch {}
    }
  }

  // === Controles unificados ===
  async function handlePlay() {
    await ensureImages();
    const t = (text || '').trim();
    if (t) {
      if (isPaused) {
        resume();
      } else if (!isSpeaking) {
        speak({ text: t, onEnd: () => setIsPlayingMedia(false) });
      }
    }
    setIsPlayingMedia(true);
  }
  function handlePause()  { pause();  setIsPlayingMedia(false); }
  function handleResume() { resume(); setIsPlayingMedia(true);  }
  function handleStop()   { stop();   setIsPlayingMedia(false); reset(); }

  // Navegación segura (detiene todo y navega en el siguiente tick)
  function safeNavigate(path) {
    try { stop(); } catch {}
    setIsPlayingMedia(false);
    reset();
    setTimeout(() => navigate(path), 0);
  }
  function handleBack()  { safeNavigate('/editor'); }
  function handleHome()  { safeNavigate('/'); }

  return (
    <div className={css.root}>
      {/* Botones superiores: Volver a editar + Volver al inicio */}
      <div className={css.back} style={{ zIndex: 20, display: 'flex', gap: 8 }}>
        <AppButton htmlType="button" icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Volver a editar
        </AppButton>
        <AppButton htmlType="button" icon={<HomeOutlined />} onClick={handleHome}>
          Volver al inicio
        </AppButton>
      </div>

      {/* Escenario de imágenes a pantalla completa */}
      <div className={css.stage}>
        <ImageRotator images={images} index={index} ready={ready} />
      </div>

      {/* Controles flotantes (solo botones) */}
      <div className={css.controls} style={{ zIndex: 20 }}>
        {!isPlayingMedia ? (
          <AppButton type="primary" icon={<PlayCircleOutlined />} onClick={handlePlay}>
            Reproducir
          </AppButton>
        ) : (
          <AppButton danger icon={<StopOutlined />} onClick={handleStop}>
            Parar
          </AppButton>
        )}
        <AppButton onClick={handlePause}  icon={<PauseCircleOutlined />}>Pausa</AppButton>
        <AppButton onClick={handleResume} icon={<StepForwardOutlined />}>Reanudar</AppButton>
      </div>
    </div>
  );
}