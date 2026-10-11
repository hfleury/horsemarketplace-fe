import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '../ui/Button';
import { savedSearchErrorMessage, toSavedSearchUserMessage } from '../../lib/savedSearches/errors';
import type { SavedSearchFormValues } from '../../lib/savedSearches/request';
import type { ApiResponse } from '../../types/api';
import type { SavedSearch } from '../../types/savedSearch';

const MAX_NAME_LENGTH = 100;
const GENERIC_ERROR_MESSAGE = 'Failed to save this search. Please try again.';

interface SavedSearchFormDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    submitLabel: string;
    initialName: string;
    initialAlertsEnabled: boolean;
    submit: (values: SavedSearchFormValues) => Promise<ApiResponse<SavedSearch>>;
    onSaved: (saved: SavedSearch) => void;
}

export function SavedSearchFormDialog({
    open,
    onClose,
    title,
    submitLabel,
    initialName,
    initialAlertsEnabled,
    submit,
    onSaved,
}: SavedSearchFormDialogProps) {
    const [name, setName] = useState(initialName);
    const [alertsEnabled, setAlertsEnabled] = useState(initialAlertsEnabled);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setName(initialName);
            setAlertsEnabled(initialAlertsEnabled);
            setSubmitting(false);
            setError(null);
        }
    }, [open, initialName, initialAlertsEnabled]);

    const trimmedName = name.trim();

    async function handleSubmit() {
        if (!trimmedName || submitting) return;

        setSubmitting(true);
        setError(null);
        try {
            const response = await submit({ name: trimmedName, alertsEnabled });
            if (response.status === 'success' && response.data) {
                onSaved(response.data);
            } else {
                setError(toSavedSearchUserMessage(response.message, GENERIC_ERROR_MESSAGE));
            }
        } catch (err) {
            setError(savedSearchErrorMessage(err, GENERIC_ERROR_MESSAGE));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ className: 'bg-dark-300 text-white', sx: { backgroundColor: '#1F1F2E' } }}
        >
            <DialogTitle className="text-white">{title}</DialogTitle>
            <DialogContent className="flex flex-col gap-4">
                <div>
                    <label htmlFor="saved-search-name" className="mb-1 block text-sm font-medium text-text-secondary">
                        Name
                    </label>
                    <input
                        id="saved-search-name"
                        type="text"
                        value={name}
                        maxLength={MAX_NAME_LENGTH}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full rounded-md border border-dark-100 bg-dark-200 px-3 py-2 text-white focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        id="saved-search-alerts"
                        type="checkbox"
                        checked={alertsEnabled}
                        onChange={(event) => setAlertsEnabled(event.target.checked)}
                        className="h-4 w-4 rounded border-dark-100 bg-dark-200 text-accent-purple focus:ring-accent-purple"
                    />
                    <label htmlFor="saved-search-alerts" className="ml-2 block text-sm text-text-secondary">
                        Email me new matches
                    </label>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
            </DialogContent>
            <DialogActions className="p-4">
                <Button variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    isLoading={submitting}
                    disabled={!trimmedName || submitting}
                    onClick={handleSubmit}
                >
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SavedSearchFormDialog;
