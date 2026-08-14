/**
 * apiFetch throws Error with message "HTTP <status>: <response body>", where the
 * response body is often JSON with a `message` field. Extracts that message,
 * falling back to the raw Error message, then to the caller-provided fallback.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
    if (!(err instanceof Error)) return fallback;

    const embeddedJson = /{.*}/.exec(err.message);
    if (embeddedJson) {
        try {
            const parsed = JSON.parse(embeddedJson[0]);
            if (parsed && typeof parsed.message === 'string') return parsed.message;
        } catch {
            // Not valid JSON — fall through to the raw message below.
        }
    }

    return err.message || fallback;
}
