import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentsApi } from './payments';
import { apiFetch } from '../lib/apiClient';

vi.mock('../lib/apiClient', () => ({
  apiFetch: vi.fn(),
}));

describe('paymentsApi', () => {
  const envelope = { status: 'success', data: null };

  beforeEach(() => {
    vi.mocked(apiFetch).mockReset().mockResolvedValue(envelope);
  });

  it('lists the enabled providers', async () => {
    const result = await paymentsApi.listProviders();

    expect(apiFetch).toHaveBeenCalledWith('/payments/providers');
    expect(result).toBe(envelope);
  });

  it('POSTs a checkout with snake_case keys', async () => {
    const request = {
      product_id: 'p1',
      tier_code: 'medium',
      provider: 'sandbox',
      starts_at: '2026-12-24T08:00:00.000Z',
    };

    const result = await paymentsApi.createCheckout(request);

    expect(apiFetch).toHaveBeenCalledWith('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    expect(result).toBe(envelope);
  });

  it('omits starts_at when the boost should start now', async () => {
    await paymentsApi.createCheckout({ product_id: 'p1', tier_code: 'boost', provider: 'sandbox' });

    const body = vi.mocked(apiFetch).mock.calls[0][1]?.body as string;
    expect(JSON.parse(body)).not.toHaveProperty('starts_at');
  });

  it('GETs a payment status by id', async () => {
    await paymentsApi.getStatus('pay-1');

    expect(apiFetch).toHaveBeenCalledWith('/payments/pay-1');
  });

  it('encodes a payment id taken from the URL', async () => {
    await paymentsApi.getStatus('../admin/users');

    expect(apiFetch).toHaveBeenCalledWith('/payments/..%2Fadmin%2Fusers');
  });

  it('propagates request errors', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error('HTTP 404: not found'));

    await expect(paymentsApi.getStatus('pay-1')).rejects.toThrow('HTTP 404');
    await expect(paymentsApi.listProviders()).rejects.toThrow('HTTP 404');
    await expect(
      paymentsApi.createCheckout({ product_id: 'p1', tier_code: 'boost', provider: 'sandbox' }),
    ).rejects.toThrow('HTTP 404');
  });
});
