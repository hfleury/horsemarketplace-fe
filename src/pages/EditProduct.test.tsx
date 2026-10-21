import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EditProduct } from './EditProduct';
import { productsApi } from '../api/products';
import { paymentsApi } from '../api/payments';
import { boostTiersApi } from '../api/boostTiers';
import { horseAttributesApi } from '../api/horseAttributesApi';
import { redirectToExternal } from '../lib/redirect';
import { useAuth } from '../hooks/useAuth';
import type { BoostTier } from '../types/boostTiers';
import { ProductStatus, ProductType, type Product } from '../types/product';

vi.mock('../api/products', () => ({ productsApi: { getById: vi.fn(), updateProduct: vi.fn() } }));
vi.mock('../api/payments', () => ({ paymentsApi: { listProviders: vi.fn(), createCheckout: vi.fn() } }));
vi.mock('../api/boostTiers', () => ({ boostTiersApi: { listActive: vi.fn() } }));
vi.mock('../api/horseAttributesApi', () => ({ horseAttributesApi: { list: vi.fn() } }));
vi.mock('../lib/redirect', () => ({ redirectToExternal: vi.fn() }));
vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));

const medium: BoostTier = {
    id: 't2',
    code: 'medium',
    name: 'Medium',
    price_sek: 99,
    duration_days: 14,
    is_active: true,
    created_at: '2026-10-21T00:00:00Z',
    updated_at: '2026-10-21T00:00:00Z',
};

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'p1',
        user_id: 'u1',
        type: ProductType.Horse,
        status: ProductStatus.PendingApproval,
        title: 'Calm gelding for sale',
        price_sek: 45000,
        description: 'A calm and friendly gelding for anyone',
        city: 'Uppsala',
        latitude: 59.8,
        longitude: 17.6,
        transaction_type: 'Sale',
        views_count: 3,
        favorite_count: 0,
        created_at: '2026-10-01T10:00:00Z',
        updated_at: '2026-10-01T10:00:00Z',
        horse: { name: 'Bella', age: 7, year_of_birth: 2019, height: 165 },
        ...overrides,
    };
}

function httpError(status: number, message: string) {
    return new Error(`HTTP ${status}: ${JSON.stringify({ status: 'error', message })}`);
}

function signInAs(userId: string | undefined) {
    vi.mocked(useAuth).mockReturnValue({
        user: { id: userId, username: 'anna', email: 'anna@example.se' },
        token: 'tok',
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
        error: null,
    });
}

function renderPage(state?: unknown) {
    return render(
        <MemoryRouter initialEntries={[{ pathname: '/listings/p1/edit', state }]}>
            <Routes>
                <Route path="/listings/:id/edit" element={<EditProduct />} />
                <Route path="/listings/:id" element={<p>Listing page</p>} />
            </Routes>
        </MemoryRouter>
    );
}

async function renderLoadedForm(state?: unknown) {
    renderPage(state);
    await screen.findByRole('radio', { name: /Medium ·/ });
}

