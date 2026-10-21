import React, { useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { authApi } from '../api/auth';
import { extractErrorMessage } from '../lib/errors';
import { AuthContext } from './authContext';

interface StoredSession {
  token: string;
  user: User;
}

// Sessions saved before the login response carried the user's id are treated
// as stale, so owner-only features can rely on user.id.
function readStoredSession(): StoredSession | null {
  const savedToken = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('authUser');
  if (!savedToken || !savedUser) return null;
  try {
    const user: User = JSON.parse(savedUser);
    return user?.id ? { token: savedToken, user } : null;
  } catch {
    return null;
  }
}

function clearStoredSession() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On app start, check for existing token in localStorage
  useEffect(() => {
    const session = readStoredSession();
    if (!session) {
      clearStoredSession();
      return;
    }
    setToken(session.token);
    setUser(session.user);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login({ username, password });
      const { token: newToken, user: newUser } = data.data;

      // Ensure role is present (backend should send it, but fallback if missing)
      if (!newUser.role) newUser.role = 'user';

      setToken(newToken);
      setUser(newUser);

      // TODO: Persist securely (for demo; in prod consider httpOnly cookies)
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(newUser));
    } catch (err) {
      setError(extractErrorMessage(err, 'Login failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearStoredSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
