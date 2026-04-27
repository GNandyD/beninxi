'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

export default function FavorisPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const [added, setAdded] = useState({});

  function handleAdd(p) {
    addItem({ id: p.id, name: p.name, price: p.price, img: p.img, color: 'Standard', size: 'Standard', qty: 1 });
    setAdded(a => ({ ...a, [p.id]: true }));
    setTimeout(() => setAdded(a => ({ ...a, [p.id]: false })), 1800);
  }

  return (
    <main style={{ background: '#F8F8F8', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
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
                🗑️ Tout supprimer
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 48px' }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '96px 40px', background: '#fff', borderRadius: 28, border: '1px solid #F0F0F0', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', animation: 'fadeUp 0.5s ease' }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🤍</div>
            <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.4rem', color: '#0A0A0A', marginBottom: 10, letterSpacing: -0.3 }}>
              Aucun favori pour l'instant
            </h3>
            <p style={{ color: '#AAA', fontSize: '0.9rem', marginBottom: 32, lineHeight: 1.7 }}>
              Cliquez sur ❤️ sur un produit pour le sauvegarder ici
            </p>
            <Link href="/catalogue" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 999, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              Découvrir les produits →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {favorites.map((p, i) => (
              <div
                key={p.id}
                style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s', animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
              >
                <Link href={`/produit/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#F8F8F8' }}>
                    <img
                      src={p.img} alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)' }} />
                    {p.badge && (
                      <div style={{ position: 'absolute', top: 12, left: 12, background: '#0A0A0A', color: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: '0.66rem', fontWeight: 800, fontFamily: 'var(--font-sora)' }}>
                        {p.badge}
                      </div>
                    )}
                  </div>
                </Link>

                <div style={{ padding: '16px 18px 20px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#BBB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5, fontFamily: 'var(--font-sora)' }}>{p.seller}</div>
                  <Link href={`/produit/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0A0A0A', marginBottom: 8, lineHeight: 1.35 }}>{p.name}</div>
                  </Link>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                    {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.floor(p.rating) ? '#F9A825' : '#EBEBEB', fontSize: '0.7rem' }}>★</span>)}
                    <span style={{ fontSize: '0.66rem', color: '#BBB', marginLeft: 4 }}>({p.reviews})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F5F5F5', paddingTop: 14 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#1B5E20' }}>{fmt(p.price)}</div>
                      {p.old_price && <div style={{ fontSize: '0.68rem', color: '#CCC', textDecoration: 'line-through' }}>{fmt(p.old_price)}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => toggleFavorite(p)}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF0F0', border: '1.5px solid #FFCDD2', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => handleAdd(p)}
                        style={{ flex: 1, background: added[p.id] ? '#1B5E20' : '#0A0A0A', color: '#fff', border: 'none', padding: '0 18px', height: 36, borderRadius: 999, fontWeight: 800, fontSize: '0.76rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.25s', whiteSpace: 'nowrap', boxShadow: added[p.id] ? '0 4px 14px rgba(27,94,32,0.3)' : '0 4px 14px rgba(0,0,0,0.15)' }}
                      >
                        {added[p.id] ? '✓ Ajouté !' : '+ Panier'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
