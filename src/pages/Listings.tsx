import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { geocodingApi } from '../api/geocoding';
import { getCurrentPosition } from '../lib/geolocation';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useUrlDraft } from '../hooks/useUrlDraft';
import { horseAttributesApi } from '../api/horseAttributesApi';
import { RADIUS_OPTIONS_KM, type RangeCriteriaKey } from '../lib/searchCriteria/queryParams';
import { buildListingsSearchParams, parseListingsSearchParams } from '../lib/searchCriteria/listingsUrl';
import type { Product } from '../types/product';
import type { Category } from '../types/categories';
import type { HorseAttributeOption } from '../types/horseAttributes';
import type { SearchCriteria } from '../types/searchCriteria';
import { ListingCard } from '../components/products/ListingCard';
import { SectionHeader } from '../components/common/SectionHeader';
import { SaveSearchPanel } from '../components/savedSearches/SaveSearchPanel';
import Button from '../components/ui/Button';

const LIMIT = 20;
const MAX_LOCATION_LABEL_LENGTH = 100;

interface FlatCategory extends Category {
    depth: number;
}

type Coordinates = { lat: number; lng: number };

interface LocationDraft {
    text: string;
    origin?: Coordinates;
}

type SelectCriteriaKey = 'category_id' | 'breed' | 'gender' | 'discipline';

type LocationCriteria = Pick<SearchCriteria, 'lat' | 'lng' | 'radius_km'>;

const NO_LOCATION: LocationCriteria = {
    lat: undefined,
    lng: undefined,
    radius_km: undefined,
};

function flattenCategories(cats: Category[], depth = 0): FlatCategory[] {
    return cats.reduce((acc, cat) => {
        acc.push({ ...cat, depth });
        if (cat.subcategories && cat.subcategories.length > 0) {
            acc.push(...flattenCategories(cat.subcategories, depth + 1));
        }
        return acc;
    }, [] as FlatCategory[]);
}

function sameLocationDraft(a: LocationDraft, b: LocationDraft): boolean {
    return a.text === b.text && a.origin?.lat === b.origin?.lat && a.origin?.lng === b.origin?.lng;
}

function toLocationLabel(text: string): string | undefined {
    return text.trim().slice(0, MAX_LOCATION_LABEL_LENGTH) || undefined;
}

