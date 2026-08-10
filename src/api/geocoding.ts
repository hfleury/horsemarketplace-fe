import type { ApiResponse } from '../types/api';
import { apiFetch } from '../lib/apiClient';

export const geocodingApi = {
  resolve(query: string) {
    return apiFetch<ApiResponse<{ lat: number; lng: number }>>(
      `/geocode?query=${encodeURIComponent(query)}`
    );
  },
};
