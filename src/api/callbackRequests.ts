import type { ApiResponse } from '../types/api';
import type { CreateCallbackRequestRequest, CallbackRequest } from '../types/callbackRequest';
import { apiFetch } from '../lib/apiClient';

export const callbackRequestsApi = {
  submit(data: CreateCallbackRequestRequest) {
    return apiFetch<ApiResponse<CallbackRequest>>('/callback-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
