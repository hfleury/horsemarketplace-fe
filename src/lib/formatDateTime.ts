/** Formats an ISO timestamp in Swedish time, e.g. "2026-12-24 09:00". */
export function formatSwedishDateTime(isoTimestamp: string): string {
    return new Date(isoTimestamp).toLocaleString('sv-SE', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Europe/Stockholm',
    });
}
