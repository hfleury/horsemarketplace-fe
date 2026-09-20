import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '../ui/Button';
import { reportsApi } from '../../api/reports';
import { REPORT_REASON_OPTIONS, type ReportReason } from '../../types/report';

const SELF_REPORT_BACKEND_MESSAGE = 'cannot report your own listing';
const SELF_REPORT_USER_MESSAGE = "You can't report your own listing — but you can pause or delete it instead.";
const GENERIC_ERROR_MESSAGE = 'Failed to submit report. Please try again.';

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

function mapReportError(backendMessage: string | null): string {
    if (backendMessage === SELF_REPORT_BACKEND_MESSAGE) return SELF_REPORT_USER_MESSAGE;
    return backendMessage ?? GENERIC_ERROR_MESSAGE;
}

interface ReportListingDialogProps {
    open: boolean;
    onClose: () => void;
    productId: string;
}

export function ReportListingDialog({ open, onClose, productId }: ReportListingDialogProps) {
    const [reason, setReason] = useState<ReportReason | ''>('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (open) {
            setReason('');
            setDescription('');
            setSubmitting(false);
            setError(null);
            setSuccess(false);
        }
    }, [open]);

    async function handleSubmit() {
        if (!reason) return;

        setSubmitting(true);
        setError(null);
        try {
            const response = await reportsApi.submit({
                product_id: productId,
                reason,
                description: description.trim() || undefined,
            });
            if (response.status === 'success') {
                setSuccess(true);
            } else {
                setError(mapReportError(response.message ?? null));
            }
        } catch (err) {
            setError(mapReportError(extractBackendMessage(err)));
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
            <DialogTitle className="text-white">Report listing</DialogTitle>

            {success ? (
                <>
                    <DialogContent>
                        <p className="text-text-secondary">Thanks — your report has been submitted.</p>
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
                                htmlFor="report-reason"
                                className="mb-1 block text-sm font-medium text-text-secondary"
                            >
                                Reason
                            </label>
                            <select
                                id="report-reason"
                                value={reason}
                                onChange={(event) => setReason(event.target.value as ReportReason)}
                                className="w-full rounded-md border border-dark-100 bg-dark-200 px-3 py-2 text-white focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple"
                            >
                                <option value="">Select a reason</option>
                                {REPORT_REASON_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="report-description"
                                className="mb-1 block text-sm font-medium text-text-secondary"
                            >
                                Description (optional)
                            </label>
                            <textarea
                                id="report-description"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={4}
                                className="w-full rounded-md border border-dark-100 bg-dark-200 px-3 py-2 text-white focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple"
                                placeholder="Add any extra detail that might help our team review this listing..."
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
                            disabled={!reason || submitting}
                            onClick={handleSubmit}
                        >
                            Submit report
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}

export default ReportListingDialog;
