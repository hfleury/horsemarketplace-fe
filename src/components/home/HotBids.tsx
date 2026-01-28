import { useRef } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DUMMY_BIDS = [
    {
        id: 1,
        title: 'Arabian Night Saddle',
        author: 'saddle_master',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop',
        price: '1.2',
        likes: 24,
    },
    {
        id: 2,
        title: 'Golden Horseshoe Set',
        author: 'gold_smith',
        image: 'https://images.unsplash.com/photo-1535581652167-3d6b98c364c6?q=80&w=2574&auto=format&fit=crop',
        price: '0.8',
        likes: 12,
    },
    {
        id: 3,
        title: 'Velvet Riding Helmet',
        author: 'safety_first',
        image: 'https://images.unsplash.com/photo-1558231940-27c5415201d4?q=80&w=2670&auto=format&fit=crop',
        price: '0.5',
        likes: 45,
    },
    {
        id: 4,
        title: 'Luxury Grooming Kit',
        author: 'clean_horse',
        image: 'https://images.unsplash.com/photo-1543872084-c7bd3822856f?q=80&w=2574&auto=format&fit=crop',
        price: '0.3',
        likes: 8,
    },
    {
        id: 5,
        title: 'Leather Bridle',
        author: 'leather_works',
        image: 'https://images.unsplash.com/photo-1534316986523-289b53272993?q=80&w=2574&auto=format&fit=crop',
        price: '0.9',
        likes: 33,
    }
];

export const HotBids = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -350 : 350;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="section-spacing relative bg-background transition-colors duration-300">
            <div className="container-custom">
                <div className="relative">
                    <SectionHeader title="🔥 Hot Bids" />
                    <div className="hidden md:flex gap-2 absolute right-0 top-8">
                        <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full border-dark-300 text-text-primary hover:border-accent-purple hover:bg-transparent">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full border-dark-300 text-text-primary hover:border-accent-purple hover:bg-transparent">
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                >
                    {DUMMY_BIDS.map((bid) => (
                        <div key={bid.id} className="min-w-[280px] md:min-w-[320px] snap-center">
                            <Card {...bid} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
