import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportListingDialog } from './ReportListingDialog';
import { reportsApi } from '../../api/reports';

vi.mock('../../api/reports', () => ({
    reportsApi: { submit: vi.fn() },
}));

function selectReason(reason: string) {
    fireEvent.change(screen.getByLabelText(/reason/i), { target: { value: reason } });
}

describe('ReportListingDialog', () => {
    beforeEach(() => {
        vi.mocked(reportsApi.submit).mockReset();
    });

    it('disables Submit report until a reason is selected', () => {
        render(<ReportListingDialog open onClose={vi.fn()} productId="p1" />);

        expect(screen.getByRole('button', { name: /submit report/i })).toBeDisabled();

        selectReason('spam');

        expect(screen.getByRole('button', { name: /submit report/i })).not.toBeDisabled();
    });

    it('submits with the selected reason and no description when left blank', async () => {
        vi.mocked(reportsApi.submit).mockResolvedValue({
            status: 'success',
            data: {
                id: 'r1',
                product_id: 'p1',
                reporter_user_id: 'u1',
                reason: 'spam',
                description: null,
                status: 'pending',
                reviewed_by: null,
                reviewed_at: null,
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
            },
        });

        render(<ReportListingDialog open onClose={vi.fn()} productId="p1" />);
        selectReason('spam');
        fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

        await waitFor(() =>
            expect(reportsApi.submit).toHaveBeenCalledWith({
                product_id: 'p1',
                reason: 'spam',
                description: undefined,
            })
        );
    });

    it('includes the trimmed description when filled in', async () => {
        vi.mocked(reportsApi.submit).mockResolvedValue({
            status: 'success',
            data: {
                id: 'r1',
                product_id: 'p1',
                reporter_user_id: 'u1',
                reason: 'fraud',
                description: 'Looks suspicious',
                status: 'pending',
                reviewed_by: null,
                reviewed_at: null,
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
            },
        });

        render(<ReportListingDialog open onClose={vi.fn()} productId="p1" />);
        selectReason('fraud');
        fireEvent.change(screen.getByLabelText(/description/i), {
            target: { value: '  Looks suspicious  ' },
        });
        fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

        await waitFor(() =>
            expect(reportsApi.submit).toHaveBeenCalledWith({
                product_id: 'p1',
                reason: 'fraud',
                description: 'Looks suspicious',
            })
        );
    });

    it('shows the inline success message and a Close button on a successful submit, without auto-closing', async () => {
        vi.mocked(reportsApi.submit).mockResolvedValue({
            status: 'success',
            data: {
                id: 'r1',
                product_id: 'p1',
                reporter_user_id: 'u1',
                reason: 'other',
                description: null,
                status: 'pending',
                reviewed_by: null,
                reviewed_at: null,
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-01T00:00:00Z',
            },
        });
        const onClose = vi.fn();

        render(<ReportListingDialog open onClose={onClose} productId="p1" />);
        selectReason('other');
        fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

        await waitFor(() =>
            expect(screen.getByText(/thanks — your report has been submitted/i)).toBeInTheDocument()
        );
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('shows the friendly self-report message on a 403 from the backend', async () => {
        vi.mocked(reportsApi.submit).mockRejectedValue(
            new Error('HTTP 403: {"status":"error","message":"cannot report your own listing"}')
        );

        render(<ReportListingDialog open onClose={vi.fn()} productId="p1" />);
        selectReason('spam');
        fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

        await waitFor(() =>
            expect(
                screen.getByText("You can't report your own listing — but you can pause or delete it instead.")
            ).toBeInTheDocument()
        );
    });

    it('shows the generic fallback message for a different failure', async () => {
        vi.mocked(reportsApi.submit).mockRejectedValue(
            new Error('HTTP 500: {"status":"error","message":"Failed to submit report"}')
        );

        render(<ReportListingDialog open onClose={vi.fn()} productId="p1" />);
        selectReason('spam');
        fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

        await waitFor(() => expect(screen.getByText('Failed to submit report')).toBeInTheDocument());
        expect(
            screen.queryByText("You can't report your own listing — but you can pause or delete it instead.")
        ).not.toBeInTheDocument();
    });
});
