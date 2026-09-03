import type { ApiResponse } from '../types/api';
import type { CreateHorseAttributeOptionRequest, HorseAttributeOption } from '../types/horseAttributes';
import { apiFetch } from '../lib/apiClient';

export const horseAttributesApi = {
  list(type?: string) {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return apiFetch<ApiResponse<HorseAttributeOption[]>>(`/horse-attributes${query}`);
  },
  create(payload: CreateHorseAttributeOptionRequest) {
    return apiFetch<ApiResponse<HorseAttributeOption>>('/horse-attributes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  delete(id: string) {
    return apiFetch<ApiResponse<null>>(`/horse-attributes/${id}`, { method: 'DELETE' });
  },
};
