'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { useFavorites } from '@/context/FavoritesContext';

export default function FavorisPage() {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <main style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#0A0A0A', padding: '48px 48px 40px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginBottom: 12, fontFamily: 'var(--font-sora)', letterSpacing: 2 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Accueil</Link> › Favoris
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#fff', letterSpacing: -1, marginBottom: 8 }}>
                Mes Favoris
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem' }}>
                {favorites.length} produit{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
              </p>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={() => favorites.forEach(p => toggleFavorite(p))}
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s' }}
              >
                Tout supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 48px' }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '96px 40px', background: '#fff', borderRadius: 28, border: '1px solid #F0F0F0', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', animation: 'fadeUp 0.5s ease' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20, color: '#111' }}>♡</div>
            <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.4rem', color: '#0A0A0A', marginBottom: 10, letterSpacing: -0.3 }}>
              Aucun favori pour l&apos;instant
            </h3>
            <p style={{ color: '#AAA', fontSize: '0.9rem', marginBottom: 32, lineHeight: 1.7 }}>
              Clique sur le cœur d’un produit pour le sauvegarder ici.
            </p>
            <Link href="/catalogue" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 999, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              Découvrir les produits →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
            {favorites.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </main>
  );
}
