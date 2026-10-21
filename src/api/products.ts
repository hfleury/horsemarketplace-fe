import type { ApiResponse } from '../types/api';
import type { CreateProductRequest, PaginatedProducts, Product, UpdateProductRequest } from '../types/product';
import type { SearchCriteria } from '../types/searchCriteria';
import { apiFetch } from '../lib/apiClient';
import { criteriaToQueryParams } from '../lib/searchCriteria/queryParams';

export const productsApi = {
  createProduct(data: CreateProductRequest) {
    return apiFetch<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateProduct(id: string, data: UpdateProductRequest) {
    return apiFetch<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  getById(id: string) {
    return apiFetch<ApiResponse<Product>>(`/products/${id}`);
  },
  getSimilar(id: string, limit = 4) {
    return apiFetch<ApiResponse<Product[]>>(`/products/${id}/similar?limit=${limit}`);
  },
  list(criteria: SearchCriteria = {}, pagination: { page?: number; limit?: number } = {}) {
    const qs = criteriaToQueryParams(criteria);
    if (pagination.page) qs.set('page', String(pagination.page));
    if (pagination.limit) qs.set('limit', String(pagination.limit));
    const query = qs.toString();
    return apiFetch<ApiResponse<PaginatedProducts>>(`/products${query ? `?${query}` : ''}`);
  },
};
