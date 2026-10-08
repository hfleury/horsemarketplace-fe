import { useState, type ReactNode } from 'react';
import { Heart } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { useFavorites } from '../../hooks/useFavorites';
import { extractErrorMessage } from '../../lib/errors';
import { cn } from '../../lib/cn';
import { ProductStatus, type Product } from '../../types/product';

const GENERIC_ERROR_MESSAGE = "Couldn't update your favorites. Please try again.";

const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
    'cannot favorite your own listing': "You can't favorite your own listing.",
    'only published listings can be favorited': 'Only published listings can be favorited.',
    'Invalid or expired token': 'Your session has expired. Please log in again.',
};

function mapFavoriteError(err: unknown): string {
    return FRIENDLY_ERROR_MESSAGES[extractErrorMessage(err, '')] ?? GENERIC_ERROR_MESSAGE;
}

const VARIANT_STYLES = {
    inline: { wrapper: '', button: '', error: 'text-sm text-red-500' },
    overlay: {
        wrapper: 'flex-row-reverse',
        button: 'bg-black/50 backdrop-blur-sm text-white hover:bg-accent-pink/20 hover:text-accent-pink',
        error: 'rounded-md bg-black/70 px-2 py-1 text-xs text-red-500',
    },
} as const;

interface FavoriteButtonProps {
    product: Product;
    onToggled?: (favorited: boolean) => void;
    /** Rendered instead of the toggle when the user can't favorite this listing. */
    fallback?: ReactNode;
    /** `overlay` styles the heart to sit on top of a listing image. */
    variant?: keyof typeof VARIANT_STYLES;
    className?: string;
}

export function FavoriteButton({ product, onToggled, fallback = null, variant = 'inline', className }: FavoriteButtonProps) {
    const { canFavorite, isFavorited, toggleFavorite } = useFavorites();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const favorited = isFavorited(product.id);
    // Already-favorited listings stay toggleable after they're sold or archived, so they can be removed.
    const canToggle = canFavorite && (product.status === ProductStatus.Published || favorited);
    if (!canToggle) return <>{fallback}</>;

    async function handleClick() {
        setPending(true);
        setError(null);
        try {
            const changed = await toggleFavorite(product.id);
            if (changed) onToggled?.(!favorited);
        } catch (err) {
            setError(mapFavoriteError(err));
        } finally {
            setPending(false);
        }
    }

    const styles = VARIANT_STYLES[variant];

    return (
        <span className={cn('inline-flex items-center gap-2', styles.wrapper, className)}>
            <IconButton
                type="button"
                icon={<Heart className={cn('h-4 w-4', favorited && 'fill-current text-accent-pink')} />}
                ariaLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={favorited}
                variant="ghost"
                size="sm"
                className={styles.button}
                disabled={pending}
                onClick={handleClick}
            />
            {error && (
                <span role="alert" className={styles.error}>
                    {error}
                </span>
            )}
        </span>
    );
}

export default FavoriteButton;
