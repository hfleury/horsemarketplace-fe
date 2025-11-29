import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HotBidsSection from '../components/homepage/HotBidsSection';
import TodaysDropsSection from '../components/homepage/TodaysDropsSection';
import TopSellersSection from '../components/homepage/TopSellersSection';
import TopBuyersSection from '../components/homepage/TopBuyersSection';
import LiveAuctionsSection from '../components/homepage/LiveAuctionsSection';
import CategoryBrowser from '../components/homepage/CategoryBrowser';
import AppPromo from '../components/homepage/AppPromo';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        <HotBidsSection />
        <TodaysDropsSection />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          <TopSellersSection />
          <TopBuyersSection />
        </div>
        <LiveAuctionsSection />
        <CategoryBrowser />
        <AppPromo />
      </main>
      <Footer />
    </div>
  );
}