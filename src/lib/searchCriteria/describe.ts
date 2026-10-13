import type { SearchCriteria } from '../../types/searchCriteria';
import { hasLocationCriteria } from './queryParams';

const MAX_NAME_LENGTH = 100;
const FALLBACK_NAME = 'My search';
const PART_SEPARATOR = ' · ';

interface DescribeOptions {
    categoryName?: string;
    locationLabel?: string;
}

export function describeCriteria(criteria: SearchCriteria, { categoryName, locationLabel }: DescribeOptions = {}): string[] {
    const parts = [
        criteria.q && `"${criteria.q}"`,
        criteria.category_id && categoryName,
        criteria.breed,
        criteria.gender,
        criteria.discipline,
        formatRange('Age', criteria.min_age, criteria.max_age),
        formatRange('Height', criteria.min_height, criteria.max_height, ' cm'),
        formatRange('Price', criteria.min_price, criteria.max_price, ' SEK'),
        describeLocation(criteria, locationLabel),
    ];
    return parts.filter((part): part is string => Boolean(part));
}

export function suggestSearchName(criteria: SearchCriteria, options: DescribeOptions = {}): string {
    const name = describeCriteria(criteria, options).join(PART_SEPARATOR).slice(0, MAX_NAME_LENGTH);
    return name || FALLBACK_NAME;
}

function formatRange(label: string, minimum: number | undefined, maximum: number | undefined, unit = ''): string | undefined {
    if (minimum !== undefined && maximum !== undefined) {
        return `${label} ${formatNumber(minimum)}–${formatNumber(maximum)}${unit}`;
    }
    if (minimum !== undefined) return `${label} ${formatNumber(minimum)}+${unit}`;
    if (maximum !== undefined) return `${label} ≤ ${formatNumber(maximum)}${unit}`;
    return undefined;
}

function formatNumber(value: number): string {
    return value.toLocaleString('sv-SE');
}

function describeLocation(criteria: SearchCriteria, locationLabel: string | undefined): string | undefined {
    if (!hasLocationCriteria(criteria)) return undefined;
    const radius = `Within ${criteria.radius_km} km`;
    return locationLabel ? `${radius} of ${locationLabel}` : radius;
}
