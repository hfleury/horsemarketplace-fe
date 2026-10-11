import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { savedSearchesApi } from '../api/savedSearches';
import { SectionHeader } from '../components/common/SectionHeader';
import { SavedSearchFormDialog } from '../components/savedSearches/SavedSearchFormDialog';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import { describeCriteria } from '../lib/searchCriteria/describe';
import { listingsPathFor } from '../lib/searchCriteria/listingsUrl';
import { toSavedSearchRequest, type SavedSearchFormValues } from '../lib/savedSearches/request';
import { savedSearchErrorMessage, toSavedSearchUserMessage } from '../lib/savedSearches/errors';
import type { SavedSearch } from '../types/savedSearch';

const DELETE_ERROR_MESSAGE = 'Failed to delete saved search.';

interface SavedSearchItemProps {
    savedSearch: SavedSearch;
    onEdit: () => void;
    onDelete: () => void;
}

function SavedSearchItem({ savedSearch, onEdit, onDelete }: SavedSearchItemProps) {
    const locationLabel = savedSearch.location_label ?? undefined;
    // The category name is left out: the saved name already carries it, and it would need a categories fetch.
    const summary = describeCriteria(savedSearch.criteria, { locationLabel }).join(' · ');

    return (
        <li className="flex flex-col gap-4 rounded-xl border border-dark-200 bg-white dark:bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
                <h3 className="font-bold text-text-primary">{savedSearch.name}</h3>
                {summary && <p className="text-sm text-text-secondary">{summary}</p>}
                <p className="text-xs text-text-secondary">
                    <span>{savedSearch.alerts_enabled ? 'Email alerts on' : 'Email alerts off'}</span>
                    {' · '}
                    <span>Saved {new Date(savedSearch.created_at).toLocaleDateString('sv-SE')}</span>
                </p>
            </div>
            <div className="flex gap-2">
                <Link
                    to={listingsPathFor(savedSearch.criteria, locationLabel)}
                    aria-label={`Open ${savedSearch.name}`}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-accent-purple px-4 py-2 text-sm font-medium text-accent-purple transition-all duration-300 hover:bg-accent-purple hover:text-white"
                >
                    Open
                </Link>
                <Button variant="outline" size="sm" aria-label={`Edit ${savedSearch.name}`} onClick={onEdit}>
                    Edit
                </Button>
                <Button variant="ghost" size="sm" aria-label={`Delete ${savedSearch.name}`} onClick={onDelete}>
                    Delete
                </Button>
            </div>
        </li>
    );
}

export const SavedSearches = () => {
    const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<SavedSearch | null>(null);
    const [deleting, setDeleting] = useState<SavedSearch | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchSavedSearches = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await savedSearchesApi.list();
                if (response.status === 'success') {
                    setSavedSearches(response.data ?? []);
                } else {
                    setError(response.message || 'Failed to fetch saved searches');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedSearches();
    }, []);

    const submitEdit = (values: SavedSearchFormValues) => {
        if (!editing) return Promise.reject(new Error('No saved search is being edited'));
        const locationLabel = editing.location_label ?? undefined;
        return savedSearchesApi.update(editing.id, toSavedSearchRequest(values, editing.criteria, locationLabel));
    };

    const handleEdited = (updated: SavedSearch) => {
        setSavedSearches((current) => current.map((search) => (search.id === updated.id ? updated : search)));
        setEditing(null);
    };

    // Removes the item only after the server confirms, so there is nothing to roll back.
    const handleConfirmDelete = async () => {
        if (!deleting) return;
        setIsDeleting(true);
        try {
            const response = await savedSearchesApi.remove(deleting.id);
            if (response.status === 'success') {
                setSavedSearches((current) => current.filter((search) => search.id !== deleting.id));
            } else {
                setError(toSavedSearchUserMessage(response.message, DELETE_ERROR_MESSAGE));
            }
        } catch (err) {
            setError(savedSearchErrorMessage(err, DELETE_ERROR_MESSAGE));
        } finally {
            setIsDeleting(false);
            setDeleting(null);
        }
    };

    return (
        <section className="py-24 px-6 md:px-12 bg-background">
            <div className="container-custom">
                <SectionHeader title="My saved searches" subtitle="Searches you'll get notified about" />

                {error && (
                    <div className="mb-8 text-center text-red-500 bg-red-100 p-3 rounded">{error}</div>
                )}

                {loading ? (
                    <div className="p-10 text-center text-text-secondary">Loading saved searches...</div>
                ) : savedSearches.length === 0 ? (
                    <div className="p-10 text-center text-text-secondary">
                        <p>You haven't saved any searches yet.</p>
                        <Link to="/listings" className="mt-4 inline-block text-accent-purple font-bold hover:underline">
                            Browse listings
                        </Link>
                    </div>
                ) : (
                    <ul className="mx-auto flex max-w-3xl flex-col gap-4">
                        {savedSearches.map((savedSearch) => (
                            <SavedSearchItem
                                key={savedSearch.id}
                                savedSearch={savedSearch}
                                onEdit={() => setEditing(savedSearch)}
                                onDelete={() => setDeleting(savedSearch)}
                            />
                        ))}
                    </ul>
                )}

                <SavedSearchFormDialog
                    open={editing !== null}
                    onClose={() => setEditing(null)}
                    title="Edit saved search"
                    submitLabel="Save changes"
                    initialName={editing?.name ?? ''}
                    initialAlertsEnabled={editing?.alerts_enabled ?? true}
                    submit={submitEdit}
                    onSaved={handleEdited}
                />

                <ConfirmDialog
                    open={deleting !== null}
                    title="Delete saved search?"
                    message={`"${deleting?.name ?? ''}" will be deleted and you'll stop getting alerts for it.`}
                    confirmLabel="Delete"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleting(null)}
                    isConfirming={isDeleting}
                />
            </div>
        </section>
    );
};

export default SavedSearches;
