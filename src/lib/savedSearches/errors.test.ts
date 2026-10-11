import { describe, it, expect } from 'vitest';
import { savedSearchErrorMessage, toSavedSearchUserMessage } from './errors';

const FALLBACK = 'Something failed.';

function httpError(status: number, message: string) {
    return new Error(`HTTP ${status}: ${JSON.stringify({ status: 'error', message })}`);
}

describe('savedSearchErrorMessage', () => {
    it.each([
        [
            409,
            'saved search limit reached',
            "You've reached the limit of 20 saved searches — delete one from My saved searches to save a new one.",
        ],
        [401, 'Invalid or expired token', 'Your session has expired — please log in again.'],
        [404, 'saved search not found', 'This saved search no longer exists.'],
    ])('maps the %i "%s" message', (status, backendMessage, expected) => {
        expect(savedSearchErrorMessage(httpError(status, backendMessage), FALLBACK)).toBe(expected);
    });

    it('passes an unmapped message through as-is', () => {
        const message = 'invalid search criteria: min_age exceeds max_age';
        expect(savedSearchErrorMessage(httpError(400, message), FALLBACK)).toBe(message);
    });

    it('falls back for a non-JSON error body', () => {
        expect(savedSearchErrorMessage(new Error('HTTP 502: <html>Bad gateway</html>'), FALLBACK)).toBe(FALLBACK);
    });

    it('falls back for a non-Error throw', () => {
        expect(savedSearchErrorMessage('boom', FALLBACK)).toBe(FALLBACK);
    });
});

describe('toSavedSearchUserMessage', () => {
    it('maps a known message, passes others through and falls back when empty', () => {
        expect(toSavedSearchUserMessage('saved search not found', FALLBACK)).toBe('This saved search no longer exists.');
        expect(toSavedSearchUserMessage('constructor', FALLBACK)).toBe('constructor');
        expect(toSavedSearchUserMessage(undefined, FALLBACK)).toBe(FALLBACK);
    });
});
