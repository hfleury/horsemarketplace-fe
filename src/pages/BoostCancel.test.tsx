import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BoostCancel } from './BoostCancel';
import { paymentsApi } from '../api/payments';

vi.mock('../api/payments', () => ({
    paymentsApi: { getStatus: vi.fn() },
}));

function renderPage(query: string) {
    return render(
        <MemoryRouter initialEntries={[`/boost/cancel${query}`]}>
            <BoostCancel />
        </MemoryRouter>
    );
}

describe('BoostCancel', () => {
    beforeEach(() => {
        vi.mocked(paymentsApi.getStatus).mockReset();
    });

    it('links back to the listing when the payment resolves', async () => {
        vi.mocked(paymentsApi.getStatus).mockResolvedValue({
            status: 'success',
            data: {
                payment_id: 'pay-1',
                status: 'pending',
                tier: 'boost',
                product_id: 'listing-1',
                starts_at: '2026-12-24T08:00:00Z',
                expires_at: '2026-12-31T08:00:00Z',
            },
        });

        renderPage('?payment_id=pay-1');

        expect(screen.getByRole('heading', { name: 'Payment cancelled' })).toBeInTheDocument();
        expect(screen.getByText(/you have not been charged/i)).toBeInTheDocument();
        expect(await screen.findByRole('link', { name: 'Back to your listing' })).toHaveAttribute('href', '/listings/listing-1');
        expect(paymentsApi.getStatus).toHaveBeenCalledWith('pay-1');
    });

    it('links home without a payment reference and makes no request', () => {
        renderPage('');

        expect(screen.getByText(/you have not been charged/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
        expect(paymentsApi.getStatus).not.toHaveBeenCalled();
    });

    it('links home when the payment cannot be loaded', async () => {
        vi.mocked(paymentsApi.getStatus).mockRejectedValue(new Error('HTTP 404: not found'));

        renderPage('?payment_id=pay-1');

        await vi.waitFor(() => expect(paymentsApi.getStatus).toHaveBeenCalled());
        expect(screen.getByRole('heading', { name: 'Payment cancelled' })).toBeInTheDocument();
        expect(await screen.findByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
    });
});
