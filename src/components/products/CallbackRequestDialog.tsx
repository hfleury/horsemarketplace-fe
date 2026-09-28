import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '../ui/Button';
import { callbackRequestsApi } from '../../api/callbackRequests';

const SELF_CALLBACK_BACKEND_MESSAGE = 'cannot request a callback on your own listing';
const SELF_CALLBACK_USER_MESSAGE = "You can't request a callback on your own listing.";
const GENERIC_ERROR_MESSAGE = 'Failed to submit callback request. Please try again.';

function extractBackendMessage(err: unknown): string | null {
    if (!(err instanceof Error)) return null;
    const rawBody = err.message.replace(/^HTTP \d+: /, '');
    try {
        const parsed = JSON.parse(rawBody) as { message?: string };
        return parsed.message ?? null;
    } catch {
        return null;
    }
}

function mapCallbackRequestError(backendMessage: string | null): string {
    if (backendMessage === SELF_CALLBACK_BACKEND_MESSAGE) return SELF_CALLBACK_USER_MESSAGE;
    return backendMessage ?? GENERIC_ERROR_MESSAGE;
}

interface CallbackRequestDialogProps {
    open: boolean;
    onClose: () => void;
    productId: string;
}

export function CallbackRequestDialog({ open, onClose, productId }: CallbackRequestDialogProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (open) {
            setPhoneNumber('');
            setSubmitting(false);
            setError(null);
            setSuccess(false);
        }
    }, [open]);

    async function handleSubmit() {
        if (!phoneNumber) return;

        setSubmitting(true);
        setError(null);
        try {
            const response = await callbackRequestsApi.submit({
                product_id: productId,
                phone_number: phoneNumber,
            });
            if (response.status === 'success') {
                setSuccess(true);
            } else {
                setError(mapCallbackRequestError(response.message ?? null));
            }
        } catch (err) {
            setError(mapCallbackRequestError(extractBackendMessage(err)));
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
            <DialogTitle className="text-white">Request call</DialogTitle>

            {success ? (
                <>
                    <DialogContent>
                        <p className="text-text-secondary">
                            Thanks — the seller will call you back at the number you provided.
                        </p>
                    </DialogContent>
                    <DialogActions className="p-4">
                        <Button variant="primary" onClick={onClose}>
                            Close
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <>
                    <DialogContent className="flex flex-col gap-4">
                        <div>
                            <label
                                htmlFor="callback-phone-number"
                                className="mb-1 block text-sm font-medium text-text-secondary"
                            >
                                Your phone number
                            </label>
                            <input
                                id="callback-phone-number"
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value)}
                                className="w-full rounded-md border border-dark-100 bg-dark-200 px-3 py-2 text-white focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple"
                                placeholder="e.g. +46 70 123 45 67"
                            />
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
                            disabled={!phoneNumber || submitting}
                            onClick={handleSubmit}
                        >
                            Request call
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}

export default CallbackRequestDialog;