export const Listings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        criteria: appliedCriteria,
        locationLabel: appliedLocationLabel,
        page,
    } = useMemo(() => parseListingsSearchParams(searchParams), [searchParams]);

    const {
        draft: keyword,
        setDraft: setKeyword,
        markCommitted: markKeywordCommitted,
    } = useUrlDraft(appliedCriteria.q ?? '');
    const debouncedKeyword = useDebouncedValue(keyword, 400);

    const appliedOrigin =
        appliedCriteria.lat !== undefined && appliedCriteria.lng !== undefined
            ? { lat: appliedCriteria.lat, lng: appliedCriteria.lng }
            : undefined;
    const {
        draft: locationDraft,
        setDraft: setLocationDraft,
        markCommitted: markLocationCommitted,
    } = useUrlDraft<LocationDraft>({ text: appliedLocationLabel ?? '', origin: appliedOrigin }, sameLocationDraft);

    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [categories, setCategories] = useState<FlatCategory[]>([]);

    const [breedOptions, setBreedOptions] = useState<HorseAttributeOption[]>([]);
    const [genderOptions, setGenderOptions] = useState<HorseAttributeOption[]>([]);
    const [disciplineOptions, setDisciplineOptions] = useState<HorseAttributeOption[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        horseAttributesApi
            .list('breed')
            .then((response) => {
                if (response.status === 'success' && response.data) {
                    setBreedOptions(response.data);
                }
            })
            .catch(() => {
                // Attribute filters are a progressive enhancement; ignore fetch failures here.
            });
        horseAttributesApi
            .list('gender')
            .then((response) => {
                if (response.status === 'success' && response.data) {
                    setGenderOptions(response.data);
                }
            })
            .catch(() => {
                // Attribute filters are a progressive enhancement; ignore fetch failures here.
            });
        horseAttributesApi
            .list('discipline')
            .then((response) => {
                if (response.status === 'success' && response.data) {
                    setDisciplineOptions(response.data);
                }
            })
            .catch(() => {
                // Attribute filters are a progressive enhancement; ignore fetch failures here.
            });
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await productsApi.list(appliedCriteria, { page, limit: LIMIT });
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
    }, [appliedCriteria, page]);

    const writeSearch = (criteria: SearchCriteria, locationLabel: string | undefined, nextPage = 1) => {
        setSearchParams(buildListingsSearchParams({ criteria, locationLabel, page: nextPage }), { replace: true });
    };

    // Omitting the page resets to page 1 on every filter change.
    const applyFilters = (changes: Partial<SearchCriteria>) => {
        writeSearch({ ...appliedCriteria, ...changes }, appliedLocationLabel);
    };

    const applyLocationFilter = (location: LocationCriteria, locationLabel: string | undefined) => {
        writeSearch({ ...appliedCriteria, ...location }, locationLabel);
    };

    const goToPage = (nextPage: number) => {
        writeSearch(appliedCriteria, appliedLocationLabel, nextPage);
    };

    // Runs only when the debounced text changes; adding appliedCriteria.q would overwrite a Header search with stale text.
    useEffect(() => {
        const committedKeyword = debouncedKeyword.trim();
        if (committedKeyword === (appliedCriteria.q ?? '')) return;
        markKeywordCommitted(committedKeyword);
        applyFilters({ q: committedKeyword || undefined });
    }, [debouncedKeyword]);

    const applyLocation = (draft: LocationDraft, radiusKm: number) => {
        if (!draft.origin) return;
        const locationLabel = toLocationLabel(draft.text);
        markLocationCommitted({ text: locationLabel ?? '', origin: draft.origin });
        applyLocationFilter({ lat: draft.origin.lat, lng: draft.origin.lng, radius_km: radiusKm }, locationLabel);
    };

    const adoptOrigin = (draft: LocationDraft) => {
        setLocationDraft(draft);
        if (appliedCriteria.radius_km !== undefined) applyLocation(draft, appliedCriteria.radius_km);
    };

    const handleSelectFilterChange = (key: SelectCriteriaKey) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        applyFilters({ [key]: e.target.value || undefined });
    };

    const handleNumericFilterChange = (key: RangeCriteriaKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
        applyFilters({ [key]: e.target.value === '' ? undefined : Number(e.target.value) });
    };

    const handleLocationBlur = async () => {
        const query = locationDraft.text.trim();
        if (!query) return;
        setLocationLoading(true);
        setLocationWarning(null);
        try {
            const response = await geocodingApi.resolve(query);
            if (response.status === 'success' && response.data) {
                adoptOrigin({ text: locationDraft.text, origin: { lat: response.data.lat, lng: response.data.lng } });
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
            // Typed text no longer describes the origin, so it must not become the saved location label.
            adoptOrigin({ text: '', origin: position });
        } else {
            setLocationWarning("Couldn't access your location — try typing one instead.");
        }
        setLocationLoading(false);
    };

    const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === '') {
            // Keep the draft origin so another radius can be picked without re-entering the location.
            markLocationCommitted({ text: '', origin: undefined });
            applyLocationFilter(NO_LOCATION, undefined);
            return;
        }
        applyLocation(locationDraft, Number(e.target.value));
    };

    const hasNextPage = page * LIMIT < total;
    const hasPrevPage = page > 1;

    return (
        <section className="py-24 px-6 md:px-12 bg-background">
            <div className="container-custom">
                <SectionHeader title="Browse Listings" subtitle="Find horses, vehicles, and equipment for sale" />

                <div className="mb-8 flex flex-wrap justify-center gap-4">
                    <select
                        aria-label="Category"
                        value={appliedCriteria.category_id ?? ''}
                        onChange={handleSelectFilterChange('category_id')}
                        className="w-full max-w-xs rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {'—'.repeat(cat.depth)} {cat.name}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Breed"
                        value={appliedCriteria.breed ?? ''}
                        onChange={handleSelectFilterChange('breed')}
                        className="w-full max-w-xs rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary"
                    >
                        <option value="">All Breeds</option>
                        {breedOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.value}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Gender"
                        value={appliedCriteria.gender ?? ''}
                        onChange={handleSelectFilterChange('gender')}
                        className="w-full max-w-xs rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary"
                    >
                        <option value="">All Genders</option>
                        {genderOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.value}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Discipline"
                        value={appliedCriteria.discipline ?? ''}
                        onChange={handleSelectFilterChange('discipline')}
                        className="w-full max-w-xs rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary"
                    >
                        <option value="">All Disciplines</option>
                        {disciplineOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.value}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-8 flex flex-wrap justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-secondary">Age</label>
                        <input
                            type="number"
                            aria-label="Min age"
                            placeholder="Min"
                            value={appliedCriteria.min_age ?? ''}
                            onChange={handleNumericFilterChange('min_age')}
                            className="w-24 rounded-xl border border-dark-200 bg-white dark:bg-card px-3 py-2 text-text-primary"
                        />
                        <span className="text-text-secondary">–</span>
                        <input
                            type="number"
                            aria-label="Max age"
                            placeholder="Max"
                            value={appliedCriteria.max_age ?? ''}
                            onChange={handleNumericFilterChange('max_age')}
                            className="w-24 rounded-xl border border-dark-200 bg-white dark:bg-card px-3 py-2 text-text-primary"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-secondary">Height (cm)</label>
                        <input
                            type="number"
                            aria-label="Min height"
                            placeholder="Min"
                            value={appliedCriteria.min_height ?? ''}
                            onChange={handleNumericFilterChange('min_height')}
                            className="w-24 rounded-xl border border-dark-200 bg-white dark:bg-card px-3 py-2 text-text-primary"
                        />
                        <span className="text-text-secondary">–</span>
                        <input
                            type="number"
                            aria-label="Max height"
                            placeholder="Max"
                            value={appliedCriteria.max_height ?? ''}
                            onChange={handleNumericFilterChange('max_height')}
                            className="w-24 rounded-xl border border-dark-200 bg-white dark:bg-card px-3 py-2 text-text-primary"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-text-secondary">Price (SEK)</label>
                        <input
                            type="number"
                            aria-label="Min price"
                            placeholder="Min"
                            value={appliedCriteria.min_price ?? ''}
                            onChange={handleNumericFilterChange('min_price')}
                            className="w-28 rounded-xl border border-dark-200 bg-white dark:bg-card px-3 py-2 text-text-primary"
                        />
                        <span className="text-text-secondary">–</span>
                        <input
                            type="number"
                            aria-label="Max price"
                            placeholder="Max"
                            value={appliedCriteria.max_price ?? ''}
                            onChange={handleNumericFilterChange('max_price')}
                            className="w-28 rounded-xl border border-dark-200 bg-white dark:bg-card px-3 py-2 text-text-primary"
                        />
                    </div>
                </div>

                <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
                    <input
                        type="text"
                        aria-label="Keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search by keyword…"
                        className="w-full max-w-xs rounded-xl border border-dark-200 bg-white dark:bg-card px-4 py-2 text-text-primary"
                    />
                    <input
                        type="text"
                        aria-label="Location"
                        value={locationDraft.text}
                        onChange={(e) => setLocationDraft({ ...locationDraft, text: e.target.value })}
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
                        value={appliedCriteria.radius_km ?? ''}
                        onChange={handleRadiusChange}
                        disabled={!locationDraft.origin}
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

                <SaveSearchPanel
                    criteria={appliedCriteria}
                    locationLabel={appliedLocationLabel}
                    categoryName={categories.find((cat) => cat.id === appliedCriteria.category_id)?.name}
                />

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
                        onClick={() => goToPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-text-secondary text-sm">Page {page}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage}
                        onClick={() => goToPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default Listings;
