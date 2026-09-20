import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageSellerPanel } from './MessageSellerPanel';
import { messagingApi } from '../../api/messaging';
import type { Conversation, Message } from '../../types/messaging';

vi.mock('../../api/messaging', () => ({
    messagingApi: {
        createConversation: vi.fn(),
        sendMessage: vi.fn(),
        listMessages: vi.fn(),
    },
}));

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
    return {
        id: 'conv-1',
        product_id: 'p1',
        buyer_id: 'buyer-1',
        seller_id: 'seller-1',
        buyer_last_read_at: null,
        seller_last_read_at: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

function makeMessage(overrides: Partial<Message> = {}): Message {
    return {
        id: 1,
        conversation_id: 'conv-1',
        sender_id: 'buyer-1',
        body: 'hello',
        created_at: '2026-01-01T00:00:00Z',
        ...overrides,
    };
}

describe('MessageSellerPanel', () => {
    beforeEach(() => {
        vi.mocked(messagingApi.createConversation).mockReset();
        vi.mocked(messagingApi.sendMessage).mockReset();
        vi.mocked(messagingApi.listMessages).mockReset();
    });

    it('creates/reuses the conversation and renders its messages on open', async () => {
        vi.mocked(messagingApi.createConversation).mockResolvedValue({
            status: 'success',
            data: makeConversation(),
        });
        vi.mocked(messagingApi.listMessages).mockResolvedValue({
            status: 'success',
            data: { messages: [makeMessage({ id: 1, body: 'Hi there' })], has_more: false },
        });

        render(<MessageSellerPanel open onClose={vi.fn()} productId="p1" />);

        await waitFor(() => expect(screen.getByText('Hi there')).toBeInTheDocument());
        expect(messagingApi.createConversation).toHaveBeenCalledWith('p1');
        expect(messagingApi.listMessages).toHaveBeenCalledWith('conv-1', 0, 100);
    });

    it('pages through listMessages until has_more is false', async () => {
        vi.mocked(messagingApi.createConversation).mockResolvedValue({
            status: 'success',
            data: makeConversation(),
        });
        vi.mocked(messagingApi.listMessages)
            .mockResolvedValueOnce({
                status: 'success',
                data: { messages: [makeMessage({ id: 1, body: 'Page one' })], has_more: true },
            })
            .mockResolvedValueOnce({
                status: 'success',
                data: { messages: [makeMessage({ id: 2, body: 'Page two' })], has_more: false },
            });

        render(<MessageSellerPanel open onClose={vi.fn()} productId="p1" />);

        await waitFor(() => expect(screen.getByText('Page two')).toBeInTheDocument());
        expect(screen.getByText('Page one')).toBeInTheDocument();
        expect(messagingApi.listMessages).toHaveBeenNthCalledWith(1, 'conv-1', 0, 100);
        expect(messagingApi.listMessages).toHaveBeenNthCalledWith(2, 'conv-1', 1, 100);
    });

    it('labels a message from the buyer as "You" and any other sender as "Seller"', async () => {
        vi.mocked(messagingApi.createConversation).mockResolvedValue({
            status: 'success',
            data: makeConversation(),
        });
        vi.mocked(messagingApi.listMessages).mockResolvedValue({
            status: 'success',
            data: {
                messages: [
                    makeMessage({ id: 1, sender_id: 'buyer-1', body: 'From buyer' }),
                    makeMessage({ id: 2, sender_id: 'seller-1', body: 'From seller' }),
                ],
                has_more: false,
            },
        });

        render(<MessageSellerPanel open onClose={vi.fn()} productId="p1" />);

        await waitFor(() => expect(screen.getByText('From buyer')).toBeInTheDocument());
        expect(screen.getByText('From buyer').closest('div')).toHaveTextContent('You');
        expect(screen.getByText('From seller').closest('div')).toHaveTextContent('Seller');
    });

    it('sends a message, appends it to the list, and clears the draft', async () => {
        vi.mocked(messagingApi.createConversation).mockResolvedValue({
            status: 'success',
            data: makeConversation(),
        });
        vi.mocked(messagingApi.listMessages).mockResolvedValue({
            status: 'success',
            data: { messages: [], has_more: false },
        });
        vi.mocked(messagingApi.sendMessage).mockResolvedValue({
            status: 'success',
            data: makeMessage({ id: 5, body: 'New message' }),
        });

        render(<MessageSellerPanel open onClose={vi.fn()} productId="p1" />);
        await waitFor(() => expect(messagingApi.createConversation).toHaveBeenCalled());

        const input = screen.getByLabelText('Message');
        fireEvent.change(input, { target: { value: 'New message' } });
        fireEvent.click(screen.getByRole('button', { name: /send/i }));

        await waitFor(() => expect(messagingApi.sendMessage).toHaveBeenCalledWith('conv-1', 'New message'));
        await waitFor(() => expect(screen.getByText('New message')).toBeInTheDocument());
        expect(input).toHaveValue('');
    });

    it('shows the friendly self-message text on the self-messaging 403', async () => {
        vi.mocked(messagingApi.createConversation).mockRejectedValue(
            new Error('HTTP 403: {"status":"error","message":"cannot message your own listing"}')
        );

        render(<MessageSellerPanel open onClose={vi.fn()} productId="p1" />);

        await waitFor(() =>
            expect(screen.getByText("You can't message yourself about your own listing.")).toBeInTheDocument()
        );
    });

    it('polls for new messages while open and stops polling once closed', async () => {
        vi.useFakeTimers();
        vi.mocked(messagingApi.createConversation).mockResolvedValue({
            status: 'success',
            data: makeConversation(),
        });
        vi.mocked(messagingApi.listMessages).mockResolvedValue({
            status: 'success',
            data: { messages: [], has_more: false },
        });

        const { rerender } = render(<MessageSellerPanel open onClose={vi.fn()} productId="p1" />);

        await vi.waitFor(() => expect(messagingApi.listMessages).toHaveBeenCalledTimes(1));

        vi.advanceTimersByTime(7000);
        await vi.waitFor(() => expect(messagingApi.listMessages).toHaveBeenCalledTimes(2));

        rerender(<MessageSellerPanel open={false} onClose={vi.fn()} productId="p1" />);
        vi.advanceTimersByTime(7000);
        expect(messagingApi.listMessages).toHaveBeenCalledTimes(2);

        vi.useRealTimers();
    });

    it('calls onClose when the close button is clicked', async () => {
        vi.mocked(messagingApi.createConversation).mockResolvedValue({
            status: 'success',
            data: makeConversation(),
        });
        vi.mocked(messagingApi.listMessages).mockResolvedValue({
            status: 'success',
            data: { messages: [], has_more: false },
        });
        const onClose = vi.fn();

        render(<MessageSellerPanel open onClose={onClose} productId="p1" />);
        await waitFor(() => expect(messagingApi.createConversation).toHaveBeenCalled());

        fireEvent.click(screen.getByRole('button', { name: /close chat/i }));
        expect(onClose).toHaveBeenCalled();
    });
});
