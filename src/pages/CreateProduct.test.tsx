import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import CreateProduct from './CreateProduct';
import { productsApi } from '../api/products';
import { paymentsApi } from '../api/payments';
import { boostTiersApi } from '../api/boostTiers';
import { horseAttributesApi } from '../api/horseAttributesApi';
import { redirectToExternal } from '../lib/redirect';
import { getCurrentPosition } from '../lib/geolocation';
import type { BoostTier } from '../types/boostTiers';
import type { Product } from '../types/product';

vi.mock('../api/products', () => ({ productsApi: { createProduct: vi.fn() } }));
vi.mock('../api/payments', () => ({ paymentsApi: { listProviders: vi.fn(), createCheckout: vi.fn() } }));
vi.mock('../api/boostTiers', () => ({ boostTiersApi: { listActive: vi.fn() } }));
vi.mock('../api/horseAttributesApi', () => ({ horseAttributesApi: { list: vi.fn() } }));
vi.mock('../lib/redirect', () => ({ redirectToExternal: vi.fn() }));
vi.mock('../lib/geolocation', () => ({ getCurrentPosition: vi.fn() }));

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

const createdListing = { id: 'new-1', status: 'pending_approval' } as Product;

function httpError(status: number, message: string) {
    return new Error(`HTTP ${status}: ${JSON.stringify({ status: 'error', message })}`);
}

function EditRouteProbe() {
    const location = useLocation();
    return <p>Edit page: {(location.state as { boostError?: string } | null)?.boostError}</p>;
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/create-ad']}>
            <Routes>
                <Route path="/create-ad" element={<CreateProduct />} />
                <Route path="/listings/:id" element={<p>Listing page</p>} />
                <Route path="/listings/:id/edit" element={<EditRouteProbe />} />
            </Routes>
        </MemoryRouter>
    );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>, { horseName = 'Bella' } = {}) {
    await user.type(screen.getByLabelText('Title'), 'Calm gelding for sale');
    await user.type(screen.getByLabelText('Price (SEK)'), '45000');
    await user.type(screen.getByPlaceholderText('Describe your item in detail...'), 'A calm and friendly gelding for anyone');
    await user.type(screen.getByLabelText('City'), 'Uppsala');
    if (horseName) await user.type(screen.getByLabelText('Name'), horseName);
    // Empty number inputs fail validation as NaN (existing form behaviour), so fill them.
    await user.type(screen.getByLabelText('Age'), '7');
    await user.type(screen.getByLabelText('Year of Birth'), '2019');
    await user.type(screen.getByLabelText('Height (cm)'), '165');
}

async function chooseMediumTier(user: ReturnType<typeof userEvent.setup>) {
    await user.click(await screen.findByRole('radio', { name: /Medium ·/ }));
}

describe('CreateProduct', () => {
    beforeEach(() => {
        vi.mocked(productsApi.createProduct).mockReset();
        vi.mocked(paymentsApi.createCheckout).mockReset();
        vi.mocked(redirectToExternal).mockReset();
        vi.mocked(getCurrentPosition).mockResolvedValue(null);
        vi.mocked(horseAttributesApi.list).mockResolvedValue({ status: 'success', data: [] });
        vi.mocked(boostTiersApi.listActive).mockResolvedValue({ status: 'success', data: [medium] });
        vi.mocked(paymentsApi.listProviders).mockResolvedValue({ status: 'success', data: ['sandbox'] });
        vi.mocked(productsApi.createProduct).mockResolvedValue({ status: 'success', data: createdListing });
        vi.mocked(paymentsApi.createCheckout).mockResolvedValue({
            status: 'success',
            data: { payment_id: 'pay-1', checkout_url: 'https://pay.example/1' },
        });
    });

    it('creates a listing without a boost and opens it', async () => {
        vi.mocked(getCurrentPosition).mockResolvedValue({ lat: 59.8, lng: 17.6 });
        const user = userEvent.setup();
        renderPage();
        await screen.findByRole('radio', { name: 'No boost' });

        await fillRequiredFields(user);
        await user.click(screen.getByRole('button', { name: 'Publish Ad' }));

        expect(await screen.findByText('Listing page')).toBeInTheDocument();
        const [request] = vi.mocked(productsApi.createProduct).mock.calls[0];
        expect(request).toMatchObject({
            title: 'Calm gelding for sale',
            price_sek: 45000,
            city: 'Uppsala',
            status: 'published',
            latitude: 59.8,
            longitude: 17.6,
            horse: { name: 'Bella' },
        });
        expect(request).not.toHaveProperty('boost');
        expect(paymentsApi.createCheckout).not.toHaveBeenCalled();
    });

    it('starts checkout for the new listing with the only provider and redirects', async () => {
        const user = userEvent.setup();
        renderPage();

        await fillRequiredFields(user);
        await chooseMediumTier(user);
        await user.click(screen.getByRole('button', { name: 'Publish Ad' }));

        await vi.waitFor(() => expect(redirectToExternal).toHaveBeenCalledWith('https://pay.example/1'));
        expect(paymentsApi.createCheckout).toHaveBeenCalledWith({ product_id: 'new-1', tier_code: 'medium', provider: 'sandbox' });
    });

    it('sends a picked start date as Stockholm midnight', async () => {
        const user = userEvent.setup();
        renderPage();

        await fillRequiredFields(user);
        await chooseMediumTier(user);
        fireEvent.change(screen.getByLabelText(/Start date/), { target: { value: '2026-12-24' } });
        await user.click(screen.getByRole('button', { name: 'Publish Ad' }));

        await vi.waitFor(() =>
            expect(paymentsApi.createCheckout).toHaveBeenCalledWith({
                product_id: 'new-1',
                tier_code: 'medium',
                provider: 'sandbox',
                starts_at: '2026-12-24T00:00:00+01:00',
            })
        );
    });

    it('lands on the edit page with the reason when checkout fails after creating', async () => {
        vi.mocked(paymentsApi.createCheckout).mockRejectedValue(httpError(502, 'payment provider unavailable'));
        const user = userEvent.setup();
        renderPage();

        await fillRequiredFields(user);
        await chooseMediumTier(user);
        await user.click(screen.getByRole('button', { name: 'Publish Ad' }));

        expect(await screen.findByText('Edit page: payment provider unavailable')).toBeInTheDocument();
        expect(productsApi.createProduct).toHaveBeenCalledTimes(1);
        expect(redirectToExternal).not.toHaveBeenCalled();
    });

    it('shows the server message and never starts checkout when creating fails', async () => {
        vi.mocked(productsApi.createProduct).mockRejectedValue(httpError(500, 'Failed to create product'));
        const user = userEvent.setup();
        renderPage();

        await fillRequiredFields(user);
        await chooseMediumTier(user);
        await user.click(screen.getByRole('button', { name: 'Publish Ad' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Failed to create product');
        expect(paymentsApi.createCheckout).not.toHaveBeenCalled();
    });

    it('still requires the horse name', async () => {
        const user = userEvent.setup();
        renderPage();

        await fillRequiredFields(user, { horseName: '' });
        await user.click(screen.getByRole('button', { name: 'Publish Ad' }));

        expect(await screen.findByText(/Horse name (is )?required/)).toBeInTheDocument();
        expect(productsApi.createProduct).not.toHaveBeenCalled();
    });
});
