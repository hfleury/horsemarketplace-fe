import type { ApiResponse } from '../types/api';
import type { BoostTier, CreateBoostTierRequest, UpdateBoostTierRequest } from '../types/boostTiers';
import { apiFetch } from '../lib/apiClient';

export const boostTiersApi = {
  listActive() {
    return apiFetch<ApiResponse<BoostTier[]>>('/boost-tiers');
  },
  listAll() {
    return apiFetch<ApiResponse<BoostTier[]>>('/admin/boost-tiers');
  },
  create(request: CreateBoostTierRequest) {
    return apiFetch<ApiResponse<BoostTier>>('/admin/boost-tiers', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  update(id: string, request: UpdateBoostTierRequest) {
    return apiFetch<ApiResponse<BoostTier>>(`/admin/boost-tiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },
};
