import type { SearchCriteria } from './searchCriteria';

export interface SavedSearch {
    id: string;
    user_id: string;
    name: string;
    criteria: SearchCriteria;
    location_label: string | null;
    alerts_enabled: boolean;
    last_notified_at: string | null;
    created_at: string;
    updated_at: string;
}

// The backend uses this body for both create and full-replace update.
export interface SavedSearchRequest {
    name: string;
    criteria: SearchCriteria;
    location_label?: string;
    alerts_enabled?: boolean;
}
