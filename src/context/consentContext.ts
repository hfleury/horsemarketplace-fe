import { createContext } from 'react';

export type ConsentStatus = 'unknown' | 'accepted' | 'rejected';

export interface ConsentContextType {
    status: ConsentStatus;
    isBannerOpen: boolean;
    accept: () => void;
    reject: () => void;
    openSettings: () => void;
}

const initialState: ConsentContextType = {
    status: 'unknown',
    isBannerOpen: false,
    accept: () => undefined,
    reject: () => undefined,
    openSettings: () => undefined,
};

export const ConsentContext = createContext<ConsentContextType>(initialState);
