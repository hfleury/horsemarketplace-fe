import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productsApi } from './products';
import { apiFetch } from '../lib/apiClient';
import type { SearchCriteria } from '../types/searchCriteria';

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

  it('includes only category_id when only category_id is given', async () => {
    await productsApi.list({ category_id: 'cat-1' });
    expect(apiFetch).toHaveBeenCalledWith('/products?category_id=cat-1');
  });

  it('includes all params when category_id, page, and limit are given', async () => {
    await productsApi.list({ category_id: 'cat-1' }, { page: 2, limit: 10 });
    const [endpoint] = vi.mocked(apiFetch).mock.calls[0];
    expect(endpoint).toContain('category_id=cat-1');
    expect(endpoint).toContain('page=2');
    expect(endpoint).toContain('limit=10');
  });

  it('sends lat/lng/radius_km query params', async () => {
    await productsApi.list({ lat: 59.3293, lng: 18.0686, radius_km: 50 });
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

  // Guards the contract with horsemarketplacebk's internal/products/handlers/http.go query names.
  it.each<[string, SearchCriteria, string]>([
    ['q', { q: 'saddle' }, 'q=saddle'],
    ['category_id', { category_id: 'cat-1' }, 'category_id=cat-1'],
    ['breed', { breed: 'Arabian' }, 'breed=Arabian'],
    ['gender', { gender: 'Mare' }, 'gender=Mare'],
    ['discipline', { discipline: 'Dressage' }, 'discipline=Dressage'],
    ['min_age', { min_age: 3 }, 'min_age=3'],
    ['max_age', { max_age: 8 }, 'max_age=8'],
    ['min_height', { min_height: 150 }, 'min_height=150'],
    ['max_height', { max_height: 170 }, 'max_height=170'],
    ['min_price', { min_price: 1000 }, 'min_price=1000'],
    ['max_price', { max_price: 5000 }, 'max_price=5000'],
    ['lat', { lat: 59.3, lng: 18.1, radius_km: 50 }, 'lat=59.3'],
    ['lng', { lat: 59.3, lng: 18.1, radius_km: 50 }, 'lng=18.1'],
    ['radius_km', { lat: 59.3, lng: 18.1, radius_km: 50 }, 'radius_km=50'],
  ])('sends %s under its backend name', async (_key, criteria, expected) => {
    await productsApi.list(criteria);
    const [endpoint] = vi.mocked(apiFetch).mock.calls[0];
    expect(endpoint).toContain(expected);
  });

  it('builds one exact URL from full criteria and pagination', async () => {
    await productsApi.list(
      {
        q: 'saddle',
        category_id: 'cat-1',
        breed: 'Arabian',
        gender: 'Mare',
        discipline: 'Dressage',
        min_age: 3,
        max_age: 8,
        min_height: 150,
        max_height: 170,
        min_price: 1000,
        max_price: 5000,
        lat: 59.3,
        lng: 18.1,
        radius_km: 50,
      },
      { page: 3, limit: 20 }
    );
    expect(apiFetch).toHaveBeenCalledWith(
      '/products?q=saddle&category_id=cat-1&breed=Arabian&gender=Mare&discipline=Dressage' +
        '&min_age=3&max_age=8&min_height=150&max_height=170&min_price=1000&max_price=5000' +
        '&lat=59.3&lng=18.1&radius_km=50&page=3&limit=20'
    );
  });

  it.each([undefined, 0])('omits page and limit when they are %s', async (value) => {
    await productsApi.list({ breed: 'Arabian' }, { page: value, limit: value });
    expect(apiFetch).toHaveBeenCalledWith('/products?breed=Arabian');
  });

  it('sends a zero price', async () => {
    await productsApi.list({ min_price: 0 });
    expect(apiFetch).toHaveBeenCalledWith('/products?min_price=0');
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

describe('productsApi.createProduct', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it('POSTs the listing as JSON to /products', async () => {
    const request = {
      title: 'Bella', type: 'horse', status: 'published', price_sek: 1000,
      description: 'Calm', city: 'Uppsala', transaction_type: 'Sale',
    } as const;

    await productsApi.createProduct(request);

    expect(apiFetch).toHaveBeenCalledWith('/products', { method: 'POST', body: JSON.stringify(request) });
  });
});

describe('productsApi.updateProduct', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it('PUTs the changes as JSON to /products/:id', async () => {
    const request = {
      title: 'Bella', type: 'horse', price_sek: 1000,
      description: 'Calm', city: 'Uppsala', transaction_type: 'Sale',
    } as const;

    await productsApi.updateProduct('p1', request);

    expect(apiFetch).toHaveBeenCalledWith('/products/p1', { method: 'PUT', body: JSON.stringify(request) });
  });
});
