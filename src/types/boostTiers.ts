/** A boost plan sellers can buy. price_sek includes 25% moms. */
export interface BoostTier {
    id: string;
    code: string;
    name: string;
    price_sek: number;
    duration_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BoostTierFormValues {
    code: string;
    name: string;
    price_sek: number;
    duration_days: number;
}

export type CreateBoostTierRequest = BoostTierFormValues;

/** Full replace of every editable field; code is immutable. */
export interface UpdateBoostTierRequest {
    name: string;
    price_sek: number;
    duration_days: number;
    is_active: boolean;
}