describe('EditProduct', () => {
    beforeEach(() => {
        vi.mocked(productsApi.getById).mockReset();
        vi.mocked(productsApi.updateProduct).mockReset();
        vi.mocked(paymentsApi.createCheckout).mockReset();
        vi.mocked(redirectToExternal).mockReset();
        signInAs('u1');
        vi.mocked(productsApi.getById).mockResolvedValue({ status: 'success', data: makeProduct() });
        vi.mocked(productsApi.updateProduct).mockResolvedValue({ status: 'success', data: makeProduct() });
        vi.mocked(horseAttributesApi.list).mockResolvedValue({ status: 'success', data: [] });
        vi.mocked(boostTiersApi.listActive).mockResolvedValue({ status: 'success', data: [medium] });
        vi.mocked(paymentsApi.listProviders).mockResolvedValue({ status: 'success', data: ['sandbox'] });
        vi.mocked(paymentsApi.createCheckout).mockResolvedValue({
            status: 'success',
            data: { payment_id: 'pay-1', checkout_url: 'https://pay.example/1' },
        });
    });

    it('prefills the form and locks the listing type', async () => {
        await renderLoadedForm();

        expect(screen.getByLabelText('Title')).toHaveValue('Calm gelding for sale');
        expect(screen.getByLabelText('City')).toHaveValue('Uppsala');
        expect(screen.getByLabelText('Name')).toHaveValue('Bella');
        expect(screen.getByLabelText('Category')).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
        expect(screen.queryByText(/may need admin approval again/)).not.toBeInTheDocument();
    });

    it('warns that editing a published listing may need approval again', async () => {
        vi.mocked(productsApi.getById).mockResolvedValue({
            status: 'success',
            data: makeProduct({ status: ProductStatus.Published }),
        });

        await renderLoadedForm();

        expect(screen.getByText('Changes to a published listing may need admin approval again')).toBeInTheDocument();
    });

    it('saves without status or coordinates, then opens the listing', async () => {
        const user = userEvent.setup();
        await renderLoadedForm();

        await user.clear(screen.getByLabelText('City'));
        await user.type(screen.getByLabelText('City'), 'Malmö');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(await screen.findByText('Listing page')).toBeInTheDocument();
        const [id, request] = vi.mocked(productsApi.updateProduct).mock.calls[0];
        expect(id).toBe('p1');
        expect(request).toMatchObject({ title: 'Calm gelding for sale', city: 'Malmö', horse: { name: 'Bella' } });
        expect(request).not.toHaveProperty('status');
        expect(request).not.toHaveProperty('latitude');
        expect(request).not.toHaveProperty('longitude');
        expect(request).not.toHaveProperty('boost');
    });

    it('starts checkout after saving when a boost is chosen', async () => {
        const user = userEvent.setup();
        await renderLoadedForm();

        await user.click(screen.getByRole('radio', { name: /Medium ·/ }));
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        await vi.waitFor(() => expect(redirectToExternal).toHaveBeenCalledWith('https://pay.example/1'));
        expect(paymentsApi.createCheckout).toHaveBeenCalledWith({ product_id: 'p1', tier_code: 'medium', provider: 'sandbox' });
        expect(productsApi.updateProduct).toHaveBeenCalledTimes(1);
    });

    it('says the changes were saved when only the boost fails', async () => {
        vi.mocked(paymentsApi.createCheckout).mockRejectedValue(httpError(502, 'payment provider unavailable'));
        const user = userEvent.setup();
        await renderLoadedForm();

        await user.click(screen.getByRole('radio', { name: /Medium ·/ }));
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            "Changes saved, but the boost couldn't start: payment provider unavailable"
        );
        expect(redirectToExternal).not.toHaveBeenCalled();
    });

    it('shows the save error from the server', async () => {
        vi.mocked(productsApi.updateProduct).mockRejectedValue(httpError(403, 'unauthorized to modify this product'));
        const user = userEvent.setup();
        await renderLoadedForm();

        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('unauthorized to modify this product');
        expect(paymentsApi.createCheckout).not.toHaveBeenCalled();
    });

    it("tells a non-owner they can't edit and shows no form", async () => {
        signInAs('someone-else');

        renderPage();

        expect(await screen.findByText('You can only edit your own listings')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    });

    it('shows the boost failure carried over from creating the listing', async () => {
        await renderLoadedForm({ boostError: 'payment provider unavailable' });

        expect(screen.getByRole('alert')).toHaveTextContent(
            "Listing created, but the boost couldn't start: payment provider unavailable. You can try again below."
        );
    });

    it('shows an error when the listing fails to load', async () => {
        vi.mocked(productsApi.getById).mockRejectedValue(httpError(500, 'Internal server error'));

        renderPage();

        expect(screen.getByText('Loading listing...')).toBeInTheDocument();
        expect(await screen.findByRole('alert')).toHaveTextContent('Internal server error');
    });
});
