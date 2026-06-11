'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext(null);
const FAVORITES_STORAGE_KEY = 'beninxi_favorites';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedFavorites = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
      if (Array.isArray(savedFavorites)) setFavorites(savedFavorites);
    } catch {
      window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Les favoris restent utilisables en mémoire si le stockage local est indisponible.
    }
  }, [hydrated, favorites]);

  function toggleFavorite(product) {
    setFavorites(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
    });
  }

  function isFavorite(id) {
    return favorites.some(p => p.id === id);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
