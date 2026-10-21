import { describe, it, expect } from 'vitest';
import { productToFormValues, splitBoostSelection, toUpdateRequest } from './productFormValues';
import type { ProductFormValues } from './productFormValues';
import type { Product } from '../../types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'p1',
        user_id: 'u1',
        type: 'horse',
        status: 'published',
        title: 'Calm gelding',
        price_sek: 45000,
        description: 'A calm and friendly gelding for anyone',
        city: 'Uppsala',
        area: 'Centrum',
        transaction_type: 'Rent',
        views_count: 3,
        favorite_count: 1,
        created_at: '2026-10-01T10:00:00Z',
        updated_at: '2026-10-01T10:00:00Z',
        ...overrides,
    };
}

const baseValues: ProductFormValues = {
    title: 'Calm gelding',
    type: 'horse',
    status: 'published',
    price_sek: 45000,
    description: 'A calm and friendly gelding for anyone',
    city: 'Uppsala',
    transaction_type: 'Sale',
    latitude: 59.8,
    longitude: 17.6,
    horse: { name: 'Bella' },
};

describe('productToFormValues', () => {
    it('maps the shared fields and starts with no boost chosen', () => {
        const values = productToFormValues(makeProduct());

        expect(values).toMatchObject({
            title: 'Calm gelding',
            type: 'horse',
            price_sek: 45000,
            description: 'A calm and friendly gelding for anyone',
            city: 'Uppsala',
            area: 'Centrum',
            transaction_type: 'Rent',
            boost: { tier_code: '' },
        });
    });

    it('defaults missing strings to empty and leaves a missing price unset', () => {
        const values = productToFormValues(
            makeProduct({ description: undefined, city: undefined, area: undefined, price_sek: undefined })
        );

        expect(values.description).toBe('');
        expect(values.city).toBe('');
        expect(values.area).toBe('');
        expect(values.price_sek).toBeUndefined();
    });

    it('copies only the sub-object for the listing type, without pedigree, product_id or nulls', () => {
        const horse = {
            product_id: 'p1',
            name: 'Bella',
            breed: 'Arabian',
            color: null,
            pedigree: { sire: 'X' },
        } as unknown as Product['horse'];

        const values = productToFormValues(makeProduct({ horse, vehicle: { make: 'Volvo' } }));

        expect(values.horse).toEqual({ name: 'Bella', breed: 'Arabian' });
        expect(values.vehicle).toBeUndefined();
    });

    it('copies the vehicle sub-object for a vehicle listing', () => {
        const values = productToFormValues(makeProduct({ type: 'vehicle', vehicle: { make: 'Volvo', year: 2019 } }));

        expect(values.vehicle).toEqual({ make: 'Volvo', year: 2019 });
        expect(values.horse).toBeUndefined();
    });
});

describe('splitBoostSelection', () => {
    it('returns no boost when no tier is chosen', () => {
        const { product, boost } = splitBoostSelection({ ...baseValues, boost: { tier_code: '', provider: 'sandbox' } });

        expect(boost).toBeNull();
        expect(product).not.toHaveProperty('boost');
        expect(product.title).toBe('Calm gelding');
    });

    it('returns the tier and provider, without starts_at when no date is picked', () => {
        const { boost } = splitBoostSelection({ ...baseValues, boost: { tier_code: 'medium', provider: 'sandbox', starts_on: '' } });

        expect(boost).toEqual({ tier_code: 'medium', provider: 'sandbox' });
    });

    it('sends a picked date as Stockholm midnight', () => {
        const { boost } = splitBoostSelection({
            ...baseValues,
            boost: { tier_code: 'pro', provider: 'sandbox', starts_on: '2026-12-24' },
        });

        expect(boost).toEqual({ tier_code: 'pro', provider: 'sandbox', starts_at: '2026-12-24T00:00:00+01:00' });
    });
});

describe('toUpdateRequest', () => {
    it('drops status and coordinates and keeps everything else', () => {
        const request = toUpdateRequest(baseValues);

        expect(request).not.toHaveProperty('status');
        expect(request).not.toHaveProperty('latitude');
        expect(request).not.toHaveProperty('longitude');
        expect(request).toMatchObject({ title: 'Calm gelding', city: 'Uppsala', horse: { name: 'Bella' } });
    });
});
