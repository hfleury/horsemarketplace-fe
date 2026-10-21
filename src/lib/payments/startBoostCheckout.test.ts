import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startBoostCheckout } from './startBoostCheckout';
import { paymentsApi } from '../../api/payments';
import { redirectToExternal } from '../redirect';

vi.mock('../../api/payments', () => ({
    paymentsApi: { createCheckout: vi.fn() },
}));
vi.mock('../redirect', () => ({
    redirectToExternal: vi.fn(),
}));

const checkoutUrl = 'https://pay.example/checkout/123';

describe('startBoostCheckout', () => {
    beforeEach(() => {
        vi.mocked(paymentsApi.createCheckout).mockReset();
        vi.mocked(redirectToExternal).mockReset();
        vi.mocked(paymentsApi.createCheckout).mockResolvedValue({
            status: 'success',
            data: { payment_id: 'pay-1', checkout_url: checkoutUrl },
        });
    });

    it('starts checkout for the listing and redirects to the provider', async () => {
        await startBoostCheckout('p1', { tier_code: 'medium', provider: 'sandbox' });

        expect(paymentsApi.createCheckout).toHaveBeenCalledWith({ product_id: 'p1', tier_code: 'medium', provider: 'sandbox' });
        expect(redirectToExternal).toHaveBeenCalledWith(checkoutUrl);
    });

    it('sends starts_at when the boost has one', async () => {
        await startBoostCheckout('p1', { tier_code: 'pro', provider: 'sandbox', starts_at: '2026-12-24T00:00:00+01:00' });

        expect(paymentsApi.createCheckout).toHaveBeenCalledWith({
            product_id: 'p1',
            tier_code: 'pro',
            provider: 'sandbox',
            starts_at: '2026-12-24T00:00:00+01:00',
        });
    });

    it('propagates a rejected checkout without redirecting', async () => {
        vi.mocked(paymentsApi.createCheckout).mockRejectedValue(new Error('HTTP 502: {}'));

        await expect(startBoostCheckout('p1', { tier_code: 'pro', provider: 'sandbox' })).rejects.toThrow('HTTP 502');
        expect(redirectToExternal).not.toHaveBeenCalled();
    });

    it('throws when the response carries no checkout', async () => {
        vi.mocked(paymentsApi.createCheckout).mockResolvedValue({ status: 'error', message: 'payment provider unavailable' });

        await expect(startBoostCheckout('p1', { tier_code: 'pro', provider: 'sandbox' })).rejects.toThrow(
            'payment provider unavailable'
        );
        expect(redirectToExternal).not.toHaveBeenCalled();
    });
});
