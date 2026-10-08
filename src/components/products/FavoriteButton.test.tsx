import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FavoriteButton } from './FavoriteButton';
import { FavoritesProvider } from '../../context/FavoritesContext';
import { favoritesApi } from '../../api/favorites';
import { useAuth } from '../../hooks/useAuth';
import { ProductStatus, ProductType, type Product, type ProductStatusKind } from '../../types/product';

vi.mock('../../api/favorites', () => ({
    favoritesApi: { listIds: vi.fn(), add: vi.fn(), remove: vi.fn() },
}));

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));

function makeProduct(status: ProductStatusKind = ProductStatus.Published): Product {
    return {
        id: 'p1',
        user_id: 'u1',
        type: ProductType.Horse,
        status,
        title: 'Test Horse',
        views_count: 0,
        favorite_count: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    };
}

function logInAs(username: string | null) {
    vi.mocked(useAuth).mockReturnValue({
        user: username ? { username, email: `${username}@example.com` } : null,
        token: username ? 'token123' : null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
        error: null,
    });
}

function renderButton(product: Product) {
    return render(
        <FavoritesProvider>
            <FavoriteButton product={product} />
        </FavoritesProvider>
    );
}

function httpError(status: number, message: string) {
    return new Error(`HTTP ${status}: ${JSON.stringify({ status: 'error', message })}`);
}

describe('FavoriteButton', () => {
    beforeEach(() => {
        vi.mocked(favoritesApi.listIds).mockReset().mockResolvedValue({ status: 'success', data: [] });
        vi.mocked(favoritesApi.add).mockReset();
        vi.mocked(favoritesApi.remove).mockReset();
        logInAs('alice');
    });

    it('renders nothing when logged out', () => {
        logInAs(null);

        renderButton(makeProduct());

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(favoritesApi.listIds).not.toHaveBeenCalled();
    });

    it('renders nothing for a sold listing that is not favorited', async () => {
        renderButton(makeProduct(ProductStatus.Sold));

        await waitFor(() => expect(favoritesApi.listIds).toHaveBeenCalled());
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows a pressed toggle for a sold listing that is already favorited', async () => {
        vi.mocked(favoritesApi.listIds).mockResolvedValue({ status: 'success', data: ['p1'] });

        renderButton(makeProduct(ProductStatus.Sold));

        const button = await screen.findByRole('button', { name: /remove from favorites/i });
        expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('takes its initial pressed state from the favorited IDs', async () => {
        vi.mocked(favoritesApi.listIds).mockResolvedValue({ status: 'success', data: ['p1'] });

        renderButton(makeProduct());

        expect(await screen.findByRole('button', { name: /remove from favorites/i })).toHaveAttribute(
            'aria-pressed',
            'true'
        );
    });

    it('adds then removes the favorite on successive clicks', async () => {
        vi.mocked(favoritesApi.add).mockResolvedValue({ status: 'success', data: { product_id: 'p1', favorited: true } });
        vi.mocked(favoritesApi.remove).mockResolvedValue({
            status: 'success',
            data: { product_id: 'p1', favorited: false },
        });

        renderButton(makeProduct());
        await waitFor(() => expect(favoritesApi.listIds).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));
        const removeButton = await screen.findByRole('button', { name: /remove from favorites/i });
        expect(removeButton).toHaveAttribute('aria-pressed', 'true');
        expect(favoritesApi.add).toHaveBeenCalledWith('p1');

        fireEvent.click(removeButton);
        const addButton = await screen.findByRole('button', { name: /add to favorites/i });
        expect(addButton).toHaveAttribute('aria-pressed', 'false');
        expect(favoritesApi.remove).toHaveBeenCalledWith('p1');
    });

    it('shows the friendly own-listing message on a 403', async () => {
        vi.mocked(favoritesApi.add).mockRejectedValue(httpError(403, 'cannot favorite your own listing'));

        renderButton(makeProduct());
        fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent("You can't favorite your own listing.");
    });

    it('shows a generic message and leaves the state unchanged on any other failure', async () => {
        vi.mocked(favoritesApi.add).mockRejectedValue(new Error('network error'));

        renderButton(makeProduct());
        fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't update your favorites. Please try again.");
        expect(screen.getByRole('button', { name: /add to favorites/i })).toHaveAttribute('aria-pressed', 'false');
    });
});
