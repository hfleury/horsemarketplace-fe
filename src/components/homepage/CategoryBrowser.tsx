import Container from '../layout/Container';
import { mockCategories } from '../../lib/mockData';

export default function CategoryBrowser() {
    return (
        <section className="section-spacing bg-dark-100">
            <Container>
                {/* Section header */}
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold text-white">Browse by Category</h2>
                    <p className="mt-4 text-lg text-text-secondary">
                        Explore our diverse collection of horse NFTs
                    </p>
                </div>

                {/* Categories grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                    {mockCategories.map((category) => (
                        <a
                            key={category.id}
                            href={`#${category.slug}`}
                            className="group relative overflow-hidden rounded-2xl border border-dark-300 bg-dark-200 p-6 transition-all duration-300 hover:border-accent-purple hover:shadow-card-hover hover:scale-105"
                        >
                            {/* Icon */}
                            <div className="mb-4 text-5xl">{category.icon}</div>

                            {/* Category info */}
                            <div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-accent-purple transition-colors">
                                    {category.name}
                                </h3>
                                <p className="mt-1 text-sm text-text-muted">
                                    {category.itemCount.toLocaleString()} items
                                </p>
                            </div>

                            {/* Hover gradient effect */}
                            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        </a>
                    ))}
                </div>
            </Container>
        </section>
    );
}