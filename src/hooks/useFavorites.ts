import { useContext } from 'react';
import { FavoritesContext } from '../context/favoritesContext';

export const useFavorites = () => useContext(FavoritesContext);
