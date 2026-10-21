import type { BoostTierFormValues } from '../../types/boostTiers';

// Mirrors the backend rules in internal/boosttiers/services/validation.go so
// errors show before submitting; the backend stays the authority.

export const MAX_NAME_LENGTH = 50;
export const MAX_DURATION_DAYS = 365;
const MAX_PRICE_SEK = 1e10;
const CODE_PATTERN = /^[a-z][a-z0-9_-]{1,19}$/;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const DURATION_PATTERN = /^\d+$/;

export interface BoostTierFormInput {
    code: string;
    name: string;
    price: string;
    duration: string;
}

export type BoostTierFormErrors = Partial<Record<keyof BoostTierFormInput, string>>;

export type BoostTierFormResult =
    | { ok: true; values: BoostTierFormValues }
    | { ok: false; errors: BoostTierFormErrors };

function codeError(code: string): string | undefined {
    if (!CODE_PATTERN.test(code)) {
        return 'Use 2-20 lowercase letters, digits, "-" or "_", starting with a letter.';
    }
}

function nameError(name: string): string | undefined {
    const trimmed = name.trim();
    if (!trimmed || [...trimmed].length > MAX_NAME_LENGTH) {
        return `Name must be between 1 and ${MAX_NAME_LENGTH} characters.`;
    }
}

function priceError(price: string): string | undefined {
    const normalised = price.trim().replace(',', '.');
    if (!PRICE_PATTERN.test(normalised)) return 'Enter a price with at most 2 decimals.';
    const value = Number(normalised);
    if (value <= 0 || value >= MAX_PRICE_SEK) return 'Price must be greater than 0.';
}

function durationError(duration: string): string | undefined {
    const trimmed = duration.trim();
    const value = Number(trimmed);
    if (!DURATION_PATTERN.test(trimmed) || value < 1 || value > MAX_DURATION_DAYS) {
        return `Duration must be a whole number of days between 1 and ${MAX_DURATION_DAYS}.`;
    }
}

/**
 * Validates the raw form fields and, when they are valid, parses them into the
 * values sent to the API. The code is checked only when it can be edited.
 */
export function parseBoostTierForm(input: BoostTierFormInput, { includeCode }: { includeCode: boolean }): BoostTierFormResult {
    const errors: BoostTierFormErrors = {
        code: includeCode ? codeError(input.code) : undefined,
        name: nameError(input.name),
        price: priceError(input.price),
        duration: durationError(input.duration),
    };
    const fieldErrors = Object.fromEntries(
        Object.entries(errors).filter(([, message]) => message !== undefined)
    ) as BoostTierFormErrors;
    if (Object.keys(fieldErrors).length > 0) return { ok: false, errors: fieldErrors };

    return {
        ok: true,
        values: {
            code: input.code,
            name: input.name.trim(),
            price_sek: Number(input.price.trim().replace(',', '.')),
            duration_days: Number(input.duration.trim()),
        },
    };
}
