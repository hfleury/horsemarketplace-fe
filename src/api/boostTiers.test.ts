import { describe, it, expect, vi, beforeEach } from 'vitest';
import { boostTiersApi } from './boostTiers';
import { apiFetch } from '../lib/apiClient';

vi.mock('../lib/apiClient', () => ({
  apiFetch: vi.fn(),
}));

describe('boostTiersApi', () => {
  const envelope = { status: 'success', data: [] };

  beforeEach(() => {
    vi.mocked(apiFetch).mockReset().mockResolvedValue(envelope);
  });

  it('lists active tiers from the public endpoint', async () => {
    const result = await boostTiersApi.listActive();

    expect(apiFetch).toHaveBeenCalledWith('/boost-tiers');
    expect(result).toBe(envelope);
  });

  it('lists every tier from the admin endpoint', async () => {
    await boostTiersApi.listAll();

    expect(apiFetch).toHaveBeenCalledWith('/admin/boost-tiers');
  });

  it('POSTs a new tier', async () => {
    const request = { code: 'premium', name: 'Premium', price_sek: 299, duration_days: 60 };

    await boostTiersApi.create(request);

    expect(apiFetch).toHaveBeenCalledWith('/admin/boost-tiers', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  });

  it('PUTs every editable field to /admin/boost-tiers/:id', async () => {
    const request = { name: 'Boost', price_sek: 59, duration_days: 10, is_active: false };

    await boostTiersApi.update('t1', request);

    expect(apiFetch).toHaveBeenCalledWith('/admin/boost-tiers/t1', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  });
});
