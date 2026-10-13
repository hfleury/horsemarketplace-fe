import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

function renderDialog(isConfirming = false) {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
        <ConfirmDialog
            open
            title="Delete saved search?"
            message='"Horses" will be deleted.'
            confirmLabel="Delete"
            onConfirm={onConfirm}
            onCancel={onCancel}
            isConfirming={isConfirming}
        />
    );
    return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
    it('renders the title and message', () => {
        renderDialog();

        expect(screen.getByRole('heading', { name: 'Delete saved search?' })).toBeInTheDocument();
        expect(screen.getByText('"Horses" will be deleted.')).toBeInTheDocument();
    });

    it('calls onCancel on Cancel', () => {
        const { onCancel, onConfirm } = renderDialog();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm on the confirm button', () => {
        const { onConfirm } = renderDialog();

        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('disables the confirm button while confirming', () => {
        renderDialog(true);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    });
});
