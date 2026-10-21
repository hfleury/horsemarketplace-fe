import { useContext } from 'react';
import { ConsentContext } from '../context/consentContext';

export const useConsent = () => useContext(ConsentContext);
