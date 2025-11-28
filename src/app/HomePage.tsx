import HeroSection from '../components/homepage/HeroSection';
import LiveAuctionsSection from '../components/homepage/LiveAuctionsSection';
import TopSellersSection from '../components/homepage/TopSellersSection';
import TodaysDropsSection from '../components/homepage/TodaysDropsSection';
import CategoryBrowser from '../components/homepage/CategoryBrowser';
import AppPromo from '../components/homepage/AppPromo';
import Container from '../components/layout/Container';

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <LiveAuctionsSection />
            <Container className="section-spacing">
                <TopSellersSection />
            </Container>
            <Container className="section-spacing">
                <TodaysDropsSection />
            </Container>
            <CategoryBrowser />
            <Container className="section-spacing">
                <AppPromo />
            </Container>
        </div>
    );
}
