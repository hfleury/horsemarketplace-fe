import { describe, it, expect } from 'vitest';
import { listingsSearchedProperties, listingViewedProperties } from './analyticsEvents';
import type { Product } from '../types/product';

describe('listingsSearchedProperties', () => {
    it('sends filter names but never the keyword text', () => {
        const properties = listingsSearchedProperties(
            { q: 'my secret search', category_id: 'cat-1', breed: 'Arabian', gender: '', min_price: 0 },
            2,
            17
        );

        expect(properties).toEqual({
            filters: ['breed', 'category_id', 'min_price', 'q'],
            category_id: 'cat-1',
            page: 2,
            result_count: 17,
        });
        expect(JSON.stringify(properties)).not.toContain('my secret search');
    });
});

describe('listingViewedProperties', () => {
    it('sends the listing id, category and type', () => {
        const product = { id: 'p-1', category_id: 'cat-1', type: 'horse', title: 'Bella', price_sek: 50000 } as Product;

        expect(listingViewedProperties(product)).toEqual({ listing_id: 'p-1', category_id: 'cat-1', listing_type: 'horse' });
    });
});
