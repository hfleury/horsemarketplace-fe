import { Link } from 'react-router-dom';
import { SectionHeader } from '../common/SectionHeader';

// Reusable List Item Component
const TopListItem = ({ rank, image, name, value, verified = false }: any) => (
    <div className="flex items-center rounded-2xl border border-dark-200 bg-white dark:bg-card py-4 px-6 transition-all duration-300 hover:shadow-card hover:scale-[1.02] cursor-pointer">
        <div className="relative mr-4 shrink-0">
            <img
                src={image}
                alt={name}
                className="h-12 w-12 rounded-xl object-cover"
            />
            <div className="absolute -left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white dark:border-card bg-text-primary text-xs font-bold text-white">
                {rank}
            </div>
            {verified && (
                <div className="absolute -left-3 top-[65%] flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-card" title="Verified">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3 fill-white">
                        <path fill="none" d="M0 0h24v24H0z"></path><path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                    </svg>
                </div>
            )}
        </div>
        <div>
            <h4 className="font-display font-bold text-text-primary hover:text-accent-purple transition-colors">{name}</h4>
            <span className="text-sm text-text-secondary">{value} ETH</span>
        </div>
    </div>
);

// Reusable Column Component
const TopListColumn = ({ title, items, linkText }: any) => (
    <div className="rounded-3xl bg-dark-100/50 p-8 lg:w-1/3 border border-dark-200/50">
        <h3 className="mb-8 text-center font-display text-2xl font-bold text-text-primary">{title}</h3>
        <div className="flex flex-col space-y-4">
            {items.map((item: any, index: number) => (
                <TopListItem key={index} rank={index + 1} {...item} />
            ))}
        </div>
        <Link to="/collections" className="mt-8 block text-center text-sm font-bold text-accent-purple hover:text-accent-blue transition-colors">
            {linkText}
        </Link>
    </div>
);

// Dummy Data
const DROPS_DATA = [
    { name: 'NFT Funny Cat', value: '7,080.95', image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=100&auto=format&fit=crop', verified: true },
    { name: 'Cryptopank', value: '6,548.13', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=100&auto=format&fit=crop' },
    { name: 'Prince Ape Planet', value: '4,823.92', image: 'https://images.unsplash.com/photo-1535581652167-3d6b98c364c6?q=80&w=100&auto=format&fit=crop' },
    { name: 'Hey Mrsmeseks', value: '3,186', image: 'https://images.unsplash.com/photo-1636955745863-fff80753063f?q=80&w=100&auto=format&fit=crop' },
];

const SELLERS_DATA = [
    { name: 'Bored Bunny', value: '3,027', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=100&auto=format&fit=crop' },
    { name: 'Wow Frens', value: '2,586', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=100&auto=format&fit=crop' },
    { name: 'Origin Morish', value: '2,347.85', image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=100&auto=format&fit=crop', verified: true },
    { name: 'Superdo', value: '2,115.71', image: 'https://images.unsplash.com/photo-1620332372374-f108c5e97320?q=80&w=100&auto=format&fit=crop', verified: true },
];

const BUYERS_DATA = [
    { name: 'NFT Stars', value: '2,027', image: 'https://images.unsplash.com/photo-1635334204566-3d7756770267?q=80&w=100&auto=format&fit=crop' },
    { name: 'Asumitsu', value: '1,989.70', image: 'https://images.unsplash.com/photo-1560707303-4e9803d166cb?q=80&w=100&auto=format&fit=crop', verified: true },
    { name: 'Pank Skull', value: '1,726.70', image: 'https://images.unsplash.com/photo-1631245656517-8c3b018591d8?q=80&w=100&auto=format&fit=crop' },
    { name: 'Lazy Panda', value: '1,589.03', image: 'https://images.unsplash.com/photo-1546445317-29f4545e9ebc?q=80&w=100&auto=format&fit=crop' },
];


export const NewItems = () => {
    return (
        <section className="relative py-24 px-6 md:px-12 bg-background">
            {/* Decorative Gradient Background (Simulating the 'picture' tag from snippet) */}
            <div className="absolute inset-0 -z-10 pointer-events-none opacity-30 dark:opacity-10 bg-gradient-to-b from-accent-purple/5 via-transparent to-transparent" />

            <div className="container-custom">
                {/* Section Header added per user request */}
                <SectionHeader title="Last posts" />

                <div className="flex flex-col gap-8 lg:flex-row">
                    <TopListColumn title="Today's Drops" items={DROPS_DATA} linkText="View All Drops" />
                    <TopListColumn title="Top Sellers" items={SELLERS_DATA} linkText="View All Sellers" />
                    <TopListColumn title="Top Buyers" items={BUYERS_DATA} linkText="View All Buyers" />
                </div>
            </div>
        </section>
    );
};
