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
