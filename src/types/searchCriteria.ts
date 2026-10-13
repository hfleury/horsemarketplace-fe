// Mirrors the GET /api/v1/products query params, which are also the keys of a saved search's criteria.
export interface SearchCriteria {
    q?: string;
    category_id?: string;
    breed?: string;
    gender?: string;
    discipline?: string;
    min_age?: number;
    max_age?: number;
    min_height?: number;
    max_height?: number;
    min_price?: number;
    max_price?: number;
    lat?: number;
    lng?: number;
    radius_km?: number;
}
