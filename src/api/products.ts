import type { ApiResponse } from '../types/api';
import type { CreateProductRequest, PaginatedProducts, Product } from '../types/product';
import { apiFetch } from '../lib/apiClient';

export const productsApi = {
  createProduct(data: CreateProductRequest) {
    return apiFetch<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  list(
    params: {
      categoryId?: string;
      page?: number;
      limit?: number;
      lat?: number;
      lng?: number;
      radiusKm?: number;
    } = {}
  ) {
    const qs = new URLSearchParams();
    if (params.categoryId) qs.set('category_id', params.categoryId);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.lat !== undefined) qs.set('lat', String(params.lat));
    if (params.lng !== undefined) qs.set('lng', String(params.lng));
    if (params.radiusKm !== undefined) qs.set('radius_km', String(params.radiusKm));
    const query = qs.toString();
    return apiFetch<ApiResponse<PaginatedProducts>>(`/products${query ? `?${query}` : ''}`);
  },
};
