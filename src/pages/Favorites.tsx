import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoritesApi } from '../api/favorites';
import { ListingCard } from '../components/products/ListingCard';
import { SectionHeader } from '../components/common/SectionHeader';
import Button from '../components/ui/Button';
import type { Product } from '../types/product';

const LIMIT = 20;

export const Favorites = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await favoritesApi.list(page, LIMIT);
                if (response.status === 'success' && response.data) {
                    setProducts(response.data.items ?? []);
                    setTotal(response.data.total);
                } else {
                    setError(response.message || 'Failed to fetch favorites');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [page]);

    // Called only after the server confirms the removal, so there is nothing to roll back.
    const handleUnfavorited = (productId: string) => {
        const remainingProducts = products.filter((product) => product.id !== productId);
        setProducts(remainingProducts);
        setTotal((current) => Math.max(0, current - 1));
        if (remainingProducts.length === 0 && page > 1) {
            setPage((current) => current - 1);
        }
    };

    const hasNextPage = page * LIMIT < total;
    const hasPrevPage = page > 1;

    return (
        <section className="py-24 px-6 md:px-12 bg-background">
            <div className="container-custom">
                <SectionHeader title="My Favorites" subtitle="Listings you've saved" />

                {error && (
                    <div className="mb-8 text-center text-red-500 bg-red-100 p-3 rounded">{error}</div>
                )}

                {loading ? (
                    <div className="p-10 text-center text-text-secondary">Loading favorites...</div>
                ) : products.length === 0 ? (
                    <div className="p-10 text-center text-text-secondary">
                        <p>You haven't saved any listings yet.</p>
                        <Link to="/listings" className="mt-4 inline-block text-accent-purple font-bold hover:underline">
                            Browse listings
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ListingCard
                                key={product.id}
                                product={product}
                                onFavoriteToggled={(favorited) => {
                                    if (!favorited) handleUnfavorited(product.id);
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className="mt-10 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasPrevPage}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-text-secondary text-sm">Page {page}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Favorites;
