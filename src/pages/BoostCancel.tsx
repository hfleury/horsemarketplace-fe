import { useSearchParams } from 'react-router-dom';
import { BoostResultCard } from '../components/payments/BoostResultCard';
import { usePaymentLookup } from '../hooks/usePaymentLookup';

/**
 * Where the payment provider sends the seller back when they cancel. The
 * pending payment is left for the provider to expire; this page never fails it.
 */
export const BoostCancel = () => {
    const [searchParams] = useSearchParams();
    const { lookup } = usePaymentLookup(searchParams.get('payment_id'));
    const listingLink = lookup.state === 'loaded' ? `/listings/${lookup.payment.product_id}` : null;

    return (
        <BoostResultCard
            title="Payment cancelled"
            linkTo={listingLink ?? '/'}
            linkLabel={listingLink ? 'Back to your listing' : 'Go to the home page'}
        >
            <p>You have not been charged. You can boost your listing again at any time.</p>
        </BoostResultCard>
    );
};

export default BoostCancel;
