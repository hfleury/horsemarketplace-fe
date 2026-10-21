import { paymentsApi } from '../../api/payments';
import type { BoostSelection } from '../../types/payments';
import { redirectToExternal } from '../redirect';

/** Starts paying for a boost and sends the browser to the provider. */
export async function startBoostCheckout(productId: string, boost: BoostSelection): Promise<void> {
    const response = await paymentsApi.createCheckout({ product_id: productId, ...boost });
    if (response.status !== 'success' || !response.data) {
        throw new Error(response.message || 'The payment could not be started');
    }
    redirectToExternal(response.data.checkout_url);
}
