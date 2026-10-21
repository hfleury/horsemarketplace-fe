import { useCallback, useEffect, useState } from 'react';
import { paymentsApi } from '../api/payments';
import type { PaymentStatusResponse } from '../types/payments';

export type PaymentLookup =
    | { state: 'missing' }
    | { state: 'loading' }
    | { state: 'loaded'; payment: PaymentStatusResponse }
    | { state: 'error' };

/**
 * Loads a payment's status once, and exposes `refresh` for polling. A failed
 * refresh keeps the last loaded result, so a network blip doesn't hide it.
 */
export function usePaymentLookup(paymentId: string | null): { lookup: PaymentLookup; refresh: () => Promise<void> } {
    const [fetched, setFetched] = useState<PaymentLookup>({ state: 'loading' });

    useEffect(() => {
        if (!paymentId) return;
        let active = true;
        loadPayment(paymentId).then((result) => {
            if (active) setFetched(keepLoadedOnError(result));
        });
        return () => {
            active = false;
        };
    }, [paymentId]);

    const refresh = useCallback(async () => {
        if (!paymentId) return;
        setFetched(keepLoadedOnError(await loadPayment(paymentId)));
    }, [paymentId]);

    return { lookup: paymentId ? fetched : { state: 'missing' }, refresh };
}

async function loadPayment(paymentId: string): Promise<PaymentLookup> {
    try {
        const response = await paymentsApi.getStatus(paymentId);
        if (response.status === 'success' && response.data) {
            return { state: 'loaded', payment: response.data };
        }
        return { state: 'error' };
    } catch {
        return { state: 'error' };
    }
}

function keepLoadedOnError(result: PaymentLookup) {
    return (current: PaymentLookup) => (result.state === 'error' && current.state === 'loaded' ? current : result);
}
