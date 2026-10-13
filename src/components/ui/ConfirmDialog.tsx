import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from './Button';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    isConfirming?: boolean;
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
    isConfirming = false,
}: ConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{ className: 'bg-dark-300 text-white', sx: { backgroundColor: '#1F1F2E' } }}
        >
            <DialogTitle className="text-white">{title}</DialogTitle>
            <DialogContent>
                <p className="text-text-secondary">{message}</p>
            </DialogContent>
            <DialogActions className="p-4">
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" isLoading={isConfirming} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmDialog;
