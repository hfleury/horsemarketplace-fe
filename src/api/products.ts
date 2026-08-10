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
  getById(id: string) {
    return apiFetch<ApiResponse<Product>>(`/products/${id}`);
  },
  list(
    params: {
      categoryId?: string;
      breed?: string;
      gender?: string;
      discipline?: string;
      minAge?: number;
      maxAge?: number;
      minHeight?: number;
      maxHeight?: number;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
      lat?: number;
      lng?: number;
      radiusKm?: number;
      q?: string;
    } = {}
  ) {
    const qs = new URLSearchParams();
    if (params.categoryId) qs.set('category_id', params.categoryId);
    if (params.breed) qs.set('breed', params.breed);
    if (params.gender) qs.set('gender', params.gender);
    if (params.discipline) qs.set('discipline', params.discipline);
    if (params.minAge !== undefined) qs.set('min_age', String(params.minAge));
    if (params.maxAge !== undefined) qs.set('max_age', String(params.maxAge));
    if (params.minHeight !== undefined) qs.set('min_height', String(params.minHeight));
    if (params.maxHeight !== undefined) qs.set('max_height', String(params.maxHeight));
    if (params.minPrice !== undefined) qs.set('min_price', String(params.minPrice));
    if (params.maxPrice !== undefined) qs.set('max_price', String(params.maxPrice));
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.lat !== undefined) qs.set('lat', String(params.lat));
    if (params.lng !== undefined) qs.set('lng', String(params.lng));
    if (params.radiusKm !== undefined) qs.set('radius_km', String(params.radiusKm));
    if (params.q) qs.set('q', params.q);
    const query = qs.toString();
    return apiFetch<ApiResponse<PaginatedProducts>>(`/products${query ? `?${query}` : ''}`);
  },
};
