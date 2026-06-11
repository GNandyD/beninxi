'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getAvailability } from '@/lib/catalog';

function fmt(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [added, setAdded] = useState(false);
  const availability = getAvailability(product);
  const available = availability.tone !== 'danger';
  const liked = isFavorite(product.id);
  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  function handleAdd(event) {
    event.preventDefault();
    if (!available) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      category: product.category,
      color: 'Standard',
      size: 'Standard',
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <Link href={`/produit/${product.id}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          background: '#fff',
          border: '1px solid #E7E7EC',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 18px 44px rgba(0,0,0,0.07)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          height: '100%',
        }}
      >
        <div style={{ position: 'relative', aspectRatio: '1 / 0.9', background: '#F5F5F7', overflow: 'hidden' }}>
          <Image src={product.img} alt={product.name} fill sizes="(max-width: 900px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.24), transparent 54%)' }} />
          {product.badge ? (
            <span style={{ position: 'absolute', top: 14, left: 14, background: '#111', color: '#fff', borderRadius: 999, padding: '6px 12px', fontSize: '0.68rem', fontWeight: 900, fontFamily: 'var(--font-sora)' }}>
              {product.badge}
            </span>
          ) : null}
          {discount > 0 ? (
            <span style={{ position: 'absolute', top: 14, right: 58, background: '#C62828', color: '#fff', borderRadius: 999, padding: '6px 10px', fontSize: '0.68rem', fontWeight: 900 }}>
              -{discount}%
            </span>
          ) : null}
          <button
            onClick={event => { event.preventDefault(); toggleFavorite(product); }}
            style={{ position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: 19, border: '1px solid rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.92)', color: liked ? '#C62828' : '#9A9AA1', cursor: 'pointer', fontSize: '1.05rem', fontWeight: 900 }}
            aria-label="Ajouter aux favoris"
          >
            {liked ? '♥' : '♡'}
          </button>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#8B8B92', fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.2, fontFamily: 'var(--font-sora)' }}>
              Sélection BéninXi
            </span>
            <span style={{ color: availability.tone === 'success' ? '#1B5E20' : availability.tone === 'warning' ? '#8A5A00' : '#C62828', background: availability.tone === 'success' ? '#F0FAF0' : availability.tone === 'warning' ? '#FFF8E1' : '#FFF0F0', borderRadius: 999, padding: '4px 8px', fontSize: '0.64rem', fontWeight: 900 }}>
              {availability.label}
            </span>
          </div>
          <h3 style={{ color: '#111', fontSize: '0.98rem', lineHeight: 1.35, minHeight: 42, margin: '0 0 10px', fontWeight: 900 }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <span style={{ color: '#F9A825', fontSize: '0.78rem', fontWeight: 900 }}>★ {Number(product.rating || 4.5).toFixed(1)}</span>
            <span style={{ color: '#A7A7AE', fontSize: '0.75rem' }}>({product.reviews || 0})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, borderTop: '1px solid #EFEFF3', paddingTop: 14 }}>
            <div>
              <div style={{ color: '#1B5E20', fontSize: '1rem', fontWeight: 900, fontFamily: 'var(--font-sora)' }}>{fmt(product.price)}</div>
              {product.old_price ? <div style={{ color: '#B8B8BE', textDecoration: 'line-through', fontSize: '0.72rem', marginTop: 2 }}>{fmt(product.old_price)}</div> : null}
            </div>
            <button
              onClick={handleAdd}
              disabled={!available}
              style={{ width: 40, height: 40, borderRadius: 20, border: 0, background: added ? '#1B5E20' : available ? '#111' : '#E7E7EC', color: available ? '#fff' : '#A7A7AE', cursor: available ? 'pointer' : 'not-allowed', fontWeight: 900, fontSize: '1rem' }}
              aria-label="Ajouter au panier"
            >
              {added ? '✓' : '+'}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
