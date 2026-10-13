import type { SavedSearchRequest } from '../../types/savedSearch';
import type { SearchCriteria } from '../../types/searchCriteria';
import { hasLocationCriteria } from '../searchCriteria/queryParams';

export interface SavedSearchFormValues {
    name: string;
    alertsEnabled: boolean;
}

// Always sets every field: the backend's update is a full replace, so an omitted field would be reset.
export function toSavedSearchRequest(
    { name, alertsEnabled }: SavedSearchFormValues,
    criteria: SearchCriteria,
    locationLabel?: string
): SavedSearchRequest {
    return {
        name: name.trim(),
        criteria,
        location_label: hasLocationCriteria(criteria) ? locationLabel : undefined,
        alerts_enabled: alertsEnabled,
    };
}
