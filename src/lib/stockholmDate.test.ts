import { describe, it, expect } from 'vitest';
import { stockholmToday, toStockholmStartOfDay } from './stockholmDate';

describe('toStockholmStartOfDay', () => {
    it.each([
        ['a summer date is UTC+2', '2026-07-01', '2026-07-01T00:00:00+02:00'],
        ['a winter date is UTC+1', '2026-12-24', '2026-12-24T00:00:00+01:00'],
        ['midnight on the autumn DST switch day is still UTC+2', '2026-10-25', '2026-10-25T00:00:00+02:00'],
        ['midnight on the spring DST switch day is still UTC+1', '2026-03-29', '2026-03-29T00:00:00+01:00'],
    ])('%s', (_name, date, expected) => {
        expect(toStockholmStartOfDay(date)).toBe(expected);
    });

    it('names the same instant as Stockholm midnight', () => {
        expect(new Date(toStockholmStartOfDay('2026-07-01')).toISOString()).toBe('2026-06-30T22:00:00.000Z');
    });
});

describe('stockholmToday', () => {
    it('uses the Stockholm calendar date, not UTC', () => {
        expect(stockholmToday(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
    });

    it('formats as YYYY-MM-DD', () => {
        expect(stockholmToday(new Date('2026-07-01T10:00:00Z'))).toBe('2026-07-01');
    });
});
