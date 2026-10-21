import { describe, it, expect } from 'vitest';
import { sortBoostTiers, upsertBoostTier } from './order';
import type { BoostTier } from '../../types/boostTiers';

function tier(id: string, code: string, price_sek: number): BoostTier {
    return { id, code, name: code, price_sek, duration_days: 7, is_active: true, created_at: '', updated_at: '' };
}

describe('sortBoostTiers', () => {
    it('orders by price, then code, without mutating the input', () => {
        const input = [tier('1', 'pro', 199), tier('2', 'zeta', 49), tier('3', 'alpha', 49)];

        expect(sortBoostTiers(input).map((t) => t.code)).toEqual(['alpha', 'zeta', 'pro']);
        expect(input.map((t) => t.code)).toEqual(['pro', 'zeta', 'alpha']);
    });
});

describe('upsertBoostTier', () => {
    it('adds a new tier in price order', () => {
        const result = upsertBoostTier([tier('1', 'boost', 49), tier('2', 'pro', 199)], tier('3', 'medium', 99));

        expect(result.map((t) => t.code)).toEqual(['boost', 'medium', 'pro']);
    });

    it('replaces an existing tier and re-sorts it', () => {
        const result = upsertBoostTier([tier('1', 'boost', 49), tier('2', 'pro', 199)], tier('1', 'boost', 299));

        expect(result.map((t) => [t.code, t.price_sek])).toEqual([['pro', 199], ['boost', 299]]);
    });
});
