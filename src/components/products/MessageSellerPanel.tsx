import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import { messagingApi } from '../../api/messaging';
import { usePolling } from '../../hooks/usePolling';
import type { Conversation, Message } from '../../types/messaging';

const CANNOT_MESSAGE_OWN_LISTING = 'cannot message your own listing';
const CANNOT_MESSAGE_OWN_LISTING_USER_MESSAGE = "You can't message yourself about your own listing.";
const CONVERSATION_NOT_FOUND = 'conversation not found';
const CONVERSATION_NOT_FOUND_USER_MESSAGE = 'This conversation no longer exists.';
const NOT_CONVERSATION_PARTICIPANT = 'not a participant of this conversation';
const NOT_CONVERSATION_PARTICIPANT_USER_MESSAGE = "You don't have access to this conversation.";
const EMPTY_MESSAGE_BODY = 'message body cannot be empty';
const EMPTY_MESSAGE_BODY_USER_MESSAGE = "Message can't be empty.";
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const MESSAGE_PAGE_LIMIT = 100;
const POLL_INTERVAL_MS = 7000;

function extractBackendMessage(err: unknown): string | null {
    if (!(err instanceof Error)) return null;
    const rawBody = err.message.replace(/^HTTP \d+: /, '');
    try {
        const parsed = JSON.parse(rawBody) as { message?: string };
        return parsed.message ?? null;
    } catch {
        return null;
    }
}

function mapMessagingError(backendMessage: string | null): string {
    switch (backendMessage) {
        case CANNOT_MESSAGE_OWN_LISTING:
            return CANNOT_MESSAGE_OWN_LISTING_USER_MESSAGE;
        case CONVERSATION_NOT_FOUND:
            return CONVERSATION_NOT_FOUND_USER_MESSAGE;
        case NOT_CONVERSATION_PARTICIPANT:
            return NOT_CONVERSATION_PARTICIPANT_USER_MESSAGE;
        case EMPTY_MESSAGE_BODY:
            return EMPTY_MESSAGE_BODY_USER_MESSAGE;
        default:
            return backendMessage ?? GENERIC_ERROR_MESSAGE;
    }
}

async function fetchAllMessages(conversationId: string): Promise<Message[]> {
    const collected: Message[] = [];
    let afterId = 0;
    let hasMore = true;

    while (hasMore) {
        const response = await messagingApi.listMessages(conversationId, afterId, MESSAGE_PAGE_LIMIT);
        if (response.status !== 'success' || !response.data) break;

        collected.push(...response.data.messages);
        hasMore = response.data.has_more;
        if (collected.length > 0) {
            afterId = collected[collected.length - 1].id;
        }
    }

    return collected;
}

interface MessageSellerPanelProps {
    open: boolean;
    onClose: () => void;
    productId: string;
}

export function MessageSellerPanel({ open, onClose, productId }: MessageSellerPanelProps) {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messageListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        setDraft('');
        setSending(false);
        setError(null);
        setConversation(null);
        setMessages([]);
        setLoading(true);

        async function loadConversation() {
            try {
                const createResponse = await messagingApi.createConversation(productId);
                if (createResponse.status !== 'success' || !createResponse.data) {
                    setError(mapMessagingError(createResponse.message ?? null));
                    return;
                }

                const newConversation = createResponse.data;
                setConversation(newConversation);
                setMessages(await fetchAllMessages(newConversation.id));
            } catch (err) {
                setError(mapMessagingError(extractBackendMessage(err)));
            } finally {
                setLoading(false);
            }
        }

        loadConversation();
    }, [open, productId]);

    usePolling(
        () => {
            if (!conversation) return;
            fetchAllMessages(conversation.id).then(setMessages);
        },
        POLL_INTERVAL_MS,
        open && conversation !== null
    );

    useEffect(() => {
        const messageList = messageListRef.current;
        if (messageList) messageList.scrollTop = messageList.scrollHeight;
    }, [messages]);

    async function handleSend() {
        const body = draft.trim();
        if (!body || !conversation) return;

        setSending(true);
        setError(null);
        try {
            const response = await messagingApi.sendMessage(conversation.id, body);
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

    if (!open) return null;

    return (
        <div className="fixed bottom-4 right-4 z-40 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-dark-200 bg-dark-300 text-white shadow-glow-md md:w-96">
            <div className="flex items-center justify-between border-b border-dark-200 px-4 py-3">
                <span className="font-medium">Chat with seller</span>
                <IconButton
                    icon={<X className="h-4 w-4" />}
                    ariaLabel="Close chat"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                />
            </div>

            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                {loading && <p className="text-sm text-text-secondary">Loading conversation...</p>}

                {!loading &&
                    messages.map((message) => {
                        const isMine = conversation !== null && message.sender_id === conversation.buyer_id;
                        return (
                            <div key={message.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                <span className="mb-1 text-xs text-text-secondary">{isMine ? 'You' : 'Seller'}</span>
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
                    disabled={!draft.trim() || sending || !conversation}
                    onClick={handleSend}
                >
                    Send
                </Button>
            </div>
        </div>
    );
}

export default MessageSellerPanel;
