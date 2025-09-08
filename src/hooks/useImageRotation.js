import { useEffect, useRef, useState, useCallback } from 'react';

/** Índice que rota cada `intervalMs` mientras `active` sea true */
export function useImageRotation({ total = 0, intervalMs = 2000, active = false }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  // ✅ memoizamos callbacks para que su identidad no cambie cada render
  const reset = useCallback(() => setIndex(0), []);
  const next  = useCallback(() => setIndex(i => (i + 1) % Math.max(1, total)), [total]);

  useEffect(() => {
    if (!active || total <= 1) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % total);
    }, Math.max(500, intervalMs));
    return () => clearInterval(timerRef.current);
  }, [active, total, intervalMs]);

  return { index, reset, next };
}