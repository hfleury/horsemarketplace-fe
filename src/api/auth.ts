import type { AuthResponse, LoginCredentials } from '../types/auth';
import { apiFetch } from '../lib/apiClient';

export const authApi = {
  login(credentials: LoginCredentials) {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};