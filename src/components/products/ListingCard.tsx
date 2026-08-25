import { Link } from 'react-router-dom';
import { ProductType, type Product } from '../../types/product';
import { formatPrice } from '../../lib/formatPrice';

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
}

export function ListingCard({ product }: ListingCardProps) {
    return (
        <Link
            to={`/listings/${product.id}`}
            className="flex flex-col overflow-hidden rounded-3xl border border-dark-200 bg-white dark:bg-card transition-all duration-300 hover:shadow-card hover:scale-[1.02]"
        >
            <div className="h-40 w-full rounded-t-3xl bg-dark-100/50 dark:bg-dark-200/30" />

            <div className="flex flex-col gap-1 p-6">
                <h3 className="font-display font-bold text-text-primary line-clamp-1">{product.title}</h3>
                <p className="text-sm text-text-secondary">
                    <TypeSummary product={product} />
                </p>
                {product.city && <p className="text-sm text-text-secondary">{product.city}</p>}
                <p className="mt-2 font-bold text-accent-purple">{formatPrice(product.price_sek)}</p>
            </div>
        </Link>
    );
}

export default ListingCard;
