import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SavedSearchFormDialog } from './SavedSearchFormDialog';
import type { SavedSearchFormValues } from '../../lib/savedSearches/request';
import type { ApiResponse } from '../../types/api';
import type { SavedSearch } from '../../types/savedSearch';

const SAVED: SavedSearch = {
    id: 's1',
    user_id: 'u1',
    name: 'Horses',
    criteria: { category_id: 'cat-1' },
    location_label: null,
    alerts_enabled: true,
    last_notified_at: null,
    created_at: '2026-10-11T00:00:00Z',
    updated_at: '2026-10-11T00:00:00Z',
};

function httpError(status: number, message: string) {
    return new Error(`HTTP ${status}: ${JSON.stringify({ status: 'error', message })}`);
}

function renderDialog() {
    const props = {
        open: true,
        onClose: vi.fn(),
        title: 'Save this search',
        submitLabel: 'Save',
        initialName: 'Horses',
        initialAlertsEnabled: true,
        submit: vi.fn<(values: SavedSearchFormValues) => Promise<ApiResponse<SavedSearch>>>(),
        onSaved: vi.fn(),
    };
    const view = render(<SavedSearchFormDialog {...props} />);
    return { ...view, props };
}

function saveButton() {
    return screen.getByRole('button', { name: 'Save' });
}

describe('SavedSearchFormDialog', () => {
    it('prefills the name and alerts', () => {
        renderDialog();

        expect(screen.getByRole('heading', { name: 'Save this search' })).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toHaveValue('Horses');
        expect(screen.getByLabelText('Email me new matches')).toBeChecked();
    });

    it('disables submit while the name is blank', () => {
        renderDialog();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: '   ' } });

        expect(saveButton()).toBeDisabled();
    });

    it('submits the trimmed name and unchecked alerts, then hands the saved search to onSaved', async () => {
        const { props } = renderDialog();
        props.submit.mockResolvedValue({ status: 'success', data: SAVED });

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  My horses  ' } });
        fireEvent.click(screen.getByLabelText('Email me new matches'));
        fireEvent.click(saveButton());

        await waitFor(() => expect(props.onSaved).toHaveBeenCalledWith(SAVED));
        expect(props.submit).toHaveBeenCalledWith({ name: 'My horses', alertsEnabled: false });
    });

    it('shows the limit message on a 409', async () => {
        const { props } = renderDialog();
        props.submit.mockRejectedValue(httpError(409, 'saved search limit reached'));

        fireEvent.click(saveButton());

        expect(await screen.findByText(/reached the limit of 20 saved searches/i)).toBeInTheDocument();
        expect(props.onSaved).not.toHaveBeenCalled();
    });

    it('shows an unknown 400 message verbatim', async () => {
        const { props } = renderDialog();
        props.submit.mockRejectedValue(httpError(400, 'invalid search criteria: min_age exceeds max_age'));

        fireEvent.click(saveButton());

        expect(await screen.findByText('invalid search criteria: min_age exceeds max_age')).toBeInTheDocument();
    });

    it('shows the message of an error response that did not throw', async () => {
        const { props } = renderDialog();
        props.submit.mockResolvedValue({ status: 'error', message: 'saved search not found' });

        fireEvent.click(saveButton());

        expect(await screen.findByText('This saved search no longer exists.')).toBeInTheDocument();
        expect(props.onSaved).not.toHaveBeenCalled();
    });

    it('does not submit twice while a request is in flight', async () => {
        const { props } = renderDialog();
        let resolveSubmit: (response: ApiResponse<SavedSearch>) => void = () => {};
        props.submit.mockReturnValue(new Promise((resolve) => (resolveSubmit = resolve)));

        fireEvent.click(saveButton());
        fireEvent.click(saveButton());

        expect(props.submit).toHaveBeenCalledTimes(1);
        resolveSubmit({ status: 'success', data: SAVED });
        await waitFor(() => expect(props.onSaved).toHaveBeenCalledTimes(1));
    });

    it('resets the name, alerts and error when reopened', async () => {
        const { props, rerender } = renderDialog();
        props.submit.mockRejectedValue(httpError(400, 'nope'));

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Changed' } });
        fireEvent.click(screen.getByLabelText('Email me new matches'));
        fireEvent.click(saveButton());
        expect(await screen.findByText('nope')).toBeInTheDocument();

        rerender(<SavedSearchFormDialog {...props} open={false} />);
        rerender(<SavedSearchFormDialog {...props} open />);

        await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Horses'));
        expect(screen.getByLabelText('Email me new matches')).toBeChecked();
        expect(screen.queryByText('nope')).not.toBeInTheDocument();
    });

    it('calls onClose on Cancel without submitting', () => {
        const { props } = renderDialog();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(props.onClose).toHaveBeenCalled();
        expect(props.submit).not.toHaveBeenCalled();
    });
});
