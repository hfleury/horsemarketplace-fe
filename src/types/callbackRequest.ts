export interface CreateCallbackRequestRequest {
    product_id: string;
    phone_number: string;
}

export interface CallbackRequest {
    id: string;
    product_id: string;
    buyer_id: string;
    phone_number: string;
    created_at: string;
}
