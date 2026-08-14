import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock('../../context/ThemeContext', () => ({
    useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({ user: null, logout: vi.fn() }),
}));

describe('Header search', () => {
    beforeEach(() => {
        navigateMock.mockReset();
    });

    it('navigates to /listings?q=<term> when the desktop search is submitted', () => {
        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        const input = screen.getByPlaceholderText('Search items, collections...');
        fireEvent.change(input, { target: { value: 'stockholm horse' } });
        fireEvent.submit(input.closest('form')!);

        expect(navigateMock).toHaveBeenCalledWith('/listings?q=stockholm%20horse');
    });

    it('navigates to /listings?q=<term> and closes the mobile menu when the mobile search is submitted', () => {
        const { container } = render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        const menuToggle = container.querySelector('svg.lucide-menu')!.closest('button')!;
        fireEvent.click(menuToggle);

        const input = screen.getByPlaceholderText('Search...');
        fireEvent.change(input, { target: { value: 'saddle' } });
        fireEvent.submit(input.closest('form')!);

        expect(navigateMock).toHaveBeenCalledWith('/listings?q=saddle');
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });
});
