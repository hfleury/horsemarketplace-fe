import type { BoostTier } from '../../types/boostTiers';

/** Cheapest first, then by code: the same order the backend returns. */
export function sortBoostTiers(tiers: BoostTier[]): BoostTier[] {
    return [...tiers].sort((a, b) => a.price_sek - b.price_sek || a.code.localeCompare(b.code));
}

/** Replaces the tier with the same id, or adds it, keeping the list sorted. */
export function upsertBoostTier(tiers: BoostTier[], tier: BoostTier): BoostTier[] {
    return sortBoostTiers([...tiers.filter((existing) => existing.id !== tier.id), tier]);
}
