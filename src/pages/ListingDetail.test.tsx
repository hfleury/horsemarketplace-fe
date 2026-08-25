import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ListingDetail } from './ListingDetail';
import { productsApi } from '../api/products';
import { ProductStatus, ProductType, type Product } from '../types/product';

vi.mock('../api/products', () => ({
    productsApi: { getById: vi.fn() },
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'p1',
        user_id: 'u1',
        type: ProductType.Horse,
        status: ProductStatus.Published,
        title: 'Test Horse',
        price_sek: 5000,
        views_count: 3,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

function renderAtListing(id: string) {
    return render(
        <MemoryRouter initialEntries={[`/listings/${id}`]}>
            <Routes>
                <Route path="/listings/:id" element={<ListingDetail />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ListingDetail', () => {
    beforeEach(() => {
        vi.mocked(productsApi.getById).mockReset();
    });

    it('shows a loading state before the fetch resolves', async () => {
        vi.mocked(productsApi.getById).mockReturnValue(new Promise(() => {}));

        renderAtListing('p1');

        expect(screen.getByText(/loading listing/i)).toBeInTheDocument();
    });

    it('renders title, price, and a horse spec field on success', async () => {
        vi.mocked(productsApi.getById).mockResolvedValue({
            status: 'success',
            data: makeProduct({ horse: { breed: 'Warmblood', age: 5 } }),
        });

        renderAtListing('p1');

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
        expect(screen.getByText('5 000 SEK')).toBeInTheDocument();
        expect(screen.getByText('Warmblood')).toBeInTheDocument();
        expect(productsApi.getById).toHaveBeenCalledWith('p1');
    });

    it('renders the vehicle spec block for a vehicle-type product', async () => {
        vi.mocked(productsApi.getById).mockResolvedValue({
            status: 'success',
            data: makeProduct({
                type: ProductType.Vehicle,
                title: 'Test Trailer',
                vehicle: { make: 'Ifor Williams', model: 'HB506' },
            }),
        });

        renderAtListing('p1');

        await waitFor(() => expect(screen.getByText('Test Trailer')).toBeInTheDocument());
        expect(screen.getByText('Ifor Williams')).toBeInTheDocument();
        expect(screen.getByText('HB506')).toBeInTheDocument();
    });

    it('renders the error message when the fetch does not succeed', async () => {
        vi.mocked(productsApi.getById).mockResolvedValue({
            status: 'error',
            message: 'Listing not found',
        });

        renderAtListing('bad-id');

        await waitFor(() => expect(screen.getByText('Listing not found')).toBeInTheDocument());
    });
});
