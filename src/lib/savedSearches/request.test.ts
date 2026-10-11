import { describe, it, expect } from 'vitest';
import { toSavedSearchRequest } from './request';

const STOCKHOLM = { lat: 59.3293, lng: 18.0686, radius_km: 50 };

describe('toSavedSearchRequest', () => {
    it('trims the name', () => {
        expect(toSavedSearchRequest({ name: '  Horses  ', alertsEnabled: true }, { breed: 'Arabian' }).name).toBe(
            'Horses'
        );
    });

    it.each([true, false])('always sets alerts_enabled (%s)', (alertsEnabled) => {
        expect(toSavedSearchRequest({ name: 'Horses', alertsEnabled }, { breed: 'Arabian' })).toEqual({
            name: 'Horses',
            criteria: { breed: 'Arabian' },
            location_label: undefined,
            alerts_enabled: alertsEnabled,
        });
    });

    it('leaves out the location label without a location', () => {
        const request = toSavedSearchRequest({ name: 'Horses', alertsEnabled: true }, { breed: 'Arabian' }, 'Stockholm');
        expect(request.location_label).toBeUndefined();
    });

    it('includes the location label with a location', () => {
        const request = toSavedSearchRequest({ name: 'Near me', alertsEnabled: true }, STOCKHOLM, 'Stockholm');
        expect(request).toEqual({
            name: 'Near me',
            criteria: STOCKHOLM,
            location_label: 'Stockholm',
            alerts_enabled: true,
        });
    });
});
