import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductStatus, ProductType, type Product, type ProductStatusKind } from '../../types/product';
import { formatPrice } from '../../lib/formatPrice';
import { selectCoverImage } from '../../lib/media';
import { FavoriteButton } from './FavoriteButton';
import Badge from '../ui/Badge';

function statusBadgeLabel(status: ProductStatusKind): string | null {
    if (status === ProductStatus.Published) return null;
    return status === ProductStatus.Sold ? 'Sold' : 'Unavailable';
}

function TypeSummary({ product }: { product: Product }) {
    switch (product.type) {
        case ProductType.Horse: {
            const parts = [product.horse?.breed, product.horse?.age !== undefined ? `${product.horse.age} yrs` : undefined].filter(Boolean);
            return <span>{parts.length > 0 ? parts.join(' • ') : 'Horse'}</span>;
        }
        case ProductType.Vehicle: {
            const parts = [product.vehicle?.make, product.vehicle?.model].filter(Boolean);
            return <span>{parts.length > 0 ? parts.join(' ') : 'Vehicle'}</span>;
        }
        case ProductType.Equipment: {
            const parts = [product.equipment?.make, product.equipment?.model].filter(Boolean);
            return <span>{parts.length > 0 ? parts.join(' ') : 'Equipment'}</span>;
        }
        default:
            return null;
    }
}

interface ListingCardProps {
    product: Product;
    onFavoriteToggled?: (favorited: boolean) => void;
}

export function ListingCard({ product, onFavoriteToggled }: ListingCardProps) {
    const [imageFailed, setImageFailed] = useState(false);
    const coverImage = selectCoverImage(product.media);
    const statusLabel = statusBadgeLabel(product.status);

    // The favorite toggle is a sibling of the Link, not a child: a button nested in an anchor is invalid HTML.
    return (
        <div className="relative transition-transform duration-300 hover:scale-[1.02]">
            <Link
                to={`/listings/${product.id}`}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-dark-200 bg-white dark:bg-card transition-shadow duration-300 hover:shadow-card"
            >
                <div className="relative">
                    {coverImage?.media?.url && !imageFailed ? (
                        <img
                            src={coverImage.media.url}
                            alt={product.title}
                            className="h-40 w-full rounded-t-3xl object-cover"
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <div className="h-40 w-full rounded-t-3xl bg-dark-100/50 dark:bg-dark-200/30" />
                    )}
                    {statusLabel && (
                        <Badge variant="warning" size="sm" className="absolute top-3 left-3">
                            {statusLabel}
                        </Badge>
                    )}
                </div>

                <div className="flex flex-col gap-1 p-6">
                    <h3 className="font-display font-bold text-text-primary line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-text-secondary">
                        <TypeSummary product={product} />
                    </p>
                    {product.city && <p className="text-sm text-text-secondary">{product.city}</p>}
                    <p className="mt-2 font-bold text-accent-purple">{formatPrice(product.price_sek)}</p>
                </div>
            </Link>
            <FavoriteButton
                product={product}
                variant="overlay"
                className="absolute top-3 right-3"
                onToggled={onFavoriteToggled}
            />
        </div>
    );
}

export default ListingCard;
