'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'beninxi_cart';

function getCartLineKey(item) {
  return [item?.id, item?.color || 'Standard', item?.size || 'Standard'].join('::');
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedItems = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
      if (Array.isArray(savedItems)) setItems(savedItems);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Le panier reste utilisable en mémoire si le stockage local est indisponible.
    }
  }, [hydrated, items]);

  function addItem(product) {
    setItems(prev => {
      const normalizedProduct = {
        ...product,
        color: product.color || 'Standard',
        size: product.size || 'Standard',
        qty: Number(product.qty || 1),
      };
      const productKey = getCartLineKey(normalizedProduct);
      const exists = prev.find(i => getCartLineKey(i) === productKey);
      if (exists) return prev.map(i => getCartLineKey(i) === productKey ? { ...i, qty: i.qty + normalizedProduct.qty } : i);
      return [...prev, normalizedProduct];
    });
    setIsOpen(true);
  }

  function removeItem(item) {
    const itemKey = typeof item === 'string' ? item : getCartLineKey(item);
    setItems(prev => prev.filter(i => getCartLineKey(i) !== itemKey));
  }

  function updateQty(item, qty) {
    const itemKey = typeof item === 'string' ? item : getCartLineKey(item);
    if (qty < 1) return removeItem(itemKey);
    setItems(prev => prev.map(i => getCartLineKey(i) === itemKey ? { ...i, qty } : i));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, getCartLineKey }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
