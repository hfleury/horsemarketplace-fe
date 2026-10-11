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
};
