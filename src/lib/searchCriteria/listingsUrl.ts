import type { SearchCriteria } from '../../types/searchCriteria';
import { criteriaFromQueryParams, criteriaToQueryParams, hasLocationCriteria } from './queryParams';

const LOCATION_LABEL_PARAM = 'location_label';
const PAGE_PARAM = 'page';

interface ListingsSearch {
    criteria: SearchCriteria;
    locationLabel?: string;
    page: number;
}

type ListingsSearchInput = Omit<ListingsSearch, 'page'> & { page?: number };

export function parseListingsSearchParams(params: URLSearchParams): ListingsSearch {
    const criteria = criteriaFromQueryParams(params);
    const locationLabel = hasLocationCriteria(criteria) ? readLocationLabel(params) : undefined;
    return { criteria, locationLabel, page: readPage(params) };
}

export function buildListingsSearchParams({ criteria, locationLabel, page = 1 }: ListingsSearchInput): URLSearchParams {
    const params = criteriaToQueryParams(criteria);
    const trimmedLabel = locationLabel?.trim();
    if (trimmedLabel && hasLocationCriteria(criteria)) params.append(LOCATION_LABEL_PARAM, trimmedLabel);
    if (page > 1) params.append(PAGE_PARAM, String(page));
    return params;
}

export function listingsPathFor(criteria: SearchCriteria, locationLabel?: string): string {
    const query = buildListingsSearchParams({ criteria, locationLabel }).toString();
    return query ? `/listings?${query}` : '/listings';
}

function readLocationLabel(params: URLSearchParams): string | undefined {
    const label = params.get(LOCATION_LABEL_PARAM)?.trim();
    return label ? label : undefined;
}

function readPage(params: URLSearchParams): number {
    const page = Number(params.get(PAGE_PARAM));
    return Number.isInteger(page) && page >= 1 ? page : 1;
}
