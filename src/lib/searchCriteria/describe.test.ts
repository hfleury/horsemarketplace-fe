import { describe, it, expect } from 'vitest';
import { describeCriteria, suggestSearchName } from './describe';

const STOCKHOLM = { lat: 59.3293, lng: 18.0686, radius_km: 50 };
const sek = (value: number) => value.toLocaleString('sv-SE');

describe('describeCriteria', () => {
    it.each([
        [{ min_age: 3, max_age: 8 }, 'Age 3–8'],
        [{ min_age: 3 }, 'Age 3+'],
        [{ max_age: 8 }, 'Age ≤ 8'],
        [{ min_height: 150, max_height: 170 }, 'Height 150–170 cm'],
        [{ min_height: 150 }, 'Height 150+ cm'],
        [{ max_height: 170 }, 'Height ≤ 170 cm'],
        [{ min_price: 500, max_price: 900 }, 'Price 500–900 SEK'],
        [{ min_price: 500 }, 'Price 500+ SEK'],
        [{ max_price: 900 }, 'Price ≤ 900 SEK'],
    ])('describes the range %j as %s', (criteria, expected) => {
        expect(describeCriteria(criteria)).toEqual([expected]);
    });

    it('formats prices with a thousands separator', () => {
        const [part] = describeCriteria({ min_price: 10000, max_price: 50000 });
        expect(part).toBe(`Price ${sek(10000)}–${sek(50000)} SEK`);
        expect(part).toMatch(/^Price 10\s000–50\s000 SEK$/);
    });

    it('describes a location with and without a label', () => {
        expect(describeCriteria(STOCKHOLM, { locationLabel: 'Stockholm' })).toEqual(['Within 50 km of Stockholm']);
        expect(describeCriteria(STOCKHOLM)).toEqual(['Within 50 km']);
    });

    it('lists every criterion in order', () => {
        const criteria = {
            q: 'saddle',
            category_id: 'cat-1',
            breed: 'Arabian',
            gender: 'Mare',
            discipline: 'Dressage',
            min_age: 3,
            max_age: 8,
            min_height: 150,
            max_height: 170,
            min_price: 500,
            max_price: 900,
            ...STOCKHOLM,
        };

        expect(describeCriteria(criteria, { categoryName: 'Horses', locationLabel: 'Stockholm' })).toEqual([
            '"saddle"',
            'Horses',
            'Arabian',
            'Mare',
            'Dressage',
            'Age 3–8',
            'Height 150–170 cm',
            'Price 500–900 SEK',
            'Within 50 km of Stockholm',
        ]);
    });

    it('omits the category without a name and never shows its id', () => {
        const parts = describeCriteria({ category_id: 'c0ffee-uuid', breed: 'Arabian' });
        expect(parts).toEqual(['Arabian']);
        expect(parts.join(' ')).not.toContain('c0ffee-uuid');
    });
});

describe('suggestSearchName', () => {
    it('joins the parts with a middle dot', () => {
        expect(suggestSearchName({ category_id: 'cat-1', breed: 'Arabian' }, { categoryName: 'Horses' })).toBe(
            'Horses · Arabian'
        );
    });

    it('truncates to exactly 100 characters', () => {
        const name = suggestSearchName({ q: 'x'.repeat(150) });
        expect(name).toHaveLength(100);
        expect(name).toBe(`"${'x'.repeat(99)}`);
    });

    it('falls back to "My search" for empty criteria', () => {
        expect(suggestSearchName({})).toBe('My search');
    });
});
