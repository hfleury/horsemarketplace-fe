import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsApi } from './products';
import { apiFetch } from '../lib/apiClient';

vi.mock('../lib/apiClient', () => ({
  apiFetch: vi.fn(),
}));

describe('productsApi.list', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue({ status: 'success', data: { items: [], total: 0, page: 1, limit: 20 } });
  });

  it('calls /products with no query string when no params given', async () => {
    await productsApi.list();
    expect(apiFetch).toHaveBeenCalledWith('/products');
  });

  it('includes only category_id when only categoryId is given', async () => {
    await productsApi.list({ categoryId: 'cat-1' });
    expect(apiFetch).toHaveBeenCalledWith('/products?category_id=cat-1');
  });

  it('includes all params when categoryId, page, and limit are given', async () => {
    await productsApi.list({ categoryId: 'cat-1', page: 2, limit: 10 });
    const [endpoint] = vi.mocked(apiFetch).mock.calls[0];
    expect(endpoint).toContain('category_id=cat-1');
    expect(endpoint).toContain('page=2');
    expect(endpoint).toContain('limit=10');
  });

  it('maps lat/lng/radiusKm to lat/lng/radius_km query params', async () => {
    await productsApi.list({ lat: 59.3293, lng: 18.0686, radiusKm: 50 });
    const [endpoint] = vi.mocked(apiFetch).mock.calls[0];
    expect(endpoint).toContain('lat=59.3293');
    expect(endpoint).toContain('lng=18.0686');
    expect(endpoint).toContain('radius_km=50');
  });

  it('includes q when a keyword is given', async () => {
    await productsApi.list({ q: 'foo' });
    const [endpoint] = vi.mocked(apiFetch).mock.calls[0];
    expect(endpoint).toContain('q=foo');
  });

  it('omits q when not given', async () => {
    await productsApi.list();
    const [endpoint] = vi.mocked(apiFetch).mock.calls[0];
    expect(endpoint).not.toContain('q=');
  });

  it('omits q when given as an empty string', async () => {
    await productsApi.list({ q: '' });
    const [endpoint] = vi.mocked(apiFetch).mock.calls[0];
    expect(endpoint).not.toContain('q=');
  });
});

describe('productsApi.getById', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it('calls /products/:id and returns the envelope unchanged', async () => {
    const envelope = { status: 'success', data: { id: 'p1', title: 'Test' } };
    vi.mocked(apiFetch).mockResolvedValue(envelope);

    const result = await productsApi.getById('p1');

    expect(apiFetch).toHaveBeenCalledWith('/products/p1');
    expect(result).toBe(envelope);
  });
});
