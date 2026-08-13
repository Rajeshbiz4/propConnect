import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { http } from '../api/client';

const AuthContext = createContext(null);
const TOKEN_KEY = 'property_portal_token';
const USER_KEY = 'property_portal_user';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('property-portal:unauthorized', handleUnauthorized);

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener('property-portal:unauthorized', handleUnauthorized);
    }

    http.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));

    return () => window.removeEventListener('property-portal:unauthorized', handleUnauthorized);
  }, []);

  const login = ({ token, user: nextUser }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, updateUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
