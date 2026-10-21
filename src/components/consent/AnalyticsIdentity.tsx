import { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useConsent } from '../../hooks/useConsent';
import { identifyUser, resetAnalyticsUser } from '../../lib/analytics';

// Links analytics to the signed-in user once they have consented, and forgets
// them on logout.
export const AnalyticsIdentity = () => {
    const { user } = useAuth();
    const { status } = useConsent();
    const identifiedUserId = useRef<string | null>(null);
    const userId = user?.id;

    useEffect(() => {
        if (status === 'accepted' && userId) {
            if (identifiedUserId.current !== userId) {
                identifyUser(userId);
                identifiedUserId.current = userId;
            }
            return;
        }
        if (!userId && identifiedUserId.current) {
            resetAnalyticsUser();
            identifiedUserId.current = null;
        }
    }, [status, userId]);

    return null;
};
