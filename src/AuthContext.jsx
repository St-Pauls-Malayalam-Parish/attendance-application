import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken, setUnauthorizedHandler } from './api.js';
import { startBackendWarmup } from './utils/backend-health.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const stopWarmup = startBackendWarmup({ signal: controller.signal });
    return () => {
      controller.abort();
      stopWarmup();
    };
  }, []);

  useEffect(() => {
    api('/api/auth/me', { skipAuthRedirect: true })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      async logout() {
        try {
          await api('/api/auth/logout', { method: 'POST', skipAuthRedirect: true });
        } finally {
          setAuthToken(null);
          setUser(null);
        }
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
