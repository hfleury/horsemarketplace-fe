import { describe, it, expect } from 'vitest';
import { parseBoostTierForm, type BoostTierFormInput } from './validation';

const valid: BoostTierFormInput = { code: 'premium', name: 'Premium', price: '299', duration: '60' };

function errorsFor(overrides: Partial<BoostTierFormInput>, includeCode = true) {
    const result = parseBoostTierForm({ ...valid, ...overrides }, { includeCode });
    return result.ok ? {} : result.errors;
}

describe('parseBoostTierForm', () => {
    it('parses valid input into API values, trimming the name and accepting a decimal comma', () => {
        const result = parseBoostTierForm({ code: 'pro', name: '  Pro  ', price: ' 199,5 ', duration: ' 30 ' }, { includeCode: true });

        expect(result).toEqual({
            ok: true,
            values: { code: 'pro', name: 'Pro', price_sek: 199.5, duration_days: 30 },
        });
    });

    it.each([
        ['lowercase word', 'boost', false],
        ['digits and symbols', 'pro_2-x', false],
        ['two characters', 'ab', false],
        ['twenty characters', 'a' + 'b'.repeat(19), false],
        ['one character', 'a', true],
        ['twenty-one characters', 'a' + 'b'.repeat(20), true],
        ['uppercase', 'Boost', true],
        ['leading digit', '1boost', true],
        ['leading underscore', '_boost', true],
        ['contains space', 'big boost', true],
        ['empty', '', true],
        ['non-ascii', 'bööst', true],
    ])('code: %s', (_, code, hasError) => {
        expect(Boolean(errorsFor({ code }).code)).toBe(hasError);
    });

    it('skips the code check when the code is locked', () => {
        expect(errorsFor({ code: '' }, false)).toEqual({});
    });

    it.each([
        ['plain', 'Boost', false],
        ['fifty characters', 'a'.repeat(50), false],
        ['fifty multibyte characters', 'å'.repeat(50), false],
        ['fifty-one characters', 'a'.repeat(51), true],
        ['blank', '   ', true],
        ['empty', '', true],
    ])('name: %s', (_, name, hasError) => {
        expect(Boolean(errorsFor({ name }).name)).toBe(hasError);
    });

    it.each([
        ['whole', '49', false],
        ['one decimal', '49.5', false],
        ['two decimals', '49.99', false],
        ['decimal comma', '49,99', false],
        ['smallest', '0.01', false],
        ['largest', '9999999999.99', false],
        ['three decimals', '49.999', true],
        ['zero', '0', true],
        ['negative', '-1', true],
        ['too large', '10000000000', true],
        ['not a number', 'abc', true],
        ['empty', '', true],
    ])('price: %s', (_, price, hasError) => {
        expect(Boolean(errorsFor({ price }).price)).toBe(hasError);
    });

    it.each([
        ['one day', '1', false],
        ['one year', '365', false],
        ['zero', '0', true],
        ['negative', '-7', true],
        ['over a year', '366', true],
        ['fractional', '1.5', true],
        ['empty', '', true],
    ])('duration: %s', (_, duration, hasError) => {
        expect(Boolean(errorsFor({ duration }).duration)).toBe(hasError);
    });

    it('reports every invalid field at once', () => {
        expect(Object.keys(errorsFor({ code: 'X', name: '', price: '0', duration: '0' })).sort()).toEqual([
            'code',
            'duration',
            'name',
            'price',
        ]);
    });
});
