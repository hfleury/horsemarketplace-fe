import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsentProvider, CONSENT_STORAGE_KEY } from './ConsentContext';
import { useConsent } from '../hooks/useConsent';
import { startAnalytics, stopAnalytics } from '../lib/analytics';

vi.mock('../lib/analytics', () => ({
    startAnalytics: vi.fn(),
    stopAnalytics: vi.fn(),
}));

function ConsentProbe() {
    const { status, isBannerOpen, accept, reject, openSettings } = useConsent();
    return (
        <div>
            <p>status: {status}</p>
            <p>banner: {isBannerOpen ? 'open' : 'closed'}</p>
            <button onClick={accept}>accept</button>
            <button onClick={reject}>reject</button>
            <button onClick={openSettings}>settings</button>
        </div>
    );
}

function renderProvider() {
    return render(
        <ConsentProvider>
            <ConsentProbe />
        </ConsentProvider>
    );
}

describe('ConsentProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('opens the banner and starts nothing when no choice is stored', () => {
        renderProvider();

        expect(screen.getByText('status: unknown')).toBeInTheDocument();
        expect(screen.getByText('banner: open')).toBeInTheDocument();
        expect(startAnalytics).not.toHaveBeenCalled();
    });

    it('starts analytics on load when consent was given before', () => {
        localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');

        renderProvider();

        expect(screen.getByText('banner: closed')).toBeInTheDocument();
        expect(startAnalytics).toHaveBeenCalled();
    });

    it('stores acceptance, starts analytics and closes the banner', async () => {
        renderProvider();

        await userEvent.click(screen.getByRole('button', { name: 'accept' }));

        expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('accepted');
        expect(startAnalytics).toHaveBeenCalled();
        expect(screen.getByText('banner: closed')).toBeInTheDocument();
    });

    it('stores rejection and stops analytics without starting it', async () => {
        renderProvider();

        await userEvent.click(screen.getByRole('button', { name: 'reject' }));

        expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('rejected');
        expect(stopAnalytics).toHaveBeenCalled();
        expect(startAnalytics).not.toHaveBeenCalled();
        expect(screen.getByText('banner: closed')).toBeInTheDocument();
    });

    it('reopens the banner from settings and lets the visitor change their mind', async () => {
        localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
        renderProvider();

        await userEvent.click(screen.getByRole('button', { name: 'settings' }));
        expect(screen.getByText('banner: open')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'reject' }));

        expect(screen.getByText('status: rejected')).toBeInTheDocument();
        expect(stopAnalytics).toHaveBeenCalled();
    });

    it('still works when localStorage throws', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });

        renderProvider();
        await userEvent.click(screen.getByRole('button', { name: 'accept' }));

        expect(screen.getByText('status: accepted')).toBeInTheDocument();
        expect(startAnalytics).toHaveBeenCalled();
    });
});
