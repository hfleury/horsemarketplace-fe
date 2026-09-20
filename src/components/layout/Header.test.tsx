import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { messagingApi } from '../../api/messaging';

const navigateMock = vi.fn();
let mockUser: { username: string; email: string; role: string; avatar?: string } | null = null;

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock('../../hooks/useTheme', () => ({
    useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({ user: mockUser, logout: vi.fn() }),
}));

vi.mock('../../api/messaging', () => ({
    messagingApi: {
        countUnreadConversations: vi.fn(),
    },
}));

describe('Header search', () => {
    beforeEach(() => {
        navigateMock.mockReset();
        mockUser = null;
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

describe('Header logged-in', () => {
    beforeEach(() => {
        mockUser = { username: 'alice', email: 'alice@example.com', role: 'user' };
        vi.mocked(messagingApi.countUnreadConversations).mockReset();
    });

    it('renders an Inbox link and unread badge when there are unread conversations', async () => {
        vi.mocked(messagingApi.countUnreadConversations).mockResolvedValue({
            status: 'success',
            data: { unread_count: 3 },
        });

        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        await waitFor(() => expect(messagingApi.countUnreadConversations).toHaveBeenCalled());
        const inboxLinks = await screen.findAllByRole('link', { name: /inbox/i });
        expect(inboxLinks.length).toBeGreaterThan(0);
        const badges = await screen.findAllByText('3');
        expect(badges.length).toBeGreaterThan(0);
    });

    it('renders the Inbox link with no badge when there are no unread conversations', async () => {
        vi.mocked(messagingApi.countUnreadConversations).mockResolvedValue({
            status: 'success',
            data: { unread_count: 0 },
        });

        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        await waitFor(() => expect(messagingApi.countUnreadConversations).toHaveBeenCalled());
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
});
