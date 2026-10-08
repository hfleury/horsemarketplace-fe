import React, { useCallback, useEffect, useState } from 'react';
import { favoritesApi } from '../api/favorites';
import { useAuth } from '../hooks/useAuth';
import { FavoritesContext } from './favoritesContext';

interface LoadedFavorites {
    token: string | null;
    productIds: Set<string>;
}

const EMPTY_FAVORITES: LoadedFavorites = { token: null, productIds: new Set() };

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user, token } = useAuth();
    const [loaded, setLoaded] = useState<LoadedFavorites>(EMPTY_FAVORITES);

    // Keyed by token so a logout or account switch never shows the previous user's favorites.
    const favoritedIds = loaded.token === token ? loaded.productIds : EMPTY_FAVORITES.productIds;

    useEffect(() => {
        if (!token) return;

        let cancelled = false;
        favoritesApi
            .listIds()
            .then((response) => {
                if (!cancelled && response.status === 'success') {
                    setLoaded({ token, productIds: new Set(response.data ?? []) });
                }
            })
            .catch(() => {
                // Supplementary state — hearts stay unfilled and a later toggle surfaces the error.
            });

        return () => {
            cancelled = true;
        };
    }, [token]);

    const isFavorited = useCallback((productId: string) => favoritedIds.has(productId), [favoritedIds]);

    const toggleFavorite = useCallback(
        async (productId: string) => {
            const wasFavorited = favoritedIds.has(productId);
            const response = wasFavorited
                ? await favoritesApi.remove(productId)
                : await favoritesApi.add(productId);
            if (response.status !== 'success' || !response.data) {
                throw new Error(response.message ?? 'Failed to update favorite');
            }

            const { favorited } = response.data;
            setLoaded((previous) => {
                const productIds = new Set(previous.token === token ? previous.productIds : []);
                if (favorited) productIds.add(productId);
                else productIds.delete(productId);
                return { token, productIds };
            });
            return favorited !== wasFavorited;
        },
        [favoritedIds, token]
    );

    return (
        <FavoritesContext.Provider value={{ canFavorite: !!user, isFavorited, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}
