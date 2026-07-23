import type { ApiResponse } from '../types/api';
import type { BackendUser, ToggleUserStatusRequest } from '../types/users';
import { apiFetch } from '../lib/apiClient';

export const usersApi = {
  list() {
    return apiFetch<ApiResponse<BackendUser[]>>('/admin/users');
  },
  setBlockedStatus(userId: string, isActive: boolean) {
    return apiFetch<ApiResponse<null>>(`/admin/users/${userId}/block`, {
      method: 'POST',
      body: JSON.stringify({ is_active: isActive } as ToggleUserStatusRequest),
    });
  },
};
