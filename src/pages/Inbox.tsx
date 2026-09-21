import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messagingApi } from '../api/messaging';
import { ConversationThreadPanel } from '../components/messaging/ConversationThreadPanel';
import { SectionHeader } from '../components/common/SectionHeader';
import Button from '../components/ui/Button';
import type { ConversationSummary } from '../types/messaging';

const LIMIT = 20;

export const Inbox = () => {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedConversationId, setExpandedConversationId] = useState<string | null>(null);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await messagingApi.listConversations(page, LIMIT);
                if (response.status === 'success' && response.data) {
                    setConversations(response.data.items ?? []);
                    setTotal(response.data.total);
                } else {
                    setError(response.message || 'Failed to fetch conversations');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [page]);

    const handleToggleConversation = (conversationId: string) => {
        setExpandedConversationId((current) => (current === conversationId ? null : conversationId));
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === conversationId ? { ...conversation, is_unread: false } : conversation
            )
        );
    };

    const hasNextPage = page * LIMIT < total;
    const hasPrevPage = page > 1;

    return (
        <section className="py-24 px-6 md:px-12 bg-background">
            <div className="container-custom">
                <SectionHeader title="Inbox" subtitle="Your conversations with buyers and sellers" />

                {error && (
                    <div className="mb-8 text-center text-red-500 bg-red-100 p-3 rounded">{error}</div>
                )}

                {loading ? (
                    <div className="p-10 text-center text-text-secondary">Loading conversations...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-10 text-center text-text-secondary">No conversations yet.</div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className="rounded-2xl border border-dark-200 bg-white dark:bg-card p-4"
                            >
                                <div className="flex items-center gap-4">
                                    {conversation.product_thumbnail_url ? (
                                        <img
                                            src={conversation.product_thumbnail_url}
                                            alt={conversation.product_title}
                                            className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-dark-100/50 dark:bg-dark-200/30" />
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            {conversation.is_unread && (
                                                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-accent-purple" />
                                            )}
                                            <Link
                                                to={`/listings/${conversation.product_id}`}
                                                className={`truncate font-display ${conversation.is_unread ? 'font-bold' : 'font-medium'} text-text-primary hover:text-accent-purple`}
                                            >
                                                {conversation.product_title}
                                            </Link>
                                        </div>
                                        <p className="truncate text-sm text-text-secondary">
                                            {conversation.counterparty_username}
                                        </p>
                                        {conversation.last_message_body && (
                                            <p
                                                className={`truncate text-sm ${conversation.is_unread ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}
                                            >
                                                {conversation.last_message_body}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleConversation(conversation.id)}
                                    >
                                        {expandedConversationId === conversation.id ? 'Hide conversation' : 'View conversation'}
                                    </Button>
                                </div>

                                {expandedConversationId === conversation.id && (
                                    <div className="mt-4">
                                        <ConversationThreadPanel
                                            conversationId={conversation.id}
                                            counterpartyUsername={conversation.counterparty_username}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-10 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasPrevPage}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-text-secondary text-sm">Page {page}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Inbox;
