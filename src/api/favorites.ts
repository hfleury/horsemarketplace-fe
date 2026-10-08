import type { ApiResponse } from '../types/api';
import type { FavoriteStatus } from '../types/favorite';
import type { PaginatedProducts } from '../types/product';
import { apiFetch } from '../lib/apiClient';

export const favoritesApi = {
  list(page: number, limit: number) {
    return apiFetch<ApiResponse<PaginatedProducts>>(`/favorites?page=${page}&limit=${limit}`);
  },

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
