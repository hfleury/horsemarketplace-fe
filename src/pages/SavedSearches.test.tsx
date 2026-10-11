import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SavedSearches } from './SavedSearches';
import { savedSearchesApi } from '../api/savedSearches';
import { listingsPathFor } from '../lib/searchCriteria/listingsUrl';
import type { SavedSearch } from '../types/savedSearch';

vi.mock('../api/savedSearches', () => ({
    savedSearchesApi: { list: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const STOCKHOLM = { lat: 59.3293, lng: 18.0686, radius_km: 50 };

function makeSavedSearch(overrides: Partial<SavedSearch> = {}): SavedSearch {
    return {
        id: 's1',
        user_id: 'u1',
        name: 'Arabians near Stockholm',
        criteria: { breed: 'Arabian', min_age: 3, ...STOCKHOLM },
        location_label: 'Stockholm',
        alerts_enabled: true,
        last_notified_at: null,
        created_at: '2026-10-11T10:00:00Z',
        updated_at: '2026-10-11T10:00:00Z',
        ...overrides,
    };
}

function httpError(status: number, message: string) {
    return new Error(`HTTP ${status}: ${JSON.stringify({ status: 'error', message })}`);
}

function renderPage() {
    return render(
        <MemoryRouter>
            <SavedSearches />
        </MemoryRouter>
    );
}

async function openDeleteDialog(name: string) {
    fireEvent.click(await screen.findByRole('button', { name: `Delete ${name}` }));
    expect(await screen.findByRole('heading', { name: 'Delete saved search?' })).toBeInTheDocument();
}

describe('SavedSearches', () => {
    beforeEach(() => {
        vi.mocked(savedSearchesApi.list).mockReset();
        vi.mocked(savedSearchesApi.update).mockReset();
        vi.mocked(savedSearchesApi.remove).mockReset();
    });

    it('renders each saved search with its summary, alerts and date', async () => {
        vi.mocked(savedSearchesApi.list).mockResolvedValue({
            status: 'success',
            data: [makeSavedSearch(), makeSavedSearch({ id: 's2', name: 'Cheap saddles', criteria: { q: 'saddle' }, location_label: null, alerts_enabled: false })],
        });

        renderPage();

        expect(await screen.findByText('Arabians near Stockholm')).toBeInTheDocument();
        expect(screen.getByText('Arabian · Age 3+ · Within 50 km of Stockholm')).toBeInTheDocument();
        expect(screen.getByText('Cheap saddles')).toBeInTheDocument();
        expect(screen.getByText('"saddle"')).toBeInTheDocument();
        expect(screen.getByText('Email alerts on')).toBeInTheDocument();
        expect(screen.getByText('Email alerts off')).toBeInTheDocument();
        expect(screen.getAllByText('Saved 2026-10-11')).toHaveLength(2);
    });

    it('links Open to the listings URL for the saved criteria', async () => {
        const savedSearch = makeSavedSearch();
        vi.mocked(savedSearchesApi.list).mockResolvedValue({ status: 'success', data: [savedSearch] });

        renderPage();

        expect(await screen.findByRole('link', { name: `Open ${savedSearch.name}` })).toHaveAttribute(
            'href',
            listingsPathFor(savedSearch.criteria, 'Stockholm')
        );
    });

    it('shows the empty state with a browse link', async () => {
        vi.mocked(savedSearchesApi.list).mockResolvedValue({ status: 'success', data: [] });

        renderPage();

        expect(await screen.findByText("You haven't saved any searches yet.")).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Browse listings' })).toHaveAttribute('href', '/listings');
    });

    it('shows an error banner when loading fails', async () => {
        vi.mocked(savedSearchesApi.list).mockRejectedValue(new Error('Network down'));

        renderPage();

        expect(await screen.findByText('Network down')).toBeInTheDocument();
    });

    it('edits the name and alerts with a full update and shows the result', async () => {
        const savedSearch = makeSavedSearch();
        vi.mocked(savedSearchesApi.list).mockResolvedValue({ status: 'success', data: [savedSearch] });
        vi.mocked(savedSearchesApi.update).mockResolvedValue({
            status: 'success',
            data: { ...savedSearch, name: 'Renamed', alerts_enabled: false },
        });

        renderPage();

        fireEvent.click(await screen.findByRole('button', { name: `Edit ${savedSearch.name}` }));
        expect(await screen.findByLabelText('Name')).toHaveValue(savedSearch.name);
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Renamed' } });
        fireEvent.click(screen.getByLabelText('Email me new matches'));
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

        await waitFor(() =>
            expect(savedSearchesApi.update).toHaveBeenCalledWith('s1', {
                name: 'Renamed',
                criteria: savedSearch.criteria,
                location_label: 'Stockholm',
                alerts_enabled: false,
            })
        );
        expect(await screen.findByText('Renamed')).toBeInTheDocument();
        expect(screen.getByText('Email alerts off')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Edit saved search' })).not.toBeInTheDocument());
    });

    it('deletes after confirmation', async () => {
        vi.mocked(savedSearchesApi.list).mockResolvedValue({ status: 'success', data: [makeSavedSearch()] });
        vi.mocked(savedSearchesApi.remove).mockResolvedValue({ status: 'success', data: null });

        renderPage();

        await openDeleteDialog('Arabians near Stockholm');
        expect(
            screen.getByText(`"Arabians near Stockholm" will be deleted and you'll stop getting alerts for it.`)
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        await waitFor(() => expect(savedSearchesApi.remove).toHaveBeenCalledWith('s1'));
        await waitFor(() => expect(screen.queryByText('Arabians near Stockholm')).not.toBeInTheDocument());
        expect(screen.getByText("You haven't saved any searches yet.")).toBeInTheDocument();
    });

    it('does not delete when cancelled', async () => {
        vi.mocked(savedSearchesApi.list).mockResolvedValue({ status: 'success', data: [makeSavedSearch()] });

        renderPage();

        await openDeleteDialog('Arabians near Stockholm');
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Delete saved search?' })).not.toBeInTheDocument());
        expect(savedSearchesApi.remove).not.toHaveBeenCalled();
        expect(screen.getByText('Arabians near Stockholm')).toBeInTheDocument();
    });

    it('shows the mapped message and keeps the item when deleting fails', async () => {
        vi.mocked(savedSearchesApi.list).mockResolvedValue({ status: 'success', data: [makeSavedSearch()] });
        vi.mocked(savedSearchesApi.remove).mockRejectedValue(httpError(404, 'saved search not found'));

        renderPage();

        await openDeleteDialog('Arabians near Stockholm');
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(await screen.findByText('This saved search no longer exists.')).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole('heading', { name: 'Delete saved search?' })).not.toBeInTheDocument());
        expect(screen.getByText('Arabians near Stockholm')).toBeInTheDocument();
    });
});
