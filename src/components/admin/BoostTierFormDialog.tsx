import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '../ui/Button';
import { extractErrorMessage } from '../../lib/errors';
import {
    parseBoostTierForm,
    type BoostTierFormErrors,
    type BoostTierFormInput,
} from '../../lib/boostTiers/validation';
import type { ApiResponse } from '../../types/api';
import type { BoostTier, BoostTierFormValues } from '../../types/boostTiers';

const GENERIC_ERROR_MESSAGE = 'Failed to save this tier. Please try again.';
const INPUT_CLASS =
    'w-full rounded-md border border-dark-100 bg-dark-200 px-3 py-2 text-white focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple';

interface BoostTierFormDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    submitLabel: string;
    initialValues: BoostTierFormInput;
    /** Shown read-only instead of an input; codes can't change after creation. */
    lockedCode?: string;
    submit: (values: BoostTierFormValues) => Promise<ApiResponse<BoostTier>>;
    onSaved: (tier: BoostTier) => void;
}

interface FieldProps {
    id: string;
    label: string;
    value: string;
    error?: string;
    inputMode?: 'text' | 'decimal' | 'numeric';
    onChange: (value: string) => void;
}

function Field({ id, label, value, error, inputMode = 'text', onChange }: FieldProps) {
    const errorId = `${id}-error`;
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-text-secondary">
                {label}
            </label>
            <input
                id={id}
                type="text"
                inputMode={inputMode}
                value={value}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => onChange(event.target.value)}
                className={INPUT_CLASS}
            />
            {error && (
                <p id={errorId} className="mt-1 text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

export function BoostTierFormDialog({
    open,
    onClose,
    title,
    submitLabel,
    initialValues,
    lockedCode,
    submit,
    onSaved,
}: BoostTierFormDialogProps) {
    const [input, setInput] = useState(initialValues);
    const [fieldErrors, setFieldErrors] = useState<BoostTierFormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setInput(initialValues);
            setFieldErrors({});
            setSubmitError(null);
            setSubmitting(false);
        }
    }, [open, initialValues]);

    const setField = (field: keyof BoostTierFormInput) => (value: string) =>
        setInput((current) => ({ ...current, [field]: value }));

    async function handleSubmit() {
        if (submitting) return;
        const parsed = parseBoostTierForm(input, { includeCode: lockedCode === undefined });
        if (!parsed.ok) {
            setFieldErrors(parsed.errors);
            return;
        }

        setFieldErrors({});
        setSubmitError(null);
        setSubmitting(true);
        try {
            const response = await submit(parsed.values);
            if (response.status === 'success' && response.data) {
                onSaved(response.data);
            } else {
                setSubmitError(response.message || GENERIC_ERROR_MESSAGE);
            }
        } catch (err) {
            setSubmitError(extractErrorMessage(err, GENERIC_ERROR_MESSAGE));
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
                {lockedCode === undefined ? (
                    <Field id="boost-tier-code" label="Code" value={input.code} error={fieldErrors.code} onChange={setField('code')} />
                ) : (
                    <p className="text-sm text-text-secondary">
                        Code: <span className="font-mono text-white">{lockedCode}</span>
                    </p>
                )}
                <Field id="boost-tier-name" label="Name" value={input.name} error={fieldErrors.name} onChange={setField('name')} />
                <Field
                    id="boost-tier-price"
                    label="Price (SEK incl. moms)"
                    value={input.price}
                    error={fieldErrors.price}
                    inputMode="decimal"
                    onChange={setField('price')}
                />
                <Field
                    id="boost-tier-duration"
                    label="Duration (days)"
                    value={input.duration}
                    error={fieldErrors.duration}
                    inputMode="numeric"
                    onChange={setField('duration')}
                />
                {submitError && (
                    <p role="alert" className="text-sm text-red-500">
                        {submitError}
                    </p>
                )}
            </DialogContent>
            <DialogActions className="p-4">
                <Button variant="ghost" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" isLoading={submitting} disabled={submitting} onClick={handleSubmit}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default BoostTierFormDialog;
