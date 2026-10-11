import { describe, it, expect, vi, beforeEach } from 'vitest';
import { savedSearchesApi } from './savedSearches';
import { apiFetch } from '../lib/apiClient';
import type { SavedSearchRequest } from '../types/savedSearch';

vi.mock('../lib/apiClient', () => ({
  apiFetch: vi.fn(),
}));

describe('savedSearchesApi.create', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it('POSTs the request body to /saved-searches and returns the envelope unchanged', async () => {
    const request: SavedSearchRequest = {
      name: 'Horses',
      criteria: { category_id: 'cat-1' },
      alerts_enabled: true,
    };
    const envelope = { status: 'success', data: { id: 's1', name: 'Horses' } };
    vi.mocked(apiFetch).mockResolvedValue(envelope);

    const result = await savedSearchesApi.create(request);

    expect(apiFetch).toHaveBeenCalledWith('/saved-searches', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    expect(result).toBe(envelope);
  });
});

describe('savedSearchesApi.list', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it('GETs /saved-searches and returns the envelope unchanged', async () => {
    const envelope = { status: 'success', data: [] };
    vi.mocked(apiFetch).mockResolvedValue(envelope);

    const result = await savedSearchesApi.list();

    expect(apiFetch).toHaveBeenCalledWith('/saved-searches');
    expect(result).toBe(envelope);
  });
});

describe('savedSearchesApi.update', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it('PUTs the full request body to /saved-searches/:id', async () => {
    const request: SavedSearchRequest = {
      name: 'Renamed',
      criteria: { lat: 59.3, lng: 18.1, radius_km: 50 },
      location_label: 'Stockholm',
      alerts_enabled: false,
    };
    const envelope = { status: 'success', data: { id: 's1', name: 'Renamed' } };
    vi.mocked(apiFetch).mockResolvedValue(envelope);

    const result = await savedSearchesApi.update('s1', request);

    expect(apiFetch).toHaveBeenCalledWith('/saved-searches/s1', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
    expect(result).toBe(envelope);
  });
});

describe('savedSearchesApi.remove', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it('DELETEs /saved-searches/:id', async () => {
    const envelope = { status: 'success', data: null };
    vi.mocked(apiFetch).mockResolvedValue(envelope);

    const result = await savedSearchesApi.remove('s1');

    expect(apiFetch).toHaveBeenCalledWith('/saved-searches/s1', { method: 'DELETE' });
    expect(result).toBe(envelope);
  });
});
