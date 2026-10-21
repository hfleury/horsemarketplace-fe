import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { AnalyticsIdentity } from './AnalyticsIdentity';
import { ConsentContext, type ConsentStatus } from '../../context/consentContext';
import { useAuth } from '../../hooks/useAuth';
import { identifyUser, resetAnalyticsUser } from '../../lib/analytics';
import type { User } from '../../types/auth';

vi.mock('../../hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('../../lib/analytics', () => ({
    identifyUser: vi.fn(),
    resetAnalyticsUser: vi.fn(),
}));

function mockUser(user: User | null) {
    vi.mocked(useAuth).mockReturnValue({
        user,
        token: user ? 'token' : null,
        login: vi.fn(),
        logout: vi.fn(),
        loading: false,
        error: null,
    });
}

function renderIdentity(status: ConsentStatus) {
    const ui = (consentStatus: ConsentStatus) => (
        <ConsentContext.Provider
            value={{ status: consentStatus, isBannerOpen: false, accept: vi.fn(), reject: vi.fn(), openSettings: vi.fn() }}
        >
            <AnalyticsIdentity />
        </ConsentContext.Provider>
    );
    const result = render(ui(status));
    return { rerender: (next: ConsentStatus) => result.rerender(ui(next)) };
}

const alice: User = { id: 'user-1', username: 'alice', email: 'alice@example.com' };

describe('AnalyticsIdentity', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('identifies a signed-in user once consent is given', () => {
        mockUser(alice);

        renderIdentity('accepted');

        expect(identifyUser).toHaveBeenCalledWith('user-1');
    });

    it('does not identify without consent', () => {
        mockUser(alice);

        renderIdentity('rejected');

        expect(identifyUser).not.toHaveBeenCalled();
    });

    it('does not identify a user saved without an id', () => {
        mockUser({ username: 'old', email: 'old@example.com' });

        renderIdentity('accepted');

        expect(identifyUser).not.toHaveBeenCalled();
    });

    it('resets the analytics user on logout', () => {
        mockUser(alice);
        const { rerender } = renderIdentity('accepted');

        mockUser(null);
        rerender('accepted');

        expect(resetAnalyticsUser).toHaveBeenCalledTimes(1);
    });
});
