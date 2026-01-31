import type { CreateProductRequest, Product } from '../types/product';
// import { API_URL } from '../types/marketplace'; 

// Helper to get token (can be improved with a proper http client wrapper)
const getToken = () => localStorage.getItem('token');

const BASE_URL = 'http://localhost:8080'; // Should be from env

export const createProduct = async (data: CreateProductRequest): Promise<Product> => {
    const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create product');
    }

    const json = await response.json();
    return json.data;
};
