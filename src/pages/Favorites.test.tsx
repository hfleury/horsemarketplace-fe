import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Favorites } from './Favorites';
import { FavoritesProvider } from '../context/FavoritesContext';
import { favoritesApi } from '../api/favorites';
import { useAuth } from '../hooks/useAuth';
import { ProductStatus, ProductType, type Product } from '../types/product';

vi.mock('../api/favorites', () => ({
    favoritesApi: { list: vi.fn(), listIds: vi.fn(), add: vi.fn(), remove: vi.fn() },
}));

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'p1',
        user_id: 'u1',
        type: ProductType.Horse,
        status: ProductStatus.Published,
        title: 'Test Horse',
        views_count: 0,
        favorite_count: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

function mockFavoritesPage(items: Product[] | null, total = items?.length ?? 0, page = 1) {
    vi.mocked(favoritesApi.list).mockResolvedValue({
        status: 'success',
        data: { items: items as Product[], total, page, limit: 20 },
    });
}

function renderFavorites() {
    return render(
        <MemoryRouter>
            <FavoritesProvider>
                <Favorites />
            </FavoritesProvider>
        </MemoryRouter>
    );
}

describe('Favorites', () => {
    beforeEach(() => {
        vi.mocked(favoritesApi.list).mockReset();
        vi.mocked(favoritesApi.listIds).mockReset().mockResolvedValue({ status: 'success', data: [] });
        vi.mocked(favoritesApi.add).mockReset();
        vi.mocked(favoritesApi.remove).mockReset();
        vi.mocked(useAuth).mockReturnValue({
            user: { username: 'alice', email: 'alice@example.com' },
            token: 'token123',
            login: vi.fn(),
            logout: vi.fn(),
            loading: false,
            error: null,
        });
    });

    it('renders favorited listings as cards from the first page', async () => {
        mockFavoritesPage([makeProduct({ id: 'p1', title: 'Bella' }), makeProduct({ id: 'p2', title: 'Saddle' })]);

        renderFavorites();

        expect(await screen.findByText('Bella')).toBeInTheDocument();
        expect(screen.getByText('Saddle')).toBeInTheDocument();
        expect(favoritesApi.list).toHaveBeenCalledWith(1, 20);
    });

    it('shows the empty state with a browse link when the API returns null items', async () => {
        mockFavoritesPage(null);

        renderFavorites();

        expect(await screen.findByText("You haven't saved any listings yet.")).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Browse listings' })).toHaveAttribute('href', '/listings');
    });

    it('shows the error message from an error response', async () => {
        vi.mocked(favoritesApi.list).mockResolvedValue({ status: 'error', message: 'Failed to list favorites' });

        renderFavorites();

        expect(await screen.findByText('Failed to list favorites')).toBeInTheDocument();
    });

    it('shows a "Sold" badge on a sold listing', async () => {
        mockFavoritesPage([makeProduct({ status: ProductStatus.Sold })]);

        renderFavorites();

        expect(await screen.findByText('Sold')).toBeInTheDocument();
    });

    it('removes a card once the server confirms the unfavorite', async () => {
        vi.mocked(favoritesApi.listIds).mockResolvedValue({ status: 'success', data: ['p1', 'p2'] });
        vi.mocked(favoritesApi.remove).mockResolvedValue({
            status: 'success',
            data: { product_id: 'p1', favorited: false },
        });
        mockFavoritesPage([makeProduct({ id: 'p1', title: 'Bella' }), makeProduct({ id: 'p2', title: 'Saddle' })]);

        renderFavorites();

        const hearts = await screen.findAllByRole('button', { name: /remove from favorites/i });
        fireEvent.click(hearts[0]);

        await waitFor(() => expect(screen.queryByText('Bella')).not.toBeInTheDocument());
        expect(favoritesApi.remove).toHaveBeenCalledWith('p1');
        expect(screen.getByText('Saddle')).toBeInTheDocument();
    });

    it('pages forward when there are more favorites than fit on one page', async () => {
        mockFavoritesPage([makeProduct({ title: 'Bella' })], 21);

        renderFavorites();

        await screen.findByText('Bella');
        expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
        const nextButton = screen.getByRole('button', { name: 'Next' });
        expect(nextButton).toBeEnabled();

        mockFavoritesPage([makeProduct({ id: 'p21', title: 'Trailer' })], 21, 2);
        fireEvent.click(nextButton);

        expect(await screen.findByText('Trailer')).toBeInTheDocument();
        expect(favoritesApi.list).toHaveBeenLastCalledWith(2, 20);
        expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    });
});
