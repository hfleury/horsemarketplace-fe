import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ConsentBanner } from './ConsentBanner';
import { ConsentContext, type ConsentContextType } from '../../context/consentContext';

function renderBanner(overrides: Partial<ConsentContextType> = {}) {
    const value: ConsentContextType = {
        status: 'unknown',
        isBannerOpen: true,
        accept: vi.fn(),
        reject: vi.fn(),
        openSettings: vi.fn(),
        ...overrides,
    };
    render(
        <MemoryRouter>
            <ConsentContext.Provider value={value}>
                <ConsentBanner />
            </ConsentContext.Provider>
        </MemoryRouter>
    );
    return value;
}

describe('ConsentBanner', () => {
    it('renders nothing when closed', () => {
        renderBanner({ isBannerOpen: false });

        expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument();
    });

    it('links to the privacy policy', () => {
        renderBanner();

        expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy-policy');
    });

    it('calls accept and reject from their buttons', async () => {
        const consent = renderBanner();

        await userEvent.click(screen.getByRole('button', { name: 'Accept' }));
        await userEvent.click(screen.getByRole('button', { name: 'Reject' }));

        expect(consent.accept).toHaveBeenCalledTimes(1);
        expect(consent.reject).toHaveBeenCalledTimes(1);
    });

    it('gives Accept and Reject the same styling', () => {
        renderBanner();

        expect(screen.getByRole('button', { name: 'Accept' }).className).toBe(
            screen.getByRole('button', { name: 'Reject' }).className
        );
    });
});
