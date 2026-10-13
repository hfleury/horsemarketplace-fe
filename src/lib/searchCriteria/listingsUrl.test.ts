import { describe, it, expect } from 'vitest';
import { buildListingsSearchParams, listingsPathFor, parseListingsSearchParams } from './listingsUrl';

const STOCKHOLM = { lat: 59.3293, lng: 18.0686, radius_km: 50 };

describe('parseListingsSearchParams / buildListingsSearchParams', () => {
    it('round-trips criteria, location label and page', () => {
        const search = { criteria: { breed: 'Arabian', ...STOCKHOLM }, locationLabel: 'Stockholm', page: 3 };

        const params = buildListingsSearchParams(search);

        expect(params.toString()).toBe(
            'breed=Arabian&lat=59.3293&lng=18.0686&radius_km=50&location_label=Stockholm&page=3'
        );
        expect(parseListingsSearchParams(params)).toEqual(search);
    });

    it.each(['', 'page=0', 'page=-2', 'page=1.5', 'page=abc'])('defaults page to 1 for %j', (query) => {
        expect(parseListingsSearchParams(new URLSearchParams(query)).page).toBe(1);
    });

    it('omits page when it is 1', () => {
        expect(buildListingsSearchParams({ criteria: { breed: 'Arabian' }, page: 1 }).toString()).toBe('breed=Arabian');
    });

    it('drops the label when there is no location', () => {
        expect(buildListingsSearchParams({ criteria: { breed: 'Arabian' }, locationLabel: 'Stockholm' }).toString()).toBe(
            'breed=Arabian'
        );
    });

    it('drops the label on parse when the URL has no valid location', () => {
        const parsed = parseListingsSearchParams(new URLSearchParams('lat=59.3&lng=18.1&radius_km=30&location_label=Oslo'));
        expect(parsed).toEqual({ criteria: {}, locationLabel: undefined, page: 1 });
    });

    it('encodes labels containing spaces, ampersands and Swedish letters', () => {
        const locationLabel = 'Åre & Östersund, Jämtland';

        const params = buildListingsSearchParams({ criteria: STOCKHOLM, locationLabel });

        expect(params.toString()).toContain('location_label=%C3%85re+%26+%C3%96stersund%2C+J%C3%A4mtland');
        expect(parseListingsSearchParams(new URLSearchParams(params.toString())).locationLabel).toBe(locationLabel);
    });
});

describe('listingsPathFor', () => {
    it('returns the bare path when there are no criteria', () => {
        expect(listingsPathFor({})).toBe('/listings');
    });

    it('returns the path with criteria and label', () => {
        expect(listingsPathFor({ category_id: 'cat-1', ...STOCKHOLM }, 'Stockholm')).toBe(
            '/listings?category_id=cat-1&lat=59.3293&lng=18.0686&radius_km=50&location_label=Stockholm'
        );
    });
});
