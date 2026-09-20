export interface Conversation {
    id: string;
    product_id: string;
    buyer_id: string;
    seller_id: string;
    buyer_last_read_at: string | null;
    seller_last_read_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: number;
    conversation_id: string;
    sender_id: string;
    body: string;
    created_at: string;
    is_mine: boolean;
}

export interface CreateConversationRequest {
    product_id: string;
}

export interface SendMessageRequest {
    body: string;
}

export interface ListMessagesResponse {
    messages: Message[];
    has_more: boolean;
}

export interface ConversationSummary {
    id: string;
    product_id: string;
    product_title: string;
    product_thumbnail_url: string | null;
    counterparty_id: string;
    counterparty_username: string;
    last_message_body: string | null;
    last_message_sender_id: string | null;
    last_message_at: string | null;
    is_unread: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginatedConversations {
    items: ConversationSummary[];
    total: number;
    page: number;
    limit: number;
}
