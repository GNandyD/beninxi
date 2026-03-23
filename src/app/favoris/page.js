'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

export default function FavorisPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const { addItem } = useCart();

  return (
    <main style={{ background: '#F8F8F8', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#0A0A0A', padding: '48px 40px 40px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10, fontFamily: 'var(--font-sora)', letterSpacing: 2 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Accueil</Link> › Favoris
          </div>
          <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#fff', letterSpacing: -1, marginBottom: 8 }}>
            ❤️ Mes Favoris
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
            {favorites.length} produit{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 40px' }}>
        {favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, border: '1px solid #F0F0F0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🤍</div>
            <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.3rem', color: '#0A0A0A', marginBottom: 10 }}>
              Aucun favori pour l'instant
            </h3>
            <p style={{ color: '#AAA', fontSize: '0.9rem', marginBottom: 28 }}>
              Cliquez sur le ❤️ d'un produit pour le sauvegarder ici
            </p>
            <Link href="/catalogue" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 50, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem', display: 'inline-block' }}>
              Découvrir les produits →
            </Link>
          </div>
        ) : (
          <>
            {/* Bouton tout supprimer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <button onClick={() => favorites.forEach(p => toggleFavorite(p))} style={{ background: 'none', border: '1.5px solid #F0F0F0', borderRadius: 50, padding: '8px 20px', fontSize: '0.8rem', fontWeight: 700, color: '#C62828', cursor: 'pointer', fontFamily: 'var(--font-sora)' }}>
                🗑️ Tout supprimer
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {favorites.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <Link href={`/produit/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#F8F8F8' }}>
                      <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />
                      {p.badge && (
                        <div style={{ position: 'absolute', top: 12, left: 12, background: '#0A0A0A', color: '#fff', padding: '4px 12px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800, fontFamily: 'var(--font-sora)' }}>
                          {p.badge}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#AAA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4, fontFamily: 'var(--font-sora)' }}>{p.seller}</div>
                    <Link href={`/produit/${p.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0A0A0A', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                    </Link>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.floor(p.rating) ? '#F9A825' : '#EBEBEB', fontSize: '0.72rem' }}>★</span>)}
                      <span style={{ fontSize: '0.68rem', color: '#AAA', marginLeft: 4 }}>({p.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F5F5F5', paddingTop: 14, gap: 10 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#1B5E20' }}>{fmt(p.price)}</div>
                        {p.old_price && <div style={{ fontSize: '0.7rem', color: '#CCC', textDecoration: 'line-through' }}>{fmt(p.old_price)}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => toggleFavorite(p)} style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFF0F0', border: '1.5px solid #FFD0D0', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          🗑️
                        </button>
                        <button onClick={() => addItem({ id: p.id, name: p.name, price: p.price, img: p.img, color: 'Standard', size: 'Standard', qty: 1 })} style={{ flex: 1, background: '#0A0A0A', color: '#fff', border: 'none', padding: '0 18px', height: 36, borderRadius: 50, fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', whiteSpace: 'nowrap' }}>
                          + Panier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
