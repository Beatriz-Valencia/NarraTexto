import { createContext, useContext, useEffect, useState } from 'react';

const SessionCtx = createContext(null);

export function SessionProvider({ children }) {
  const [text, setText]   = useState(() => localStorage.getItem('vr:text') || '');
  const [query, setQuery] = useState(() => localStorage.getItem('vr:query') || '');

  useEffect(() => localStorage.setItem('vr:text', text), [text]);
  useEffect(() => localStorage.setItem('vr:query', query), [query]);

  return (
    <SessionCtx.Provider value={{ text, setText, query, setQuery }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}