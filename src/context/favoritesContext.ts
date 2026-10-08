import { createContext } from 'react';

export interface FavoritesContextType {
    canFavorite: boolean;
    isFavorited: (productId: string) => boolean;
    /** Resolves to whether the favorited state actually changed; rejects on failure. */
    toggleFavorite: (productId: string) => Promise<boolean>;
}

// Outside a FavoritesProvider nothing can be favorited, so consumers render nothing.
const noFavorites: FavoritesContextType = {
    canFavorite: false,
    isFavorited: () => false,
    toggleFavorite: () => Promise.resolve(false),
};

export const FavoritesContext = createContext<FavoritesContextType>(noFavorites);
