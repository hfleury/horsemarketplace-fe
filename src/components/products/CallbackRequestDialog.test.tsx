import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CallbackRequestDialog } from './CallbackRequestDialog';
import { callbackRequestsApi } from '../../api/callbackRequests';

vi.mock('../../api/callbackRequests', () => ({
    callbackRequestsApi: { submit: vi.fn() },
}));

function enterPhoneNumber(phoneNumber: string) {
    fireEvent.change(screen.getByLabelText(/your phone number/i), { target: { value: phoneNumber } });
}

describe('CallbackRequestDialog', () => {
    beforeEach(() => {
        vi.mocked(callbackRequestsApi.submit).mockReset();
    });

    it('disables Request call until a phone number is entered', () => {
        render(<CallbackRequestDialog open onClose={vi.fn()} productId="p1" />);

        expect(screen.getByRole('button', { name: /request call/i })).toBeDisabled();

        enterPhoneNumber('0701234567');

        expect(screen.getByRole('button', { name: /request call/i })).not.toBeDisabled();
    });

    it('submits with the product id and phone number', async () => {
        vi.mocked(callbackRequestsApi.submit).mockResolvedValue({
            status: 'success',
            data: {
                id: 'c1',
                product_id: 'p1',
                buyer_id: 'u1',
                phone_number: '0701234567',
                created_at: '2026-01-01T00:00:00Z',
            },
        });

        render(<CallbackRequestDialog open onClose={vi.fn()} productId="p1" />);
        enterPhoneNumber('0701234567');
        fireEvent.click(screen.getByRole('button', { name: /request call/i }));

        await waitFor(() =>
            expect(callbackRequestsApi.submit).toHaveBeenCalledWith({
                product_id: 'p1',
                phone_number: '0701234567',
            })
        );
    });

    it('shows the inline success message and a Close button on a successful submit, without auto-closing', async () => {
        vi.mocked(callbackRequestsApi.submit).mockResolvedValue({
            status: 'success',
            data: {
                id: 'c1',
                product_id: 'p1',
                buyer_id: 'u1',
                phone_number: '0701234567',
                created_at: '2026-01-01T00:00:00Z',
            },
        });
        const onClose = vi.fn();

        render(<CallbackRequestDialog open onClose={onClose} productId="p1" />);
        enterPhoneNumber('0701234567');
        fireEvent.click(screen.getByRole('button', { name: /request call/i }));

        await waitFor(() =>
            expect(
                screen.getByText(/the seller will call you back at the number you provided/i)
            ).toBeInTheDocument()
        );
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('shows the friendly self-callback message on a 403 from the backend', async () => {
        vi.mocked(callbackRequestsApi.submit).mockRejectedValue(
            new Error(
                'HTTP 403: {"status":"error","message":"cannot request a callback on your own listing"}'
            )
        );

        render(<CallbackRequestDialog open onClose={vi.fn()} productId="p1" />);
        enterPhoneNumber('0701234567');
        fireEvent.click(screen.getByRole('button', { name: /request call/i }));

        await waitFor(() =>
            expect(screen.getByText("You can't request a callback on your own listing.")).toBeInTheDocument()
        );
    });

    it('shows the generic fallback message for a different failure', async () => {
        vi.mocked(callbackRequestsApi.submit).mockRejectedValue(
            new Error('HTTP 500: {"status":"error","message":"Failed to submit callback request"}')
        );

        render(<CallbackRequestDialog open onClose={vi.fn()} productId="p1" />);
        enterPhoneNumber('0701234567');
        fireEvent.click(screen.getByRole('button', { name: /request call/i }));

        await waitFor(() => expect(screen.getByText('Failed to submit callback request')).toBeInTheDocument());
        expect(
            screen.queryByText("You can't request a callback on your own listing.")
        ).not.toBeInTheDocument();
    });
});
