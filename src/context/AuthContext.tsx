import React, { useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { authApi } from '../api/auth';
import { extractErrorMessage } from '../lib/errors';
import { AuthContext } from './authContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On app start, check for existing token in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
