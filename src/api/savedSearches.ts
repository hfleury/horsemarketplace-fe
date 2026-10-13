import type { ApiResponse } from '../types/api';
import type { SavedSearch, SavedSearchRequest } from '../types/savedSearch';
import { apiFetch } from '../lib/apiClient';

export const savedSearchesApi = {
  create(request: SavedSearchRequest) {
    return apiFetch<ApiResponse<SavedSearch>>('/saved-searches', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  list() {
    return apiFetch<ApiResponse<SavedSearch[]>>('/saved-searches');
  },
  // Full replace: omitted optional fields are reset by the backend, so send every field.
  update(id: string, request: SavedSearchRequest) {
    return apiFetch<ApiResponse<SavedSearch>>(`/saved-searches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },
  remove(id: string) {
    return apiFetch<ApiResponse<null>>(`/saved-searches/${id}`, { method: 'DELETE' });
  },
};
