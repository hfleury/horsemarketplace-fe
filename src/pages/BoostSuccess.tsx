import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BoostResultCard } from '../components/payments/BoostResultCard';
import { usePaymentLookup } from '../hooks/usePaymentLookup';
import { usePolling } from '../hooks/usePolling';
import { formatSwedishDateTime } from '../lib/formatDateTime';
import type { PaymentStatusResponse } from '../types/payments';

interface BoostSuccessProps {
    pollIntervalMs?: number;
    /** How long to wait for the provider's confirmation before giving up polling. */
    maxWaitMs?: number;
}

/** Where the payment provider sends the seller back after checkout. */
export const BoostSuccess = ({ pollIntervalMs = 2000, maxWaitMs = 30000 }: BoostSuccessProps) => {
    const [searchParams] = useSearchParams();
    const { lookup, refresh } = usePaymentLookup(searchParams.get('payment_id'));
    const [timedOut, setTimedOut] = useState(false);

    const isPending = lookup.state === 'loaded' && lookup.payment.status === 'pending';
    usePolling(refresh, pollIntervalMs, isPending && !timedOut);

    useEffect(() => {
        if (!isPending) return;
        const timeoutId = setTimeout(() => setTimedOut(true), maxWaitMs);
        return () => clearTimeout(timeoutId);
    }, [isPending, maxWaitMs]);

    switch (lookup.state) {
        case 'missing':
            return (
                <BoostResultCard title="Payment not found" linkTo="/" linkLabel="Go to the home page">
                    <p>This link is missing its payment reference.</p>
                </BoostResultCard>
            );
        case 'loading':
            return (
                <BoostResultCard title="Checking your payment…" linkTo="/" linkLabel="Go to the home page">
                    <p>This only takes a moment.</p>
                </BoostResultCard>
            );
        case 'error':
            return (
                <BoostResultCard title="We couldn't load this payment" linkTo="/" linkLabel="Go to the home page">
                    <p>Please try again in a moment. If you were charged, we'll email you when your boost is confirmed.</p>
                </BoostResultCard>
            );
        case 'loaded':
            return <PaymentResult payment={lookup.payment} timedOut={timedOut} />;
    }
};

const PaymentResult = ({ payment, timedOut }: { payment: PaymentStatusResponse; timedOut: boolean }) => {
    const listingLink = `/listings/${payment.product_id}`;

    switch (payment.status) {
        case 'pending':
            return timedOut ? (
                <BoostResultCard title="Payment still processing" linkTo={listingLink} linkLabel="Back to your listing">
                    <p>Your payment hasn't been confirmed yet. Check back shortly — we'll email you as soon as your boost is confirmed.</p>
                </BoostResultCard>
            ) : (
                <BoostResultCard title="Confirming your payment…" linkTo={listingLink} linkLabel="Back to your listing">
                    <p>We're waiting for the payment provider. Please keep this page open.</p>
                </BoostResultCard>
            );
        case 'paid':
            return (
                <BoostResultCard title="Your boost is confirmed" linkTo={listingLink} linkLabel="View your listing">
                    <p>
                        Your <span className="capitalize font-bold">{payment.tier}</span> boost runs from{' '}
                        {formatSwedishDateTime(payment.starts_at)} to {formatSwedishDateTime(payment.expires_at)} (Swedish time).
                    </p>
                    <p>We've emailed you a confirmation.</p>
                </BoostResultCard>
            );
        case 'failed':
            return (
                <BoostResultCard title="Payment failed" linkTo={listingLink} linkLabel="Back to your listing">
                    <p>The payment didn't go through, and you have not been charged.</p>
                </BoostResultCard>
            );
        case 'refunded':
            return (
                <BoostResultCard title="Payment refunded" linkTo={listingLink} linkLabel="Back to your listing">
                    <p>This payment was refunded, so the boost is not active.</p>
                </BoostResultCard>
            );
    }
};

export default BoostSuccess;
