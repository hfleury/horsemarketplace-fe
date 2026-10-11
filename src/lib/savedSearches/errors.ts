import { extractBackendMessage } from '../messagingHelpers';

const USER_MESSAGES_BY_BACKEND_MESSAGE = new Map([
    [
        'saved search limit reached',
        "You've reached the limit of 20 saved searches — delete one from My saved searches to save a new one.",
    ],
    ['Invalid or expired token', 'Your session has expired — please log in again.'],
    ['saved search not found', 'This saved search no longer exists.'],
]);

export function savedSearchErrorMessage(err: unknown, fallback: string): string {
    return toSavedSearchUserMessage(extractBackendMessage(err), fallback);
}

// For an error envelope that arrives without a throw.
export function toSavedSearchUserMessage(backendMessage: string | null | undefined, fallback: string): string {
    if (!backendMessage) return fallback;
    return USER_MESSAGES_BY_BACKEND_MESSAGE.get(backendMessage) ?? backendMessage;
}
