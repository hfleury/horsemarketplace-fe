import type { DefaultValues } from 'react-hook-form';
import { ProductType } from '../../types/product';
import type { CreateProductRequest, Product, UpdateProductRequest } from '../../types/product';
import type { BoostSelection } from '../../types/payments';
import { toStockholmStartOfDay } from '../stockholmDate';

/** The boost part of the listing form; '' means "not chosen". */
export interface BoostSelectionInput {
    tier_code?: string;
    provider?: string;
    /** A Stockholm calendar date, "YYYY-MM-DD". */
    starts_on?: string;
}

export type ProductFormValues = CreateProductRequest & { boost?: BoostSelectionInput };

// The API sends these on the per-type objects, but the form never edits them.
const NON_EDITABLE_SPECIFIC_FIELDS = new Set(['product_id', 'pedigree']);

/** Drops nulls (the API's "not set") and fields the form doesn't edit. */
function editableSpecifics<T extends object>(specifics: T | undefined): T | undefined {
    if (!specifics) return undefined;
    const entries = Object.entries(specifics).filter(
        ([key, value]) => value !== null && !NON_EDITABLE_SPECIFIC_FIELDS.has(key)
    );
    return Object.fromEntries(entries) as T;
}

function specificsFor(product: Product): Pick<ProductFormValues, 'horse' | 'vehicle' | 'equipment'> {
    switch (product.type) {
        case ProductType.Horse:
            return { horse: editableSpecifics(product.horse) };
        case ProductType.Vehicle:
            return { vehicle: editableSpecifics(product.vehicle) };
        case ProductType.Equipment:
            return { equipment: editableSpecifics(product.equipment) };
        default:
            return {};
    }
}

/** Prefills the listing form from a saved listing. */
export function productToFormValues(product: Product): DefaultValues<ProductFormValues> {
    return {
        title: product.title,
        type: product.type,
        status: product.status,
        price_sek: product.price_sek ?? undefined,
        description: product.description ?? '',
        city: product.city ?? '',
        area: product.area ?? '',
        transaction_type: product.transaction_type ?? 'Sale',
        ...specificsFor(product),
        boost: { tier_code: '' },
    };
}

/** Separates the listing payload from the optional boost the seller picked. */
export function splitBoostSelection(values: ProductFormValues): {
    product: CreateProductRequest;
    boost: BoostSelection | null;
} {
    const { boost, ...product } = values;
    if (!boost?.tier_code) return { product, boost: null };

    return {
        product,
        boost: {
            tier_code: boost.tier_code,
            provider: boost.provider ?? '',
            ...(boost.starts_on ? { starts_at: toStockholmStartOfDay(boost.starts_on) } : {}),
        },
    };
}

/** The server owns status and coordinates on edit, so they are never sent. */
export function toUpdateRequest(product: CreateProductRequest): UpdateProductRequest {
    const request: Partial<CreateProductRequest> = { ...product };
    delete request.status;
    delete request.latitude;
    delete request.longitude;
    return request as UpdateProductRequest;
}
