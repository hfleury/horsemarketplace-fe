import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoostTiers } from './BoostTiers';
import { boostTiersApi } from '../../api/boostTiers';
import type { BoostTier } from '../../types/boostTiers';

vi.mock('../../api/boostTiers', () => ({
    boostTiersApi: { listAll: vi.fn(), create: vi.fn(), update: vi.fn(), listActive: vi.fn() },
}));

function makeTier(overrides: Partial<BoostTier>): BoostTier {
    return {
        id: 't1',
        code: 'boost',
        name: 'Boost',
        price_sek: 49,
        duration_days: 7,
        is_active: true,
        created_at: '2026-10-21T00:00:00Z',
        updated_at: '2026-10-21T00:00:00Z',
        ...overrides,
    };
}

const boost = makeTier({});
const pro = makeTier({ id: 't3', code: 'pro', name: 'Pro', price_sek: 199, duration_days: 30 });
const retired = makeTier({ id: 't9', code: 'retired', name: 'Retired', price_sek: 29, is_active: false });

function httpError(status: number, message: string) {
    return new Error(`HTTP ${status}: ${JSON.stringify({ status: 'error', message })}`);
}

function rowNames() {
    return screen.getAllByTestId('boost-tier-row').map((row) => within(row).getAllByRole('paragraph')[0].textContent);
}

function rowFor(name: string) {
    return screen.getAllByTestId('boost-tier-row').find((row) => row.textContent?.includes(name))!;
}

async function renderLoaded(tiers: BoostTier[]) {
    vi.mocked(boostTiersApi.listAll).mockResolvedValue({ status: 'success', data: tiers });
    render(<BoostTiers />);
    await screen.findAllByTestId('boost-tier-row');
}

describe('BoostTiers admin page', () => {
    beforeEach(() => {
        vi.mocked(boostTiersApi.listAll).mockReset();
        vi.mocked(boostTiersApi.create).mockReset();
        vi.mocked(boostTiersApi.update).mockReset();
    });

    it('shows a loading state, then the tiers sorted by price', async () => {
        vi.mocked(boostTiersApi.listAll).mockResolvedValue({ status: 'success', data: [pro, boost, retired] });

        render(<BoostTiers />);

        expect(screen.getByText('Loading boost tiers...')).toBeInTheDocument();
        await screen.findAllByTestId('boost-tier-row');
        expect(rowNames()).toEqual(['Retired', 'Boost', 'Pro']);
        expect(within(rowFor('Pro')).getByText('199 SEK')).toBeInTheDocument();
        expect(within(rowFor('Pro')).getByText('30 days')).toBeInTheDocument();
        expect(within(rowFor('Retired')).getByText('Inactive')).toBeInTheDocument();
        expect(within(rowFor('Boost')).getByText('Active')).toBeInTheDocument();
    });

    it('shows an empty state', async () => {
        vi.mocked(boostTiersApi.listAll).mockResolvedValue({ status: 'success', data: [] });

        render(<BoostTiers />);

        expect(await screen.findByText('No boost tiers yet.')).toBeInTheDocument();
    });

    it('shows the backend message when loading fails', async () => {
        vi.mocked(boostTiersApi.listAll).mockRejectedValue(httpError(403, 'Forbidden'));

        render(<BoostTiers />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Forbidden');
    });

    it('creates a tier and inserts it in price order', async () => {
        await renderLoaded([boost, pro]);
        const medium = makeTier({ id: 't2', code: 'medium', name: 'Medium', price_sek: 99, duration_days: 14 });
        vi.mocked(boostTiersApi.create).mockResolvedValue({ status: 'success', data: medium });

        await userEvent.click(screen.getByRole('button', { name: 'New tier' }));
        await userEvent.type(screen.getByLabelText('Code'), 'medium');
        await userEvent.type(screen.getByLabelText('Name'), 'Medium');
        await userEvent.type(screen.getByLabelText('Price (SEK incl. moms)'), '99');
        await userEvent.type(screen.getByLabelText('Duration (days)'), '14');
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(boostTiersApi.create).toHaveBeenCalledWith({ code: 'medium', name: 'Medium', price_sek: 99, duration_days: 14 });
        await waitFor(() => expect(rowNames()).toEqual(['Boost', 'Medium', 'Pro']));
        expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
    });

    it('edits a tier without changing its code or active state', async () => {
        await renderLoaded([retired, boost]);
        vi.mocked(boostTiersApi.update).mockResolvedValue({ status: 'success', data: { ...retired, price_sek: 39 } });

        await userEvent.click(screen.getByRole('button', { name: 'Edit Retired' }));
        expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
        const price = screen.getByLabelText('Price (SEK incl. moms)');
        expect(price).toHaveValue('29');
        await userEvent.clear(price);
        await userEvent.type(price, '39');
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(boostTiersApi.update).toHaveBeenCalledWith('t9', { name: 'Retired', price_sek: 39, duration_days: 7, is_active: false });
        await waitFor(() => expect(within(rowFor('Retired')).getByText('39 SEK')).toBeInTheDocument());
    });

    it('asks for confirmation before deactivating', async () => {
        await renderLoaded([boost]);
        vi.mocked(boostTiersApi.update).mockResolvedValue({ status: 'success', data: { ...boost, is_active: false } });

        await userEvent.click(within(rowFor('Boost')).getByRole('button', { name: 'Deactivate' }));
        expect(screen.getByText(/keep running until they end/)).toBeInTheDocument();
        expect(boostTiersApi.update).not.toHaveBeenCalled();
        await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Deactivate' }));

        expect(boostTiersApi.update).toHaveBeenCalledWith('t1', { name: 'Boost', price_sek: 49, duration_days: 7, is_active: false });
        await waitFor(() => expect(within(rowFor('Boost')).getByText('Inactive')).toBeInTheDocument());
    });

    it('sends nothing when the deactivation is cancelled', async () => {
        await renderLoaded([boost]);

        await userEvent.click(within(rowFor('Boost')).getByRole('button', { name: 'Deactivate' }));
        await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));

        expect(boostTiersApi.update).not.toHaveBeenCalled();
        expect(within(rowFor('Boost')).getByText('Active')).toBeInTheDocument();
    });

    it('activates an inactive tier straight away', async () => {
        await renderLoaded([retired]);
        vi.mocked(boostTiersApi.update).mockResolvedValue({ status: 'success', data: { ...retired, is_active: true } });

        await userEvent.click(within(rowFor('Retired')).getByRole('button', { name: 'Activate' }));

        expect(boostTiersApi.update).toHaveBeenCalledWith('t9', { name: 'Retired', price_sek: 29, duration_days: 7, is_active: true });
        await waitFor(() => expect(within(rowFor('Retired')).getByText('Active')).toBeInTheDocument());
    });

    it('shows an error banner when changing the status fails', async () => {
        await renderLoaded([retired]);
        vi.mocked(boostTiersApi.update).mockRejectedValue(httpError(500, 'Failed to update boost tier'));

        await userEvent.click(within(rowFor('Retired')).getByRole('button', { name: 'Activate' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Failed to update boost tier');
        expect(within(rowFor('Retired')).getByText('Inactive')).toBeInTheDocument();
    });
});
