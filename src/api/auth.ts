import type { AuthResponse, LoginCredentials } from '../types/auth';
import { apiFetch } from '../lib/apiClient';

export const authApi = {
  login(credentials: LoginCredentials) {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  verify(token: string) {
    return apiFetch<AuthResponse>(`/auth/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
  },
  createUser(payload: { username: string; email: string; password: string }) {
    return apiFetch<AuthResponse>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  // Stub endpoint to request resending a verification email. Backend may not exist yet.
  resendVerification(email: string) {
    return apiFetch<AuthResponse>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  forgotPassword(email: string) {
    return apiFetch<{ status: 'success' | 'error'; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  resetPassword(payload: { token: string; password: string }) {
    return apiFetch<{ status: 'success' | 'error'; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};