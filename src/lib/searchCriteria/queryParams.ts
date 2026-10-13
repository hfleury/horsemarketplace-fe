import type { SearchCriteria } from '../../types/searchCriteria';

export const RADIUS_OPTIONS_KM = [10, 25, 50, 100, 250, 500];

const STRING_CRITERIA_KEYS = ['q', 'category_id', 'breed', 'gender', 'discipline'] as const;

export const RANGE_CRITERIA_KEYS = [
    'min_age',
    'max_age',
    'min_height',
    'max_height',
    'min_price',
    'max_price',
] as const;

const LOCATION_CRITERIA_KEYS = ['lat', 'lng', 'radius_km'] as const;

const WHOLE_NUMBER_CRITERIA_KEYS = ['min_age', 'max_age', 'min_height', 'max_height'] as const;

const MIN_MAX_PAIRS = [
    ['min_age', 'max_age'],
    ['min_height', 'max_height'],
    ['min_price', 'max_price'],
] as const;

type StringCriteriaKey = (typeof STRING_CRITERIA_KEYS)[number];
export type RangeCriteriaKey = (typeof RANGE_CRITERIA_KEYS)[number];
type NumericCriteriaKey = RangeCriteriaKey | (typeof LOCATION_CRITERIA_KEYS)[number];

// Declaration order of SearchCriteria, so serialised params are deterministic.
const NUMERIC_CRITERIA_KEYS: readonly NumericCriteriaKey[] = [...RANGE_CRITERIA_KEYS, ...LOCATION_CRITERIA_KEYS];

export function hasLocationCriteria(criteria: SearchCriteria): boolean {
    return criteria.lat !== undefined && criteria.lng !== undefined && criteria.radius_km !== undefined;
}

export function criteriaToQueryParams(criteria: SearchCriteria): URLSearchParams {
    const params = new URLSearchParams();
    for (const key of STRING_CRITERIA_KEYS) {
        const value = criteria[key]?.trim();
        if (value) params.append(key, value);
    }
    for (const key of NUMERIC_CRITERIA_KEYS) {
        const value = criteria[key];
        if (value !== undefined && Number.isFinite(value)) params.append(key, String(value));
    }
    return params;
}

export function criteriaFromQueryParams(params: URLSearchParams): SearchCriteria {
    const criteria: SearchCriteria = {};
    for (const key of STRING_CRITERIA_KEYS) {
        const value = readString(params, key);
        if (value !== undefined) criteria[key] = value;
    }
    for (const key of RANGE_CRITERIA_KEYS) {
        const value = readNumber(params, key);
        if (value !== undefined) criteria[key] = value;
    }
    return { ...criteria, ...readLocation(params) };
}

function readString(params: URLSearchParams, key: StringCriteriaKey): string | undefined {
    const value = params.get(key)?.trim();
    return value ? value : undefined;
}

function readNumber(params: URLSearchParams, key: NumericCriteriaKey): number | undefined {
    const raw = params.get(key)?.trim();
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
}

// Location is all-or-nothing, and an unlisted radius is dropped so the UI never holds a filter it can't show.
function readLocation(params: URLSearchParams): Pick<SearchCriteria, 'lat' | 'lng' | 'radius_km'> {
    const lat = readNumber(params, 'lat');
    const lng = readNumber(params, 'lng');
    const radiusKm = readNumber(params, 'radius_km');
    if (lat === undefined || lng === undefined || radiusKm === undefined) return {};
    if (!RADIUS_OPTIONS_KM.includes(radiusKm)) return {};
    return { lat, lng, radius_km: radiusKm };
}

// Mirrors the saved-search validation in horsemarketplacebk's saved_search_service.go.
export function findSaveBlocker(criteria: SearchCriteria): string | null {
    if (Object.values(criteria).every((value) => value === undefined)) {
        return 'Choose at least one filter to save this search.';
    }
    if (RANGE_CRITERIA_KEYS.some((key) => (criteria[key] ?? 0) < 0)) {
        return "Filter values can't be negative.";
    }
    if (WHOLE_NUMBER_CRITERIA_KEYS.some((key) => !Number.isInteger(criteria[key] ?? 0))) {
        return 'Age and height must be whole numbers.';
    }
    if (MIN_MAX_PAIRS.some(([minKey, maxKey]) => isInverted(criteria[minKey], criteria[maxKey]))) {
        return "A minimum can't be greater than its maximum.";
    }
    return null;
}

function isInverted(minimum: number | undefined, maximum: number | undefined): boolean {
    return minimum !== undefined && maximum !== undefined && minimum > maximum;
}
