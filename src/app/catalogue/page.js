'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { categories, demoProducts } from '@/data/catalog';
import { mergeProducts, searchProduct } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';

const sortOptions = [
  { id: 'popular', label: 'Populaires' },
  { id: 'price_asc', label: 'Prix +' },
  { id: 'price_desc', label: 'Prix -' },
  { id: 'rating', label: 'Mieux notés' },
  { id: 'newest', label: 'Nouveautés' },
];

function CatalogueContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(demoProducts);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [sort, setSort] = useState('popular');
  const [priceMax, setPriceMax] = useState(700000);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .then(({ data }) => {
        setProducts(mergeProducts(data || [], demoProducts));
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    const result = products
      .filter(product => category === 'all' || product.category === category)
      .filter(product => searchProduct(product, query))
      .filter(product => Number(product.price || 0) <= priceMax)
      .filter(product => Number(product.rating || 0) >= minRating);

    switch (sort) {
      case 'price_asc':
        return result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      case 'price_desc':
        return result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      case 'rating':
        return result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      case 'newest':
        return result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      default:
        return result.sort((a, b) => Number(b.sold || b.reviews || 0) - Number(a.sold || a.reviews || 0));
    }
  }, [category, minRating, priceMax, products, query, sort]);

  function resetFilters() {
    setCategory('all');
    setQuery('');
    setSort('popular');
    setPriceMax(700000);
    setMinRating(0);
  }

  return (
    <main style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '28px clamp(16px, 4vw, 40px) 90px' }}>
        <div style={{ background: '#111', color: '#fff', borderRadius: 34, padding: 'clamp(28px, 5vw, 52px)', boxShadow: '0 24px 70px rgba(0,0,0,0.16)', marginBottom: 22 }}>
          <div style={{ color: '#F9A825', fontSize: '0.78rem', fontWeight: 900, fontFamily: 'var(--font-sora)', marginBottom: 12 }}>Catalogue BéninXi</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4.6rem)', lineHeight: 1, letterSpacing: -2.5, margin: 0, fontWeight: 950 }}>
                {category === 'all' ? 'Tous les produits' : categories.find(item => item.id === category)?.label}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.62)', margin: '16px 0 0', lineHeight: 1.7 }}>
                Même sélection que l’application mobile, avec stock, paiement Kkiapay et livraison par ville.
              </p>
            </div>
            <div style={{ color: '#F9A825', fontWeight: 950, fontSize: '1.2rem' }}>
              {loading ? '...' : `${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E7E7EC', borderRadius: 30, padding: 18, boxShadow: '0 18px 44px rgba(0,0,0,0.05)', marginBottom: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F5F5F7', border: '1px solid #E7E7EC', borderRadius: 18, padding: '0 14px' }}>
              <span style={{ width: 12, height: 12, borderRadius: 999, border: '2px solid #A7A7AE', marginRight: 10 }} />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher smartphone, pagne, sac..." style={{ flex: 1, height: 50, background: 'transparent', border: 0, outline: 0, color: '#111', fontSize: '0.92rem' }} />
              {query ? <button onClick={() => setQuery('')} style={{ border: 0, background: 'transparent', color: '#A7A7AE', cursor: 'pointer', fontWeight: 900 }}>×</button> : null}
            </div>
            <select value={sort} onChange={event => setSort(event.target.value)} style={{ border: '1px solid #E7E7EC', background: '#F5F5F7', borderRadius: 18, padding: '0 14px', color: '#111', fontWeight: 900, outline: 0 }}>
              {sortOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 16 }}>
            {categories.map(item => (
              <button key={item.id} onClick={() => setCategory(item.id)} style={{ border: `1px solid ${category === item.id ? '#111' : '#E7E7EC'}`, background: category === item.id ? '#111' : '#fff', color: category === item.id ? '#fff' : '#111', borderRadius: 999, padding: '10px 15px', fontWeight: 900, cursor: 'pointer' }}>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'center' }}>
            <div>
              <div style={{ color: '#77777F', fontSize: '0.78rem', fontWeight: 900, marginBottom: 8 }}>Prix maximum: {Number(priceMax).toLocaleString('fr-FR')} FCFA</div>
              <input type="range" min="5000" max="700000" step="5000" value={priceMax} onChange={event => setPriceMax(Number(event.target.value))} style={{ width: '100%', accentColor: '#1B5E20' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 3, 4, 4.5].map(rating => (
                <button key={rating} onClick={() => setMinRating(rating)} style={{ flex: 1, border: `1px solid ${minRating === rating ? '#1B5E20' : '#E7E7EC'}`, background: minRating === rating ? '#F0FAF0' : '#fff', color: minRating === rating ? '#1B5E20' : '#77777F', borderRadius: 14, padding: '10px 8px', fontWeight: 900, cursor: 'pointer' }}>
                  {rating === 0 ? 'Tout' : `${rating}★`}
                </button>
              ))}
            </div>
            <button onClick={resetFilters} style={{ border: 0, background: '#F5F5F7', borderRadius: 16, padding: '12px 16px', color: '#111', fontWeight: 900, cursor: 'pointer' }}>Réinitialiser</button>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#77777F', fontWeight: 900, padding: 30 }}>Chargement du catalogue...</div>
        ) : filteredProducts.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E7E7EC', borderRadius: 30, padding: 42, textAlign: 'center' }}>
            <h2 style={{ color: '#111', margin: 0, fontWeight: 950 }}>Aucun produit trouvé</h2>
            <p style={{ color: '#77777F' }}>Essaie de modifier les filtres ou la recherche.</p>
            <button onClick={resetFilters} style={{ border: 0, background: '#111', color: '#fff', borderRadius: 999, padding: '13px 20px', fontWeight: 900, cursor: 'pointer' }}>Réinitialiser</button>
          </div>
        )}

        <div style={{ marginTop: 34 }}>
          <Link href="/" style={{ color: '#1B5E20', fontWeight: 900, textDecoration: 'none' }}>Retour à l’accueil</Link>
        </div>
      </section>
    </main>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Chargement...</main>}>
      <CatalogueContent />
    </Suspense>
  );
}
