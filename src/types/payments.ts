export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface CheckoutRequest {
    product_id: string;
    tier_code: string;
    provider: string;
    /** RFC 3339. Omitted or in the past means the boost starts now. */
    starts_at?: string;
}

export interface CheckoutResponse {
    payment_id: string;
    /** Send the browser here to pay. */
    checkout_url: string;
}

/** The boost window shifts to the confirmation time if payment confirms late. */
export interface PaymentStatusResponse {
    payment_id: string;
    status: PaymentStatus;
    tier: string;
    product_id: string;
    starts_at: string;
    expires_at: string;
}
