import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoostTierFormDialog } from './BoostTierFormDialog';
import type { BoostTierFormInput } from '../../lib/boostTiers/validation';
import type { BoostTier } from '../../types/boostTiers';

const emptyInput: BoostTierFormInput = { code: '', name: '', price: '', duration: '' };

const savedTier: BoostTier = {
    id: 't1',
    code: 'premium',
    name: 'Premium',
    price_sek: 299,
    duration_days: 60,
    is_active: true,
    created_at: '2026-10-21T00:00:00Z',
    updated_at: '2026-10-21T00:00:00Z',
};

function renderDialog(overrides: Partial<Parameters<typeof BoostTierFormDialog>[0]> = {}) {
    const props = {
        open: true,
        onClose: vi.fn(),
        title: 'New boost tier',
        submitLabel: 'Create',
        initialValues: emptyInput,
        submit: vi.fn().mockResolvedValue({ status: 'success', data: savedTier }),
        onSaved: vi.fn(),
        ...overrides,
    };
    render(<BoostTierFormDialog {...props} />);
    return props;
}

async function fillForm(values: Partial<BoostTierFormInput>) {
    const labels: Record<keyof BoostTierFormInput, string> = {
        code: 'Code',
        name: 'Name',
        price: 'Price (SEK incl. moms)',
        duration: 'Duration (days)',
    };
    for (const [field, value] of Object.entries(values) as [keyof BoostTierFormInput, string][]) {
        const input = screen.getByLabelText(labels[field]);
        await userEvent.clear(input);
        if (value) await userEvent.type(input, value);
    }
}

describe('BoostTierFormDialog', () => {
    it('submits parsed values and reports the saved tier', async () => {
        const props = renderDialog();

        await fillForm({ code: 'premium', name: ' Premium ', price: '299,50', duration: '60' });
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(props.submit).toHaveBeenCalledWith({ code: 'premium', name: 'Premium', price_sek: 299.5, duration_days: 60 });
        expect(props.onSaved).toHaveBeenCalledWith(savedTier);
    });

    it('shows a message for every invalid field and does not submit', async () => {
        const props = renderDialog();

        await fillForm({ code: 'Bad Code', name: ' ', price: '0', duration: '400' });
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(screen.getByText(/lowercase letters/)).toBeInTheDocument();
        expect(screen.getByText(/Name must be between/)).toBeInTheDocument();
        expect(screen.getByText(/Price must be greater than 0/)).toBeInTheDocument();
        expect(screen.getByText(/between 1 and 365/)).toBeInTheDocument();
        expect(screen.getByLabelText('Code')).toHaveAttribute('aria-invalid', 'true');
        expect(props.submit).not.toHaveBeenCalled();
    });

    it('shows a locked code as text instead of an input', async () => {
        const props = renderDialog({
            title: 'Edit boost tier',
            submitLabel: 'Save',
            lockedCode: 'boost',
            initialValues: { code: 'boost', name: 'Boost', price: '49', duration: '7' },
        });

        expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
        expect(screen.getByText('boost')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(props.submit).toHaveBeenCalledWith({ code: 'boost', name: 'Boost', price_sek: 49, duration_days: 7 });
    });

    it('shows the backend message when saving fails', async () => {
        const submit = vi.fn().mockRejectedValue(new Error('HTTP 409: {"status":"error","message":"boost tier code already exists"}'));
        const props = renderDialog({ submit });

        await fillForm({ code: 'boost', name: 'Boost', price: '49', duration: '7' });
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('boost tier code already exists');
        expect(props.onSaved).not.toHaveBeenCalled();
    });

    it('shows the response message for a non-success envelope', async () => {
        const submit = vi.fn().mockResolvedValue({ status: 'error', message: 'Nope' });
        renderDialog({ submit });

        await fillForm({ code: 'boost', name: 'Boost', price: '49', duration: '7' });
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Nope');
    });

    it('closes without submitting on Cancel', async () => {
        const props = renderDialog();

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(props.onClose).toHaveBeenCalled();
        expect(props.submit).not.toHaveBeenCalled();
    });
});
