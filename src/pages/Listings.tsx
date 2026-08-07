import { useEffect, useState } from 'react';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import type { Product } from '../types/product';
import type { Category } from '../types/categories';
import { ListingCard } from '../components/products/ListingCard';
import { SectionHeader } from '../components/common/SectionHeader';
import Button from '../components/ui/Button';

const LIMIT = 20;

interface FlatCategory extends Category {
    depth: number;
}

function flattenCategories(cats: Category[], depth = 0): FlatCategory[] {
    return cats.reduce((acc, cat) => {
        acc.push({ ...cat, depth });
        if (cat.subcategories && cat.subcategories.length > 0) {
            acc.push(...flattenCategories(cat.subcategories, depth + 1));
        }
        return acc;
    }, [] as FlatCategory[]);
}

export const Listings = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [categories, setCategories] = useState<FlatCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        categoriesApi
            .list()
            .then((response) => {
                if (response.status === 'success' && response.data) {
                    setCategories(flattenCategories(response.data));
                }
            })
            .catch(() => {
                // Category filter is a progressive enhancement; ignore fetch failures here.
            });
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await productsApi.list({ categoryId, page, limit: LIMIT });
                if (response.status === 'success' && response.data) {
                    setProducts(response.data.items ?? []);
                    setTotal(response.data.total);
                } else {
                    setError(response.message || 'Failed to fetch listings');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, page]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryId(e.target.value === '' ? undefined : e.target.value);
        setPage(1);
    };

    const hasNextPage = page * LIMIT < total;
    const hasPrevPage = page > 1;

    return (
        <section className="py-24 px-6 md:px-12 bg-background">
            <div className="container-custom">
                <SectionHeader title="Browse Listings" subtitle="Find horses, vehicles, and equipment for sale" />

                <div className="mb-8 flex justify-center">
                    <select
                        value={categoryId ?? ''}
                        onChange={handleCategoryChange}
                        className="w-full max-w-xs rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {'—'.repeat(cat.depth)} {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="mb-8 text-center text-red-500 bg-red-100 p-3 rounded">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="p-10 text-center text-text-secondary">Loading listings...</div>
                ) : products.length === 0 ? (
                    <div className="p-10 text-center text-text-secondary">No listings found.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ListingCard key={product.id} product={product} />
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

export default Listings;
