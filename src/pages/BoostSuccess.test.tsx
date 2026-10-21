import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BoostSuccess } from './BoostSuccess';
import { paymentsApi } from '../api/payments';
import type { PaymentStatus, PaymentStatusResponse } from '../types/payments';

vi.mock('../api/payments', () => ({
    paymentsApi: { getStatus: vi.fn() },
}));

const POLL_INTERVAL_MS = 20;
const MAX_WAIT_MS = 150;

function paymentWith(status: PaymentStatus) {
    const payment: PaymentStatusResponse = {
        payment_id: 'pay-1',
        status,
        tier: 'medium',
        product_id: 'listing-1',
        starts_at: '2026-12-24T08:00:00Z',
        expires_at: '2027-01-07T08:00:00Z',
    };
    return { status: 'success', data: payment };
}

// Real timers with short intervals: mixing fake timers with waitFor is flaky here (learnings HM-156).
function renderPage(query = '?payment_id=pay-1') {
    return render(
        <MemoryRouter initialEntries={[`/boost/success${query}`]}>
            <BoostSuccess pollIntervalMs={POLL_INTERVAL_MS} maxWaitMs={MAX_WAIT_MS} />
        </MemoryRouter>
    );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('BoostSuccess', () => {
    beforeEach(() => {
        vi.mocked(paymentsApi.getStatus).mockReset();
    });

    it('shows the confirmed boost window when the payment is already paid', async () => {
        vi.mocked(paymentsApi.getStatus).mockResolvedValue(paymentWith('paid'));

        renderPage();

        expect(await screen.findByRole('heading', { name: 'Your boost is confirmed' })).toBeInTheDocument();
        expect(screen.getByText(/2026-12-24 09:00 to 2027-01-07 09:00/)).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View your listing' })).toHaveAttribute('href', '/listings/listing-1');
        expect(paymentsApi.getStatus).toHaveBeenCalledWith('pay-1');
    });

    it('polls while pending and shows the confirmation once paid', async () => {
        vi.mocked(paymentsApi.getStatus)
            .mockResolvedValueOnce(paymentWith('pending'))
            .mockResolvedValueOnce(paymentWith('pending'))
            .mockResolvedValue(paymentWith('paid'));

        renderPage();

        expect(await screen.findByRole('heading', { name: 'Confirming your payment…' })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Your boost is confirmed' })).toBeInTheDocument();
        expect(paymentsApi.getStatus).toHaveBeenCalledTimes(3);
    });

    it('stops polling once the payment is no longer pending', async () => {
        vi.mocked(paymentsApi.getStatus)
            .mockResolvedValueOnce(paymentWith('pending'))
            .mockResolvedValue(paymentWith('paid'));

        renderPage();
        await screen.findByRole('heading', { name: 'Your boost is confirmed' });
        const callsWhenPaid = vi.mocked(paymentsApi.getStatus).mock.calls.length;
        await sleep(POLL_INTERVAL_MS * 4);

        expect(paymentsApi.getStatus).toHaveBeenCalledTimes(callsWhenPaid);
    });

    it.each([
        ['failed', 'Payment failed', /you have not been charged/i],
        ['refunded', 'Payment refunded', /the boost is not active/i],
    ] as const)('shows the %s state', async (status, heading, message) => {
        vi.mocked(paymentsApi.getStatus).mockResolvedValue(paymentWith(status));

        renderPage();

        expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
        expect(screen.getByText(message)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Back to your listing' })).toHaveAttribute('href', '/listings/listing-1');
    });

    it('gives up polling with a "still processing" message after the wait limit', async () => {
        vi.mocked(paymentsApi.getStatus).mockResolvedValue(paymentWith('pending'));

        renderPage();

        expect(await screen.findByRole('heading', { name: 'Payment still processing' }, { timeout: MAX_WAIT_MS * 5 })).toBeInTheDocument();
        const callsAtTimeout = vi.mocked(paymentsApi.getStatus).mock.calls.length;
        await sleep(POLL_INTERVAL_MS * 4);
        expect(paymentsApi.getStatus).toHaveBeenCalledTimes(callsAtTimeout);
    });

    it('keeps showing the pending state when a later poll fails', async () => {
        vi.mocked(paymentsApi.getStatus)
            .mockResolvedValueOnce(paymentWith('pending'))
            .mockRejectedValue(new Error('Network error'));

        renderPage();
        await screen.findByRole('heading', { name: 'Confirming your payment…' });
        await waitFor(() => expect(vi.mocked(paymentsApi.getStatus).mock.calls.length).toBeGreaterThan(2));

        expect(screen.getByRole('heading', { name: 'Confirming your payment…' })).toBeInTheDocument();
    });

    it('explains a link without a payment reference and makes no request', () => {
        renderPage('');

        expect(screen.getByRole('heading', { name: 'Payment not found' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
        expect(paymentsApi.getStatus).not.toHaveBeenCalled();
    });

    it.each([
        ['the request fails', () => vi.mocked(paymentsApi.getStatus).mockRejectedValue(new Error('HTTP 404: not found'))],
        ['the response is not a success', () => vi.mocked(paymentsApi.getStatus).mockResolvedValue({ status: 'error', message: 'nope' })],
    ])('shows an error when %s', async (_name, arrange) => {
        arrange();

        renderPage();

        expect(await screen.findByRole('heading', { name: "We couldn't load this payment" })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
    });
});
