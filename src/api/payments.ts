import type { ApiResponse } from '../types/api';
import type { CheckoutRequest, CheckoutResponse, PaymentStatusResponse } from '../types/payments';
import { apiFetch } from '../lib/apiClient';

export const paymentsApi = {
  listProviders() {
    return apiFetch<ApiResponse<string[]>>('/payments/providers');
  },
  createCheckout(request: CheckoutRequest) {
    return apiFetch<ApiResponse<CheckoutResponse>>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  getStatus(paymentId: string) {
    return apiFetch<ApiResponse<PaymentStatusResponse>>(`/payments/${encodeURIComponent(paymentId)}`);
  },
};
