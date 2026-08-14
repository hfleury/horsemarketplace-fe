interface HeroCardProps {
    className?: string;
    title: string;
    author: string;
    image: string;
    size?: 'small' | 'large';
}

const HeroCard = ({ className, title, author, image, size = 'small' }: HeroCardProps) => (
    <article className={className}>
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-card h-full group cursor-pointer border border-dark-200/50">
            <figure className="relative h-full w-full">
                <div className="absolute inset-0 bg-dark-100/10 group-hover:bg-transparent transition-colors z-10" />
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-[1600ms] will-change-transform group-hover:scale-110"
                />
            </figure>
            <div className="pointer-events-none absolute bottom-0 w-full p-5 z-20 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className={`font-display leading-none text-white ${size === 'large' ? 'text-2xl mb-1' : 'text-base xl:text-lg'}`}>
                    {title}
                </h2>
                <span className="text-xs text-gray-300">by {author}</span>
            </div>
        </div>
    </article>
);

export const Hero = () => {
    return (
        <section className="relative pt-24 px-6 pb-8 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-20 left-0 w-96 h-96 bg-accent-purple/10 dark:bg-accent-purple/20 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-blue/10 dark:bg-accent-blue/10 rounded-full blur-[100px] -z-10" />


            {/* The 9-Item Grid (Matches User Snippet) */}
            <div className="flex flex-col gap-5 lg:flex-row h-auto lg:h-[600px]">

                {/* Column 1: 2x2 Grid (Left) */}
                <div className="w-full lg:w-1/3">
                    <div className="grid grid-cols-2 grid-rows-2 gap-5 h-full">
                        <HeroCard title="Amazing NFT Art" author="NFT Stars" image="https://images.unsplash.com/photo-1635334204566-3d7756770267?q=80&w=800&auto=format&fit=crop" />
                        <HeroCard title="Punkie Cat" author="Lazy Panda" image="https://images.unsplash.com/photo-1636955745863-fff80753063f?q=80&w=800&auto=format&fit=crop" />
                        <HeroCard title="VR Space" author="Origin Morish" image="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop" />
                        <HeroCard title="Abstract Color" author="Art Life" image="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" />
                    </div>
                </div>

                {/* Column 2: Big Card (Center) */}
                <div className="w-full lg:w-1/3">
                    <HeroCard
                        className="h-full"
                        size="large"
                        title="TSARÉVNA"
                        author="CryptoGuysNFT"
                        image="https://images.unsplash.com/photo-1637815291244-a957827825b7?q=80&w=1600&auto=format&fit=crop"
                    />
                </div>

                {/* Column 3: 2x2 Grid (Right) */}
                <div className="w-full lg:w-1/3">
                    <div className="grid grid-cols-2 grid-rows-2 gap-5 h-full">
                        <HeroCard title="Metasmorf" author="Lazy Panda" image="https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=800&auto=format&fit=crop" />
                        <HeroCard title="VR Space 286" author="Origin Morish" image="https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=800&auto=format&fit=crop" />
                        <HeroCard title="PankySkal" author="NFT Stars" image="https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=800&auto=format&fit=crop" />
                        <HeroCard title="Space Walker" author="Cosmos" image="https://images.unsplash.com/photo-1614812513172-567d2fe96a75?q=80&w=800&auto=format&fit=crop" />
                    </div>
                </div>

            </div>
        </section>
    );
};
