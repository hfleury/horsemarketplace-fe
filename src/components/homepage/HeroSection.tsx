import Container from '../layout/Container';
import Button from '../ui/Button';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/hero-horse.png"
                    alt="Majestic Horse"
                    className="h-full w-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/90 to-dark" />
            </div>

            <Container className="relative z-10">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Main heading */}
                    <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                        Discover & Buy Premium{' '}
                        <span className="gradient-text">Horses & Equipment</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mb-8 text-lg text-text-secondary md:text-xl">
                        The premier marketplace for buying and selling horses, tack, and equestrian equipment.
                    </p>

                    {/* Search bar */}
                    <div className="mb-8 mx-auto max-w-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search horses, equipment, and sellers"
                                className="w-full rounded-2xl border border-dark-300 bg-dark-200/80 backdrop-blur-sm px-6 py-4 pr-12 text-white placeholder-text-muted focus:border-accent-purple focus:outline-none focus:ring-2 focus:ring-accent-purple/50 transition-all"
                            />
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-accent-purple p-3 text-white hover:bg-accent-purple/90 transition-colors"
                                aria-label="Search"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button variant="gradient" size="lg">
                            Explore Horses
                        </Button>
                        <Button variant="outline" size="lg">
                            Sell Equipment
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
                        {[
                            { label: 'Total Listings', value: '12.5K+' },
                            { label: 'Total Sales', value: '$2.5M+' },
                            { label: 'Active Users', value: '8.3K+' },
                            { label: 'Breeds', value: '50+' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-3xl font-bold text-white md:text-4xl">{stat.value}</div>
                                <div className="mt-1 text-sm text-text-secondary">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}