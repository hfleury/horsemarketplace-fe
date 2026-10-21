import React, { useEffect, useState } from 'react';
import { ConsentContext, type ConsentStatus } from './consentContext';
import { startAnalytics, stopAnalytics } from '../lib/analytics';

export const CONSENT_STORAGE_KEY = 'analytics-consent';

function readStoredConsent(): ConsentStatus {
    try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        return stored === 'accepted' || stored === 'rejected' ? stored : 'unknown';
    } catch {
        return 'unknown';
    }
}

function storeConsent(status: ConsentStatus): void {
    try {
        localStorage.setItem(CONSENT_STORAGE_KEY, status);
    } catch {
        // The choice still applies for this visit; the banner will ask again next time.
    }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<ConsentStatus>(readStoredConsent);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (status === 'accepted') void startAnalytics();
    }, [status]);

    const choose = (choice: ConsentStatus) => {
        storeConsent(choice);
        setStatus(choice);
        setIsSettingsOpen(false);
        if (choice === 'rejected') stopAnalytics();
    };

    return (
        <ConsentContext.Provider
            value={{
                status,
                isBannerOpen: status === 'unknown' || isSettingsOpen,
                accept: () => choose('accepted'),
                reject: () => choose('rejected'),
                openSettings: () => setIsSettingsOpen(true),
            }}
        >
            {children}
        </ConsentContext.Provider>
    );
}
