import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { SavedSearchFormDialog } from './SavedSearchFormDialog';
import { useAuth } from '../../hooks/useAuth';
import { savedSearchesApi } from '../../api/savedSearches';
import { criteriaToQueryParams, findSaveBlocker } from '../../lib/searchCriteria/queryParams';
import { suggestSearchName } from '../../lib/searchCriteria/describe';
import { toSavedSearchRequest, type SavedSearchFormValues } from '../../lib/savedSearches/request';
import type { SavedSearch } from '../../types/savedSearch';
import type { SearchCriteria } from '../../types/searchCriteria';

interface SaveSearchPanelProps {
    criteria: SearchCriteria;
    locationLabel?: string;
    categoryName?: string;
}

interface SavedConfirmation {
    name: string;
    criteriaKey: string;
}

export function SaveSearchPanel({ criteria, locationLabel, categoryName }: SaveSearchPanelProps) {
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [savedConfirmation, setSavedConfirmation] = useState<SavedConfirmation | null>(null);

    if (!user) return null;

    const saveBlocker = findSaveBlocker(criteria);
    const criteriaKey = criteriaToQueryParams(criteria).toString();
    const showConfirmation = savedConfirmation?.criteriaKey === criteriaKey;

    const submit = (values: SavedSearchFormValues) =>
        savedSearchesApi.create(toSavedSearchRequest(values, criteria, locationLabel));

    const handleSaved = (saved: SavedSearch) => {
        setIsDialogOpen(false);
        setSavedConfirmation({ name: saved.name, criteriaKey });
    };

    return (
        <div className="mb-8 flex flex-col items-center gap-2">
            <Button variant="outline" size="sm" disabled={saveBlocker !== null} onClick={() => setIsDialogOpen(true)}>
                Save this search
            </Button>
            {saveBlocker && <p className="text-sm text-text-secondary">{saveBlocker}</p>}
            {showConfirmation && (
                <p className="text-sm text-green-500">
                    Saved "{savedConfirmation.name}".{' '}
                    <Link to="/saved-searches" className="font-bold underline hover:text-green-400">
                        View my saved searches
                    </Link>
                </p>
            )}

            <SavedSearchFormDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Save this search"
                submitLabel="Save"
                initialName={suggestSearchName(criteria, { categoryName, locationLabel })}
                initialAlertsEnabled
                submit={submit}
                onSaved={handleSaved}
            />
        </div>
    );
}

export default SaveSearchPanel;
