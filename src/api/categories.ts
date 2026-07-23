import type { ApiResponse } from '../types/api';
import type { Category, MediaResponse } from '../types/categories';
import { apiFetch } from '../lib/apiClient';

export const categoriesApi = {
  list() {
    return apiFetch<ApiResponse<Category[]>>('/categories');
  },
  uploadMedia(file: FormData) {
    return apiFetch<ApiResponse<MediaResponse>>('/media/upload', {
      method: 'POST',
      body: file,
    });
  },
  create(payload: { name: string; parent_id: string | null | undefined; picture_url?: string }) {
    return apiFetch<ApiResponse<Category>>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  delete(id: string) {
    return apiFetch<ApiResponse<null>>(`/categories/${id}`, { method: 'DELETE' });
  },
};
