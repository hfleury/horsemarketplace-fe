import { SectionHeader } from '../common/SectionHeader';

const NEWS_ITEMS = [
    {
        id: 5,
        title: 'Mint your own Tezos collections',
        excerpt: 'Since we launched Tezos at the end of 2021, many awesome creators...',
        image: 'https://images.unsplash.com/photo-1635334204566-3d7756770267?q=80&w=800&auto=format&fit=crop', // "post_2.jpg"
        date: '5 Feb',
        readTime: '3 min read',
        author: 'Deothemes',
        tags: ["NFT's", "DIGITAL ART"]
    },
    {
        id: 6,
        title: 'List your collection for secondary sales',
        excerpt: 'Since we launched Tezos at the end of 2021, many awesome creators...',
        image: 'https://images.unsplash.com/photo-1636955745863-fff80753063f?q=80&w=800&auto=format&fit=crop', // "post_3.jpg"
        date: '22 Feb',
        readTime: '3 min read',
        author: 'Deothemes',
        tags: ["NFT's", "DIGITAL ART"]
    },
    {
        id: 7,
        title: 'The biggest moves in NFTs, Bitcoin, crypto rules',
        excerpt: 'Since we launched Tezos at the end of 2021, many awesome creators...',
        image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop', // "post_4.jpg"
        date: '18 Jan',
        readTime: '3 min read',
        author: 'Deothemes',
        tags: ["NFT's", "DIGITAL ART"]
    }
];

export const SwedenHorseNews = () => {
    return (
        <section className="section-spacing bg-background relative">
            <div className="container-custom">
                <SectionHeader title="Sweden horse news" />

                <div className="grid grid-cols-1 gap-[1.875rem] sm:grid-cols-2 md:grid-cols-3">
                    {NEWS_ITEMS.map((item) => (
                        <article key={item.id}>
                            <div className="overflow-hidden rounded-[1.25rem] transition-shadow hover:shadow-lg dark:hover:shadow-glow-sm bg-white dark:bg-card border border-dark-100 dark:border-dark-300 h-full flex flex-col">
                                <figure className="group overflow-hidden relative aspect-[370/250]">
                                    <a href={`/single-post/${item.id}`} className="block h-full w-full">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-full w-full object-cover transition-transform duration-[1600ms] will-change-transform group-hover:scale-105"
                                        />
                                    </a>
                                </figure>
                                <div className="rounded-b-[1.25rem] bg-white p-[10%] dark:bg-card flex-1 flex flex-col">
                                    <div className="mb-3 flex flex-wrap items-center space-x-1 text-xs">
                                        <a href="#" className="font-display text-text-primary hover:text-accent-purple transition-colors font-semibold">
                                            {item.author}
                                        </a>
                                        <span className="text-text-secondary">in</span>
                                        <span className="inline-flex flex-wrap items-center space-x-1 text-accent-purple font-medium">
                                            {item.tags.join('\n')}
                                        </span>
                                    </div>
                                    <h2 className="mb-4 font-display text-xl leading-tight font-bold text-text-primary hover:text-accent-purple dark:text-white transition-colors">
                                        <a href={`/single-post/${item.id}`}> {item.title}</a>
                                    </h2>
                                    <p className="mb-8 text-text-secondary line-clamp-2">
                                        {item.excerpt}
                                    </p>
                                    <div className="flex flex-wrap items-center space-x-2 text-sm text-text-secondary mt-auto">
                                        <span><time>{item.date}</time></span>
                                        <span>•</span>
                                        <span>{item.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};
