import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import { messagingApi } from '../../api/messaging';
import { usePolling } from '../../hooks/usePolling';
import { extractBackendMessage, fetchAllMessages, mapMessagingError } from '../../lib/messagingHelpers';
import type { Message } from '../../types/messaging';

const POLL_INTERVAL_MS = 7000;

interface ConversationThreadPanelProps {
    conversationId: string;
    counterpartyUsername: string;
}

export function ConversationThreadPanel({ conversationId, counterpartyUsername }: ConversationThreadPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messageListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDraft('');
        setSending(false);
        setError(null);
        setMessages([]);
        setLoading(true);

        fetchAllMessages(conversationId)
            .then(setMessages)
            .catch((err) => setError(mapMessagingError(extractBackendMessage(err))))
            .finally(() => setLoading(false));
    }, [conversationId]);

    usePolling(
        () => {
            fetchAllMessages(conversationId).then(setMessages);
        },
        POLL_INTERVAL_MS,
        true
    );

    useEffect(() => {
        const messageList = messageListRef.current;
        if (messageList) messageList.scrollTop = messageList.scrollHeight;
    }, [messages]);

    async function handleSend() {
        const body = draft.trim();
        if (!body) return;

        setSending(true);
        setError(null);
        try {
            const response = await messagingApi.sendMessage(conversationId, body);
            if (response.status === 'success' && response.data) {
                const sentMessage = response.data;
                setMessages((current) => [...current, sentMessage]);
                setDraft('');
            } else {
                setError(mapMessagingError(response.message ?? null));
            }
        } catch (err) {
            setError(mapMessagingError(extractBackendMessage(err)));
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex h-96 flex-col overflow-hidden rounded-2xl border border-dark-200 bg-dark-300 text-white">
            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {loading && <p className="text-sm text-text-secondary">Loading conversation...</p>}

                {!loading &&
                    messages.map((message) => {
                        const isMine = message.is_mine;
                        return (
                            <div key={message.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                <span className="mb-1 text-xs text-text-secondary">{isMine ? 'You' : counterpartyUsername}</span>
                                <p
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                                        isMine ? 'bg-accent-purple text-white' : 'bg-dark-200 text-white'
                                    }`}
                                >
                                    {message.body}
                                </p>
                            </div>
                        );
                    })}
            </div>

            {error && <p className="px-4 pb-2 text-sm text-red-500">{error}</p>}

            <div className="flex items-center gap-2 border-t border-dark-200 p-3">
                <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Type a message..."
                    aria-label="Message"
                    className="flex-1 rounded-md border border-dark-100 bg-dark-200 px-3 py-2 text-sm text-white focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple"
                />
                <Button
                    variant="primary"
                    size="sm"
                    isLoading={sending}
                    disabled={!draft.trim() || sending}
                    onClick={handleSend}
                >
                    Send
                </Button>
            </div>
        </div>
    );
}

export default ConversationThreadPanel;
