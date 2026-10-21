import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useConsent } from '../../hooks/useConsent';

export const ConsentBanner = () => {
    const { isBannerOpen, accept, reject } = useConsent();

    if (!isBannerOpen) return null;

    return (
        <div
            role="region"
            aria-label="Cookie consent"
            className="fixed bottom-0 inset-x-0 z-50 border-t border-dark-200 bg-dark-100 px-4 py-4 shadow-lg"
        >
            <div className="container-custom flex flex-col md:flex-row md:items-center gap-4">
                <p className="text-sm text-text-muted flex-grow">
                    May we measure how the site is used? With your permission we use PostHog (EU) to count
                    page views and searches so we can improve the marketplace. Nothing is collected unless you
                    accept. Read more in our{' '}
                    <Link to="/privacy-policy" className="text-text-primary underline">
                        Privacy Policy
                    </Link>
                    .
                </p>
                <div className="flex gap-3 shrink-0">
                    <Button variant="outline" size="sm" onClick={reject}>
                        Reject
                    </Button>
                    <Button variant="outline" size="sm" onClick={accept}>
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    );
};
