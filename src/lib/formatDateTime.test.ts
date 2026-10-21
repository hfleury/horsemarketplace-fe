import { describe, it, expect } from 'vitest';
import { formatSwedishDateTime } from './formatDateTime';

describe('formatSwedishDateTime', () => {
    it.each([
        ['winter time is UTC+1', '2026-12-24T08:00:00Z', '2026-12-24 09:00'],
        ['summer time is UTC+2', '2026-07-01T10:00:00Z', '2026-07-01 12:00'],
        ['an offset timestamp', '2026-12-24T09:00:00+01:00', '2026-12-24 09:00'],
        ['a UTC time on the previous day', '2026-12-31T23:30:00Z', '2027-01-01 00:30'],
    ])('%s', (_name, isoTimestamp, expected) => {
        expect(formatSwedishDateTime(isoTimestamp)).toBe(expected);
    });
});
