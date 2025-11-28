import HeroSection from '../components/homepage/HeroSection';
import LiveAuctionsSection from '../components/homepage/LiveAuctionsSection';
import CategoryBrowser from '../components/homepage/CategoryBrowser';

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <LiveAuctionsSection />
            <CategoryBrowser />
            {/* More sections will be added as they're redesigned */}
        </div>
    );
}
