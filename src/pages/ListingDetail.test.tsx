import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ListingDetail } from './ListingDetail';
import { productsApi } from '../api/products';
import { useAuth } from '../hooks/useAuth';
import { ProductStatus, ProductType, type Product } from '../types/product';

vi.mock('../api/products', () => ({
    productsApi: { getById: vi.fn(), getSimilar: vi.fn() },
}));

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

vi.mock('../components/products/MessageSellerPanel', () => ({
    MessageSellerPanel: ({ open }: { open: boolean }) =>
        open ? <div data-testid="message-seller-panel" /> : null,
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
        favorite_count: 5,
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
        vi.mocked(productsApi.getSimilar).mockReset();
        vi.mocked(productsApi.getSimilar).mockResolvedValue({ status: 'success', data: [] });
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            token: null,
            login: vi.fn(),
            logout: vi.fn(),
            loading: false,
            error: null,
        });
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
        expect(screen.getByText('3 views')).toBeInTheDocument();
        expect(screen.getByText('5 favorites')).toBeInTheDocument();
    });

    it('shows singular wording when a count is exactly 1', async () => {
        vi.mocked(productsApi.getById).mockResolvedValue({
            status: 'success',
            data: makeProduct({ views_count: 1, favorite_count: 1 }),
        });

        renderAtListing('p1');

        await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
        expect(screen.getByText('1 view')).toBeInTheDocument();
        expect(screen.getByText('1 favorite')).toBeInTheDocument();
        expect(screen.queryByText('1 views')).not.toBeInTheDocument();
        expect(screen.queryByText('1 favorites')).not.toBeInTheDocument();
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

    describe('copy link button', () => {
        beforeEach(() => {
            Object.assign(navigator, {
                clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
            });
        });

        it('copies the current URL when clicked', async () => {
            vi.mocked(productsApi.getById).mockResolvedValue({
                status: 'success',
                data: makeProduct(),
            });

            renderAtListing('p1');

            await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
            fireEvent.click(screen.getByRole('button', { name: /copy link/i }));

            await waitFor(() =>
                expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href)
            );
        });

        it('swaps the icon to a confirmation state and reverts after 2 seconds', async () => {
            vi.useFakeTimers();
            vi.mocked(productsApi.getById).mockResolvedValue({
                status: 'success',
                data: makeProduct(),
            });

            renderAtListing('p1');

            await vi.waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
            fireEvent.click(screen.getByRole('button', { name: /copy link/i }));

            await vi.waitFor(() => expect(screen.getByRole('button', { name: /link copied/i })).toBeInTheDocument());

            vi.advanceTimersByTime(2000);

            await vi.waitFor(() => expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument());

            vi.useRealTimers();
        });
    });

    describe('similar listings', () => {
        it('renders the "Similar listings" heading and cards when related products are returned', async () => {
            vi.mocked(productsApi.getById).mockResolvedValue({
                status: 'success',
                data: makeProduct(),
            });
            vi.mocked(productsApi.getSimilar).mockResolvedValue({
                status: 'success',
                data: [
                    makeProduct({ id: 'p2', title: 'Related Horse One' }),
                    makeProduct({ id: 'p3', title: 'Related Horse Two' }),
                ],
            });

            renderAtListing('p1');

            await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
            await waitFor(() => expect(screen.getByText('Similar listings')).toBeInTheDocument());
            expect(screen.getByText('Related Horse One')).toBeInTheDocument();
            expect(screen.getByText('Related Horse Two')).toBeInTheDocument();
        });

        it('does not render the "Similar listings" heading when there are no related products', async () => {
            vi.mocked(productsApi.getById).mockResolvedValue({
                status: 'success',
                data: makeProduct(),
            });
            vi.mocked(productsApi.getSimilar).mockResolvedValue({ status: 'success', data: [] });

            renderAtListing('p1');

            await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
            expect(screen.queryByText('Similar listings')).not.toBeInTheDocument();
        });

        it('still renders the main product when the similar-listings fetch rejects', async () => {
            vi.mocked(productsApi.getById).mockResolvedValue({
                status: 'success',
                data: makeProduct(),
            });
            vi.mocked(productsApi.getSimilar).mockRejectedValue(new Error('network error'));

            renderAtListing('p1');

            await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
            expect(screen.queryByText('Similar listings')).not.toBeInTheDocument();
            expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
        });
    });

    describe('report listing', () => {
        it('does not render the Report listing button when logged out', async () => {
            vi.mocked(productsApi.getById).mockResolvedValue({
                status: 'success',
                data: makeProduct(),
            });

            renderAtListing('p1');

            await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
            expect(screen.queryByRole('button', { name: /report listing/i })).not.toBeInTheDocument();
        });

        describe('when logged in', () => {
            beforeEach(() => {
                vi.mocked(useAuth).mockReturnValue({
                    user: { username: 'alice', email: 'alice@example.com' },
                    token: 'token123',
                    login: vi.fn(),
                    logout: vi.fn(),
                    loading: false,
                    error: null,
                });
            });

            it('renders the Report listing button when logged in', async () => {
                vi.mocked(productsApi.getById).mockResolvedValue({
                    status: 'success',
                    data: makeProduct(),
                });

                renderAtListing('p1');

                await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
                expect(screen.getByRole('button', { name: /report listing/i })).toBeInTheDocument();
            });

            it('opens the report dialog when clicked', async () => {
                vi.mocked(productsApi.getById).mockResolvedValue({
                    status: 'success',
                    data: makeProduct(),
                });

                renderAtListing('p1');

                await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
                fireEvent.click(screen.getByRole('button', { name: /report listing/i }));

                expect(screen.getByRole('combobox')).toBeInTheDocument();
            });
        });
    });

    describe('message seller', () => {
        it('does not render the Message seller button when logged out', async () => {
            vi.mocked(productsApi.getById).mockResolvedValue({
                status: 'success',
                data: makeProduct(),
            });

            renderAtListing('p1');

            await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
            expect(screen.queryByRole('button', { name: /message seller/i })).not.toBeInTheDocument();
        });

        describe('when logged in', () => {
            beforeEach(() => {
                vi.mocked(useAuth).mockReturnValue({
                    user: { username: 'alice', email: 'alice@example.com' },
                    token: 'token123',
                    login: vi.fn(),
                    logout: vi.fn(),
                    loading: false,
                    error: null,
                });
            });

            it('renders the Message seller button when logged in', async () => {
                vi.mocked(productsApi.getById).mockResolvedValue({
                    status: 'success',
                    data: makeProduct(),
                });

                renderAtListing('p1');

                await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
                expect(screen.getByRole('button', { name: /message seller/i })).toBeInTheDocument();
            });

            it('opens the message panel when clicked', async () => {
                vi.mocked(productsApi.getById).mockResolvedValue({
                    status: 'success',
                    data: makeProduct(),
                });

                renderAtListing('p1');

                await waitFor(() => expect(screen.getByText('Test Horse')).toBeInTheDocument());
                fireEvent.click(screen.getByRole('button', { name: /message seller/i }));

                expect(screen.getByTestId('message-seller-panel')).toBeInTheDocument();
            });
        });
    });
});
