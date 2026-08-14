import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { geocodingApi } from '../api/geocoding';
import { getCurrentPosition } from '../lib/geolocation';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Product } from '../types/product';
import type { Category } from '../types/categories';
import { ListingCard } from '../components/products/ListingCard';
import { SectionHeader } from '../components/common/SectionHeader';
import Button from '../components/ui/Button';

const LIMIT = 20;
const RADIUS_OPTIONS_KM = [10, 25, 50, 100, 250, 500];

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
    const [searchParams, setSearchParams] = useSearchParams();
    const [keyword, setKeyword] = useState(() => searchParams.get('q') ?? '');
    const debouncedKeyword = useDebouncedValue(keyword, 400);

    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [categories, setCategories] = useState<FlatCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [locationQuery, setLocationQuery] = useState('');
    const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
    const [radiusKm, setRadiusKm] = useState<number | undefined>(undefined);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationWarning, setLocationWarning] = useState<string | null>(null);

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
        setSearchParams(debouncedKeyword ? { q: debouncedKeyword } : {}, { replace: true });
    }, [debouncedKeyword, setSearchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const hasLocationFilter = originCoords !== undefined && radiusKm !== undefined;
                const response = await productsApi.list({
                    categoryId,
                    page,
                    limit: LIMIT,
                    q: debouncedKeyword,
                    ...(hasLocationFilter && {
                        lat: originCoords.lat,
                        lng: originCoords.lng,
                        radiusKm,
                    }),
                });
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
    }, [categoryId, page, originCoords, radiusKm, debouncedKeyword]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryId(e.target.value === '' ? undefined : e.target.value);
        setPage(1);
    };

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
        setPage(1);
    };

    const handleLocationBlur = async () => {
        if (!locationQuery.trim()) return;
        setLocationLoading(true);
        setLocationWarning(null);
        try {
            const response = await geocodingApi.resolve(locationQuery.trim());
            if (response.status === 'success' && response.data) {
                setOriginCoords({ lat: response.data.lat, lng: response.data.lng });
                setPage(1);
            } else {
                setLocationWarning(response.message || "Couldn't find that location — try a different search.");
            }
        } catch {
            setLocationWarning("Couldn't find that location — try a different search.");
        } finally {
            setLocationLoading(false);
        }
    };

    const handleUseMyLocation = async () => {
        setLocationLoading(true);
        setLocationWarning(null);
        const position = await getCurrentPosition();
        if (position) {
            setOriginCoords(position);
            setPage(1);
        } else {
            setLocationWarning("Couldn't access your location — try typing one instead.");
        }
        setLocationLoading(false);
    };

    const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRadiusKm(e.target.value === '' ? undefined : Number(e.target.value));
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
                        aria-label="Category"
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

                <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
                    <input
                        type="text"
                        aria-label="Keyword"
                        value={keyword}
                        onChange={handleKeywordChange}
                        placeholder="Search by keyword…"
                        className="w-full max-w-xs rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary"
                    />
                    <input
                        type="text"
                        aria-label="Location"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onBlur={handleLocationBlur}
                        placeholder="Type a location…"
                        className="w-full max-w-xs rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        isLoading={locationLoading}
                        onClick={handleUseMyLocation}
                    >
                        Use my location
                    </Button>
                    <select
                        aria-label="Radius"
                        value={radiusKm ?? ''}
                        onChange={handleRadiusChange}
                        disabled={!originCoords}
                        className="rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">Radius</option>
                        {RADIUS_OPTIONS_KM.map((km) => (
                            <option key={km} value={km}>
                                {km} km
                            </option>
                        ))}
                    </select>
                </div>

                {locationWarning && (
                    <div className="mb-8 text-center text-red-500 bg-red-100 p-3 rounded">
                        {locationWarning}
                    </div>
                )}

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
