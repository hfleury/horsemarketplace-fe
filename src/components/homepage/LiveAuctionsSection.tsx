import Container from '../layout/Container';
import GradientCard from '../ui/GradientCard';
import CountdownTimer from '../ui/CountdownTimer';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { mockAuctions } from '../../lib/mockData';

export default function LiveAuctionsSection() {
    return (
        <section className="section-spacing bg-dark">
            <Container>
                {/* Section header */}
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-bold text-white">Live Auctions</h2>
                        <p className="mt-2 text-text-secondary">Place your bids on trending items</p>
                    </div>
                    <Button variant="outline" className="hidden md:inline-flex">
                        View All
                    </Button>
                </div>

                {/* Auctions grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {mockAuctions.map((auction) => (
                        <GradientCard
                            key={auction.id}
                            image={auction.item.image}
                            imageAlt={auction.item.title}
                            header={
                                <div className="flex items-center justify-between">
                                    <Badge variant="info" size="sm">
                                        Live
                                    </Badge>
                                    <button className="text-white hover:text-accent-purple transition-colors">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                        </svg>
                                    </button>
                                </div>
                            }
                        >
                            {/* Item info */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-white truncate">
                                    {auction.item.title}
                                </h3>

                                {/* Creator */}
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={auction.item.creator.avatar}
                                        alt={auction.item.creator.username}
                                        className="h-6 w-6 rounded-full"
                                    />
                                    <span className="text-sm text-text-secondary">
                                        {auction.item.creator.username}
                                    </span>
                                    {auction.item.creator.verified && (
                                        <svg className="h-4 w-4 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>

                                {/* Current bid */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-text-muted">Current Bid</p>
                                        <p className="text-lg font-bold text-white">{auction.currentBid} ETH</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-text-muted">Bids</p>
                                        <p className="text-sm font-semibold text-text-secondary">{auction.bidCount}</p>
                                    </div>
                                </div>

                                {/* Countdown */}
                                <div>
                                    <p className="text-xs text-text-muted mb-2">Ends in</p>
                                    <CountdownTimer targetDate={auction.endTime} compact />
                                </div>

                                {/* Place bid button */}
                                <Button variant="primary" size="sm" className="w-full">
                                    Place Bid
                                </Button>
                            </div>
                        </GradientCard>
                    ))}
                </div>

                {/* Mobile view all button */}
                <div className="mt-8 text-center md:hidden">
                    <Button variant="outline">View All Auctions</Button>
                </div>
            </Container>
        </section>
    );
}