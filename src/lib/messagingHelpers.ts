import { messagingApi } from '../api/messaging';
import type { Message } from '../types/messaging';

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

export function extractBackendMessage(err: unknown): string | null {
    if (!(err instanceof Error)) return null;
    const rawBody = err.message.replace(/^HTTP \d+: /, '');
    try {
        const parsed = JSON.parse(rawBody) as { message?: string };
        return parsed.message ?? null;
    } catch {
        return null;
    }
}

export function mapMessagingError(backendMessage: string | null): string {
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

export async function fetchAllMessages(conversationId: string): Promise<Message[]> {
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
