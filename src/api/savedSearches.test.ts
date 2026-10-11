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
