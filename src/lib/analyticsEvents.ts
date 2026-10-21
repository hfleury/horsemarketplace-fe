import type { Product } from '../types/product';
import type { SearchCriteria } from '../types/searchCriteria';

// Builds the properties for browser analytics events. Only filter names are
// sent for a search, never the values typed in (such as the keyword).

function appliedFilterNames(criteria: SearchCriteria): string[] {
    return Object.entries(criteria)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([name]) => name)
        .sort();
}

export function listingsSearchedProperties(criteria: SearchCriteria, page: number, resultCount: number) {
    return {
        filters: appliedFilterNames(criteria),
        category_id: criteria.category_id,
        page,
        result_count: resultCount,
    };
}

export function listingViewedProperties(product: Product) {
    return {
        listing_id: product.id,
        category_id: product.category_id,
        listing_type: product.type,
    };
}
