import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Listings } from './Listings';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { geocodingApi } from '../api/geocoding';
import { ProductStatus, ProductType, type Product } from '../types/product';

vi.mock('../api/products', () => ({
    productsApi: { list: vi.fn() },
}));

vi.mock('../api/categories', () => ({
    categoriesApi: { list: vi.fn() },
}));

vi.mock('../api/geocoding', () => ({
    geocodingApi: { resolve: vi.fn() },
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'p1',
        user_id: 'u1',
        type: ProductType.Horse,
        status: ProductStatus.Published,
        title: 'Test Horse',
        price_sek: 5000,
        views_count: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('Listings', () => {
    beforeEach(() => {
        vi.mocked(productsApi.list).mockReset();
        vi.mocked(categoriesApi.list).mockReset();
        vi.mocked(geocodingApi.resolve).mockReset();
        vi.mocked(categoriesApi.list).mockResolvedValue({
            status: 'success',
            data: [{ id: 'cat-1', name: 'Horses' }],
        });
    });

    it('shows a loading state then renders listing cards once resolved', async () => {
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [makeProduct()], total: 1, page: 1, limit: 20 },
        });

        render(
            <MemoryRouter>
                <Listings />
            </MemoryRouter>
        );

        expect(screen.getByText(/loading listings/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Test Horse')).toBeInTheDocument();
        });
    });

    it('re-fetches with the selected category when the filter changes', async () => {
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [makeProduct()], total: 1, page: 1, limit: 20 },
        });

        render(
            <MemoryRouter>
                <Listings />
            </MemoryRouter>
        );

        await waitFor(() => expect(productsApi.list).toHaveBeenCalledWith({ categoryId: undefined, page: 1, limit: 20, q: '' }));

        fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: 'cat-1' } });

        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({ categoryId: 'cat-1', page: 1, limit: 20, q: '' })
        );
    });

    it('disables next when on the last page, and advances page when clicked while enabled', async () => {
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [makeProduct()], total: 40, page: 1, limit: 20 },
        });

        render(
            <MemoryRouter>
                <Listings />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());

        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).not.toBeDisabled();

        fireEvent.click(nextButton);

        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({ categoryId: undefined, page: 2, limit: 20, q: '' })
        );
    });

    it('disables next when page * limit >= total', async () => {
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [makeProduct()], total: 5, page: 1, limit: 20 },
        });

        render(
            <MemoryRouter>
                <Listings />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());

        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('renders the empty-state message when there are no listings', async () => {
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [], total: 0, page: 1, limit: 20 },
        });

        render(
            <MemoryRouter>
                <Listings />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/no listings found/i)).toBeInTheDocument();
        });
    });

    it('re-fetches with resolved coordinates and radius after typing a location and picking a radius', async () => {
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [makeProduct()], total: 1, page: 1, limit: 20 },
        });
        vi.mocked(geocodingApi.resolve).mockResolvedValue({
            status: 'success',
            data: { lat: 59.3293, lng: 18.0686 },
        });

        render(
            <MemoryRouter>
                <Listings />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Stockholm' } });
        fireEvent.blur(screen.getByLabelText('Location'));

        await waitFor(() => expect(geocodingApi.resolve).toHaveBeenCalledWith('Stockholm'));

        fireEvent.change(screen.getByRole('combobox', { name: 'Radius' }), { target: { value: '50' } });

        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({
                categoryId: undefined,
                page: 1,
                limit: 20,
                q: '',
                lat: 59.3293,
                lng: 18.0686,
                radiusKm: 50,
            })
        );
    });

    it('seeds the keyword input from the q URL param and includes it in the fetch', async () => {
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [makeProduct()], total: 1, page: 1, limit: 20 },
        });

        render(
            <MemoryRouter initialEntries={['/listings?q=foo']}>
                <Listings />
            </MemoryRouter>
        );

        expect(screen.getByLabelText('Keyword')).toHaveValue('foo');

        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({ categoryId: undefined, page: 1, limit: 20, q: 'foo' })
        );
    });

    it('debounces keyword input changes before re-fetching, and resets to page 1', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.mocked(productsApi.list).mockResolvedValue({
            status: 'success',
            data: { items: [makeProduct()], total: 40, page: 1, limit: 20 },
        });

        render(
            <MemoryRouter>
                <Listings />
            </MemoryRouter>
        );

        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({ categoryId: undefined, page: 1, limit: 20, q: '' })
        );

        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({ categoryId: undefined, page: 2, limit: 20, q: '' })
        );

        fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'stockholm' } });

        await vi.advanceTimersByTimeAsync(400);

        await waitFor(() =>
            expect(productsApi.list).toHaveBeenCalledWith({ categoryId: undefined, page: 1, limit: 20, q: 'stockholm' })
        );

        vi.useRealTimers();
    });
});
