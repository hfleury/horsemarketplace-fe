import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import { formatPrice } from '../lib/formatPrice';
import { ProductType, type Product, type ProductMedia } from '../types/product';

type SpecEntries = Array<[string, string | number | boolean | undefined]>;

function sortMediaPrimaryFirst(media: ProductMedia[]): ProductMedia[] {
    return [...media].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return a.order - b.order;
    });
}

// Horse.pedigree is an opaque JSON blob (no structured schema yet) — intentionally not rendered.
function getSpecEntries(product: Product): SpecEntries {
    switch (product.type) {
        case ProductType.Horse: {
            const h = product.horse ?? {};
            return [
                ['Name', h.name],
                ['Age', h.age],
                ['Year of birth', h.year_of_birth],
                ['Gender', h.gender],
                ['Height', h.height],
                ['Breed', h.breed],
                ['Color', h.color],
                ['Dressage level', h.dressage_level],
                ['Jump level', h.jump_level],
                ['Orientation', h.orientation],
            ];
        }
        case ProductType.Vehicle: {
            const v = product.vehicle ?? {};
            return [
                ['Make', v.make],
                ['Model', v.model],
                ['Year', v.year],
                ['Load weight', v.load_weight],
                ['Total weight', v.total_weight],
                ['Condition', v.condition],
            ];
        }
        case ProductType.Equipment: {
            const e = product.equipment ?? {};
            return [
                ['Make', e.make],
                ['Model', e.model],
                ['Size', e.size],
                ['Condition', e.condition],
                ['Sub type', e.sub_type],
                ['Boom width', e.boom_width],
            ];
        }
        case ProductType.Service: {
            const s = product.service ?? {};
            return [
                ['Service type', s.service_type],
                ['Availability', s.availability],
            ];
        }
        case ProductType.Property: {
            const p = product.property ?? {};
            return [
                ['Size (m²)', p.size_m2],
                ['Room count', p.room_count],
                ['Has stable', p.has_stable],
            ];
        }
        default:
            return [];
    }
}

function SpecList({ product }: { product: Product }) {
    const entries = getSpecEntries(product).filter(([, value]) => value !== undefined && value !== '');
    if (entries.length === 0) return null;
    return (
        <div className="divide-y divide-dark-200 rounded-3xl border border-dark-200 bg-white dark:bg-card p-6">
            {entries.map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 text-sm">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-medium text-text-primary">{String(value)}</span>
                </div>
            ))}
        </div>
    );
}

function PhotoGallery({ media }: { media?: ProductMedia[] }) {
    if (!media || media.length === 0) {
        return <div className="h-80 w-full rounded-3xl bg-dark-100/50 dark:bg-dark-200/30" />;
    }

    const sorted = sortMediaPrimaryFirst(media);
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sorted.map((item) => (
                <img
                    key={item.media_id}
                    src={item.media?.url}
                    alt=""
                    className="aspect-square w-full rounded-2xl object-cover"
                />
            ))}
        </div>
    );
}

export function ListingDetail() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await productsApi.getById(id!);
                if (response.status === 'success' && response.data) {
                    setProduct(response.data);
                } else {
                    setError(response.message || 'Listing not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    return (
        <section className="py-24 px-6 md:px-12 bg-background">
            <div className="container-custom">
                {loading && <div className="p-10 text-center text-text-secondary">Loading listing...</div>}

                {!loading && error && (
                    <div className="mb-8 text-center text-red-500 bg-red-100 p-3 rounded">{error}</div>
                )}

                {!loading && !error && product && (
                    <>
                        <div className="text-center mb-12">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>
                            <p className="text-2xl font-bold text-accent-purple">{formatPrice(product.price_sek)}</p>
                            {(product.city || product.area) && (
                                <p className="text-text-secondary mt-2">
                                    {[product.city, product.area].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {product.category?.name && (
                                <p className="text-text-secondary">{product.category.name}</p>
                            )}
                            <div className="w-24 h-1 bg-gradient-brand mx-auto mt-6 rounded-full opacity-50"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                            <PhotoGallery media={product.media} />

                            <div className="flex flex-col gap-6">
                                <SpecList product={product} />

                                {product.description && (
                                    <div className="rounded-3xl border border-dark-200 bg-white dark:bg-card p-6">
                                        <p className="text-text-primary whitespace-pre-line">{product.description}</p>
                                    </div>
                                )}

                                <p className="text-sm text-text-secondary">{product.views_count} views</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

export default ListingDetail;
