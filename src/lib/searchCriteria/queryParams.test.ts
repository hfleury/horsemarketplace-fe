import { describe, it, expect } from 'vitest';
import {
    RADIUS_OPTIONS_KM,
    criteriaFromQueryParams,
    criteriaToQueryParams,
    findSaveBlocker,
} from './queryParams';
import type { SearchCriteria } from '../../types/searchCriteria';

const STOCKHOLM = { lat: 59.3293, lng: 18.0686, radius_km: 50 };

const FULL_CRITERIA: SearchCriteria = {
    q: 'saddle',
    category_id: 'cat-1',
    breed: 'Arabian',
    gender: 'Mare',
    discipline: 'Dressage',
    min_age: 3,
    max_age: 8,
    min_height: 150,
    max_height: 170,
    min_price: 10000,
    max_price: 50000,
    ...STOCKHOLM,
};

function roundTrip(criteria: SearchCriteria): SearchCriteria {
    return criteriaFromQueryParams(criteriaToQueryParams(criteria));
}

describe('criteriaToQueryParams / criteriaFromQueryParams', () => {
    it.each<[string, SearchCriteria, string]>([
        ['q', { q: 'saddle' }, 'q=saddle'],
        ['category_id', { category_id: 'cat-1' }, 'category_id=cat-1'],
        ['breed', { breed: 'Arabian' }, 'breed=Arabian'],
        ['gender', { gender: 'Mare' }, 'gender=Mare'],
        ['discipline', { discipline: 'Dressage' }, 'discipline=Dressage'],
        ['min_age', { min_age: 3 }, 'min_age=3'],
        ['max_age', { max_age: 8 }, 'max_age=8'],
        ['min_height', { min_height: 150 }, 'min_height=150'],
        ['max_height', { max_height: 170 }, 'max_height=170'],
        ['min_price', { min_price: 10000 }, 'min_price=10000'],
        ['max_price', { max_price: 50000 }, 'max_price=50000'],
        ['lat/lng/radius_km', STOCKHOLM, 'lat=59.3293&lng=18.0686&radius_km=50'],
    ])('maps %s to its snake_case query key and round-trips', (_name, criteria, expected) => {
        expect(criteriaToQueryParams(criteria).toString()).toBe(expected);
        expect(roundTrip(criteria)).toEqual(criteria);
    });

    it('writes every key in a deterministic order', () => {
        expect(criteriaToQueryParams(FULL_CRITERIA).toString()).toBe(
            'q=saddle&category_id=cat-1&breed=Arabian&gender=Mare&discipline=Dressage' +
                '&min_age=3&max_age=8&min_height=150&max_height=170&min_price=10000&max_price=50000' +
                '&lat=59.3293&lng=18.0686&radius_km=50'
        );
        expect(roundTrip(FULL_CRITERIA)).toEqual(FULL_CRITERIA);
    });

    it('trims strings and drops empty or whitespace-only strings in both directions', () => {
        expect(criteriaToQueryParams({ q: '  saddle ', breed: '', gender: '   ' }).toString()).toBe('q=saddle');
        expect(criteriaFromQueryParams(new URLSearchParams('q=%20saddle%20&breed=&gender=%20%20'))).toEqual({
            q: 'saddle',
        });
    });

    it.each(['abc', '', 'NaN', 'Infinity'])('drops the invalid number %j', (raw) => {
        expect(criteriaFromQueryParams(new URLSearchParams({ min_price: raw }))).toEqual({});
    });

    it('keeps zero rather than treating it as missing', () => {
        expect(criteriaToQueryParams({ min_price: 0 }).toString()).toBe('min_price=0');
        expect(criteriaFromQueryParams(new URLSearchParams('min_price=0'))).toEqual({ min_price: 0 });
    });

    it('keeps decimal and negative numbers when reading', () => {
        expect(criteriaFromQueryParams(new URLSearchParams('min_age=3.5&max_price=-10'))).toEqual({
            min_age: 3.5,
            max_price: -10,
        });
    });

    it.each(['lat=59.3', 'lat=59.3&lng=18.1', 'lng=18.1&radius_km=50'])('drops the partial location %s', (query) => {
        expect(criteriaFromQueryParams(new URLSearchParams(query))).toEqual({});
    });

    it('drops the whole location when the radius is not one of the options', () => {
        expect(criteriaFromQueryParams(new URLSearchParams('lat=59.3&lng=18.1&radius_km=30'))).toEqual({});
    });

    it.each(RADIUS_OPTIONS_KM)('accepts the radius option %i', (radiusKm) => {
        const criteria = { lat: 59.3, lng: 18.1, radius_km: radiusKm };
        expect(roundTrip(criteria)).toEqual(criteria);
    });
});

describe('findSaveBlocker', () => {
    it('returns null for valid criteria', () => {
        expect(findSaveBlocker(FULL_CRITERIA)).toBeNull();
    });

    it('requires at least one criterion', () => {
        expect(findSaveBlocker({})).toBe('Choose at least one filter to save this search.');
    });

    it.each<[SearchCriteria]>([[{ min_age: -1 }], [{ max_height: -1 }], [{ min_price: -0.5 }]])(
        'rejects the negative value %j',
        (criteria) => {
            expect(findSaveBlocker(criteria)).toBe("Filter values can't be negative.");
        }
    );

    it.each<[SearchCriteria]>([[{ min_age: 3.5 }], [{ max_age: 8.2 }], [{ min_height: 150.5 }], [{ max_height: 0.1 }]])(
        'rejects the non-integer age or height %j',
        (criteria) => {
            expect(findSaveBlocker(criteria)).toBe('Age and height must be whole numbers.');
        }
    );

    it('allows decimal prices', () => {
        expect(findSaveBlocker({ min_price: 999.5 })).toBeNull();
    });

    it.each<[SearchCriteria]>([
        [{ min_age: 9, max_age: 8 }],
        [{ min_height: 171, max_height: 170 }],
        [{ min_price: 2, max_price: 1 }],
    ])('rejects the inverted range %j', (criteria) => {
        expect(findSaveBlocker(criteria)).toBe("A minimum can't be greater than its maximum.");
    });

    it('applies the first rule that fails, in the documented order', () => {
        expect(findSaveBlocker({ min_age: -3.5, max_age: -4 })).toBe("Filter values can't be negative.");
        expect(findSaveBlocker({ min_age: 9.5, max_age: 8 })).toBe('Age and height must be whole numbers.');
    });

    it('allows equal bounds and integer-valued decimals', () => {
        expect(findSaveBlocker({ min_age: 3.0, max_age: 3 })).toBeNull();
    });
});
