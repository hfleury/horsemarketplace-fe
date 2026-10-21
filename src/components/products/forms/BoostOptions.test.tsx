import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import BoostOptions from './BoostOptions';
import { boostTiersApi } from '../../../api/boostTiers';
import { paymentsApi } from '../../../api/payments';
import type { BoostTier } from '../../../types/boostTiers';
import type { ProductFormValues } from '../../../lib/products/productFormValues';

vi.mock('../../../api/boostTiers', () => ({
    boostTiersApi: { listActive: vi.fn() },
}));
vi.mock('../../../api/payments', () => ({
    paymentsApi: { listProviders: vi.fn() },
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

function ChosenProvider() {
    const provider = useWatch<ProductFormValues, 'boost.provider'>({ name: 'boost.provider' });
    return <output data-testid="chosen-provider">{provider}</output>;
}

function FormHarness() {
    const methods = useForm<ProductFormValues>({ defaultValues: { boost: { tier_code: '' } } });
    return (
        <FormProvider {...methods}>
            <BoostOptions />
            <ChosenProvider />
        </FormProvider>
    );
}

function stubOptions(tiers: BoostTier[], providers: string[]) {
    vi.mocked(boostTiersApi.listActive).mockResolvedValue({ status: 'success', data: tiers });
    vi.mocked(paymentsApi.listProviders).mockResolvedValue({ status: 'success', data: providers });
}

describe('BoostOptions', () => {
    beforeEach(() => {
        vi.mocked(boostTiersApi.listActive).mockReset();
        vi.mocked(paymentsApi.listProviders).mockReset();
    });

    it('lists "No boost" first, then tiers cheapest first with price incl. moms', async () => {
        stubOptions([pro, boost], ['sandbox']);

        render(<FormHarness />);

        await screen.findByRole('radio', { name: /Pro/ });
        const labels = screen.getAllByRole('radio').map((radio) => radio.closest('label')?.textContent);
        expect(labels).toEqual(['No boost', 'Boost · 7 days · 49 SEK incl. moms', 'Pro · 30 days · 199 SEK incl. moms']);
        expect(screen.getByRole('radio', { name: 'No boost' })).toBeChecked();
    });

    it('disables the tiers and says so when no provider is configured', async () => {
        stubOptions([boost], []);

        render(<FormHarness />);

        expect(await screen.findByText('Boosting is not available right now')).toBeInTheDocument();
        screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
    });

    it('picks the only provider without showing a selector', async () => {
        stubOptions([boost], ['sandbox']);

        render(<FormHarness />);

        await screen.findByRole('radio', { name: /Boost ·/ });
        expect(screen.queryByLabelText('Payment provider')).not.toBeInTheDocument();
        expect(screen.getByTestId('chosen-provider')).toHaveTextContent('sandbox');
    });

    it('shows a provider selector when there are several providers', async () => {
        stubOptions([boost], ['klarna', 'sandbox']);

        render(<FormHarness />);

        const select = await screen.findByLabelText('Payment provider');
        expect(screen.getByRole('option', { name: 'klarna' })).toBeInTheDocument();
        expect(select).toHaveValue('');
    });

    it('shows the start date only after a tier is picked', async () => {
        stubOptions([boost], ['sandbox']);
        const user = userEvent.setup();

        render(<FormHarness />);

        const tierRadio = await screen.findByRole('radio', { name: /Boost ·/ });
        expect(screen.queryByLabelText(/Start date/)).not.toBeInTheDocument();
        await user.click(tierRadio);
        expect(screen.getByLabelText(/Start date/)).toHaveAttribute('type', 'date');
    });

    it('shows a message and no choices when the tiers fail to load', async () => {
        vi.mocked(boostTiersApi.listActive).mockRejectedValue(new Error('HTTP 500: {}'));
        vi.mocked(paymentsApi.listProviders).mockResolvedValue({ status: 'success', data: ['sandbox'] });

        render(<FormHarness />);

        expect(await screen.findByText("Boost options couldn't be loaded")).toBeInTheDocument();
        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
});
