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
});
