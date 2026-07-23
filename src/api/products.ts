import type { ApiResponse } from '../types/api';
import type { CreateProductRequest, Product } from '../types/product';
import { apiFetch } from '../lib/apiClient';

export const productsApi = {
  createProduct(data: CreateProductRequest) {
    return apiFetch<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
