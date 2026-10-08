import type { ApiResponse } from '../types/api';
import type { FavoriteStatus } from '../types/favorite';
import { apiFetch } from '../lib/apiClient';

export const favoritesApi = {
  listIds() {
    return apiFetch<ApiResponse<string[]>>('/favorites/ids');
  },

  add(productId: string) {
    return apiFetch<ApiResponse<FavoriteStatus>>(`/favorites/${productId}`, { method: 'POST' });
  },

  remove(productId: string) {
    return apiFetch<ApiResponse<FavoriteStatus>>(`/favorites/${productId}`, { method: 'DELETE' });
  },
};
