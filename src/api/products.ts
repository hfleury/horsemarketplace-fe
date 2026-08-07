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
  list(params: { categoryId?: string; page?: number; limit?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.categoryId) qs.set('category_id', params.categoryId);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return apiFetch<ApiResponse<PaginatedProducts>>(`/products${query ? `?${query}` : ''}`);
  },
};
