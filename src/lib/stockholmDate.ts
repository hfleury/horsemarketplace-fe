const STOCKHOLM = 'Europe/Stockholm';
const MINUTE_MS = 60_000;

const offsetFormatter = new Intl.DateTimeFormat('en', { timeZone: STOCKHOLM, timeZoneName: 'longOffset' });
const dateFormatter = new Intl.DateTimeFormat('en', {
    timeZone: STOCKHOLM,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

/** Stockholm's UTC offset at an instant, as "+02:00". */
function stockholmOffsetAt(instant: Date): string {
    const zoneName = offsetFormatter.formatToParts(instant).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
    return zoneName === 'GMT' ? '+00:00' : zoneName.replace('GMT', '');
}

function offsetToMinutes(offset: string): number {
    const sign = offset.startsWith('-') ? -1 : 1;
    const [hours, minutes] = offset.slice(1).split(':').map(Number);
    return sign * (hours * 60 + minutes);
}

/**
 * Midnight in Stockholm on a calendar date ("YYYY-MM-DD") as RFC 3339, e.g.
 * "2026-07-01T00:00:00+02:00". The offset is re-read at the real midnight
 * instant, so DST switch days get the offset that applies at 00:00.
 */
export function toStockholmStartOfDay(date: string): string {
    const midnightAsUtc = new Date(`${date}T00:00:00Z`);
    const firstGuess = stockholmOffsetAt(midnightAsUtc);
    const midnight = new Date(midnightAsUtc.getTime() - offsetToMinutes(firstGuess) * MINUTE_MS);
    return `${date}T00:00:00${stockholmOffsetAt(midnight)}`;
}

/** Today's calendar date in Stockholm, as "YYYY-MM-DD". */
export function stockholmToday(now: Date = new Date()): string {
    const parts = dateFormatter.formatToParts(now);
    const valueOf = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
    return `${valueOf('year')}-${valueOf('month')}-${valueOf('day')}`;
}
