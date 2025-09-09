import { createContext, useContext, useEffect, useState } from 'react';

const SessionCtx = createContext(null);

export function SessionProvider({ children }) {
   // Cargamos valores previos (si existen) desde localStorage
  const [text, setText]   = useState(() => localStorage.getItem('vr:text') || '');
  const [query, setQuery] = useState(() => localStorage.getItem('vr:query') || '');

  useEffect(() => localStorage.setItem('vr:text', text), [text]);
  useEffect(() => localStorage.setItem('vr:query', query), [query]);

  //setText y setQuery son funciones para actualizar estados

  //cualquier componente envuelto por el proveedor children podrá acceder a los valores de text, setText, query, etc
  return (
    <SessionCtx.Provider value={{ text, setText, query, setQuery }}>
      {children} 
    </SessionCtx.Provider>
  );
}

//hook para consumir el contexto
export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}