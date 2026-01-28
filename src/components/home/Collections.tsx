import { useRef } from 'react';
import { Button } from '../common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const COLLECTIONS = [
    { id: 1, name: 'Saddles', image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop', color: 'bg-green-100' },
    { id: 2, name: 'Helmets', image: 'https://images.unsplash.com/photo-1558231940-27c5415201d4?q=80&w=2670&auto=format&fit=crop', color: 'bg-orange-100' },
    { id: 3, name: 'Bridles', image: 'https://images.unsplash.com/photo-1534316986523-289b53272993?q=80&w=2574&auto=format&fit=crop', color: 'bg-blue-100' },
    { id: 4, name: 'Grooming', image: 'https://images.unsplash.com/photo-1543872084-c7bd3822856f?q=80&w=2574&auto=format&fit=crop', color: 'bg-purple-100' },
    { id: 5, name: 'Boots', image: 'https://images.unsplash.com/photo-1520188741381-e7370a2d216d?q=80&w=2574&auto=format&fit=crop', color: 'bg-pink-100' },
    { id: 6, name: 'Art', image: 'https://images.unsplash.com/photo-1545652613-2d04a60b9435?q=80&w=2574&auto=format&fit=crop', color: 'bg-yellow-100' },
    { id: 7, name: 'Training', image: 'https://images.unsplash.com/photo-1535581652167-3d6b98c364c6?q=80&w=2574&auto=format&fit=crop', color: 'bg-red-100' },
    { id: 8, name: 'Stable', image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2669&auto=format&fit=crop', color: 'bg-indigo-100' },
];

export const Collections = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -350 : 350;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="relative py-24 bg-background overflow-hidden">
            {/* Decorative Gradient Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent-purple/5 to-transparent opacity-50 dark:opacity-20 pointer-events-none" />

            {/* Title Container - Centered */}
            <div className="container-custom relative mb-12">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text-primary">Browse by category</h2>
                </div>
                {/* Navigation Buttons */}
                <div className="hidden md:flex gap-2 absolute right-4 top-1/2 -translate-y-1/2">
                    <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full border-dark-300 text-text-primary hover:border-accent-purple hover:bg-transparent">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full border-dark-300 text-text-primary hover:border-accent-purple hover:bg-transparent">
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Full Width Carousel Container */}
            <div className="w-full">
                <div
                    ref={scrollRef}
                    className="flex gap-8 overflow-x-auto pb-8 snap-x scrollbar-hide px-6 md:px-12"
                >
                    {COLLECTIONS.map((collection) => (
                        <div key={collection.id} className="min-w-[280px] snap-center">
                            <article className="block h-full rounded-3xl border border-dark-200 bg-white dark:bg-card p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                <figure className={`rounded-xl overflow-hidden aspect-[3/2] ${collection.color} relative`}>
                                    <img
                                        src={collection.image}
                                        alt={collection.name}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                </figure>
                                <div className="mt-4 text-center">
                                    <span className="font-display text-lg font-bold text-text-primary hover:text-accent-purple transition-colors">
                                        {collection.name}
                                    </span>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
