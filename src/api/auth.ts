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
  // Stub endpoint to request resending a verification email. Backend may not exist yet.
  resendVerification(email: string) {
    return apiFetch<AuthResponse>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};