export const Partners = () => {
    // Using high-quality placeholder logos (transparent PNGs/SVGs would be ideal, using colored placeholders for now)
    const PARTNERS = [
        { id: 1, name: 'Partner 1', logo: 'https://placehold.co/200x80/eef2ff/8358ff?text=Partner+1' },
        { id: 2, name: 'Partner 2', logo: 'https://placehold.co/200x80/eef2ff/8358ff?text=Partner+2' },
        { id: 3, name: 'Partner 3', logo: 'https://placehold.co/200x80/eef2ff/8358ff?text=Partner+3' },
        { id: 4, name: 'Partner 4', logo: 'https://placehold.co/200x80/eef2ff/8358ff?text=Partner+4' },
        { id: 5, name: 'Partner 5', logo: 'https://placehold.co/200x80/eef2ff/8358ff?text=Partner+5' },
    ];

    return (
        <section className="bg-[#F5F5F5] dark:bg-dark-200/50">
            <div className="container-custom">
                <div className="grid grid-cols-2 py-8 sm:grid-cols-5 gap-8 items-center justify-items-center">
                    {PARTNERS.map((partner) => (
                        <a key={partner.id} href="#" className="opacity-60 hover:opacity-100 transition-opacity duration-300">
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="max-h-12 w-auto object-contain dark:invert"
                                width="173"
                                height="103"
                            />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};
