'use client';
import { useFavorites } from '@/context/FavoritesContext';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

const categories = [
  { id: 'all',        label: 'Tout',       emoji: '🛍️' },
  { id: 'vetements',  label: 'Vêtements',  emoji: '👗' },
  { id: 'chaussures', label: 'Chaussures', emoji: '👟' },
  { id: 'meubles',    label: 'Meubles',    emoji: '🛋️' },
  { id: 'montres',    label: 'Montres',    emoji: '⌚' },
  { id: 'colliers',   label: 'Colliers',   emoji: '📿' },
  { id: 'chaines',    label: 'Chaînes',    emoji: '⛓️' },
];

const sortOptions = [
  { id: 'popular',    label: '🔥 Plus populaires'  },
  { id: 'price_asc',  label: '↑ Prix croissant'    },
  { id: 'price_desc', label: '↓ Prix décroissant'  },
  { id: 'rating',     label: '⭐ Mieux notés'       },
  { id: 'newest',     label: '✨ Nouveautés'        },
];

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0', background: '#fff' }}>
      <div style={{ height: 260, background: '#F5F5F5' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ height: 10, background: '#F5F5F5', borderRadius: 5, width: '40%', marginBottom: 10 }} />
        <div style={{ height: 14, background: '#F5F5F5', borderRadius: 5, marginBottom: 8 }} />
        <div style={{ height: 10, background: '#F5F5F5', borderRadius: 5, width: '30%' }} />
      </div>
    </div>
  );
}

function ProductCard({ p }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const liked = isFavorite(p.id);
  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;

  function handleAdd(e) {
    e.preventDefault();
    addItem({ id: p.id, name: p.name, price: p.price, img: p.img, color: 'Standard', size: 'Standard', qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link href={`/produit/${p.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', transition: 'transform 0.3s, box-shadow 0.3s' }}>
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#F8F8F8' }}>
        <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />
        {p.badge && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: ['Luxe','Premium'].includes(p.badge) ? '#0A0A0A' : '#1B5E20', color: '#fff', padding: '4px 12px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>
            {p.badge}
          </div>
        )}
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 12, right: 48, background: '#C62828', color: '#fff', padding: '4px 10px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800 }}>
            -{discount}%
          </div>
        )}
        <button onClick={e => { e.preventDefault(); toggleFavorite(p); }} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: liked ? '#FFF0F0' : 'rgba(255,255,255,0.95)', border: liked ? '1.5px solid #C62828' : 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {liked ? '❤️' : '🤍'}
        </button>
        <button onClick={handleAdd} style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: added ? '#1B5E20' : '#fff', color: added ? '#fff' : '#0A0A0A', border: 'none', padding: '9px 22px', borderRadius: 50, fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>
          {added ? '✓ Ajouté !' : '+ Panier'}
        </button>
      </div>
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ fontSize: '0.62rem', color: '#AAA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4, fontFamily: 'var(--font-sora)' }}>{p.seller}</div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A0A0A', marginBottom: 8, lineHeight: 1.3, fontFamily: 'var(--font-dm)' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 10 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.floor(p.rating) ? '#F9A825' : '#EBEBEB', fontSize: '0.72rem' }}>★</span>)}
          <span style={{ fontSize: '0.68rem', color: '#AAA', marginLeft: 4 }}>({p.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F5F5F5', paddingTop: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#1B5E20' }}>{fmt(p.price)}</div>
            {p.old_price && <div style={{ fontSize: '0.7rem', color: '#CCC', textDecoration: 'line-through' }}>{fmt(p.old_price)}</div>}
          </div>
          <button onClick={handleAdd} style={{ width: 34, height: 34, borderRadius: '50%', background: added ? '#1B5E20' : '#F5F5F5', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: added ? '#fff' : '#0A0A0A' }}>
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort]         = useState('popular');
  const [priceMax, setPriceMax] = useState(500000);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*');
      setProducts(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let r = [...products];
    if (category !== 'all') r = r.filter(p => p.category === category);
    if (search) r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.seller?.toLowerCase().includes(search.toLowerCase()));
    r = r.filter(p => p.price <= priceMax && p.rating >= minRating);
    switch(sort) {
      case 'price_asc':  r.sort((a,b) => a.price - b.price); break;
      case 'price_desc': r.sort((a,b) => b.price - a.price); break;
      case 'rating':     r.sort((a,b) => b.rating - a.rating); break;
      case 'newest':     r.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)); break;
      default:           r.sort((a,b) => b.sold - a.sold);
    }
    return r;
  }, [products, category, search, sort, priceMax, minRating]);

  function reset() { setCategory('all'); setPriceMax(500000); setMinRating(0); setSearch(''); setSort('popular'); }

  const activeFilters = (category !== 'all' ? 1 : 0) + (priceMax < 500000 ? 1 : 0) + (minRating > 0 ? 1 : 0) + (search ? 1 : 0);

  return (
    <main style={{ background: '#F8F8F8', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      {/* Header page */}
      <div style={{ background: '#0A0A0A', padding: '48px 40px 40px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10, fontFamily: 'var(--font-sora)', letterSpacing: 2 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Accueil</Link> › Catalogue
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#fff', letterSpacing: -1, marginBottom: 8 }}>
                {category === 'all' ? 'Tous les produits' : categories.find(c => c.id === category)?.label}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
                {loading ? '...' : `${filtered.length} produit${filtered.length > 1 ? 's' : ''} disponible${filtered.length > 1 ? 's' : ''}`}
              </p>
            </div>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden', minWidth: 340 }}>
              <span style={{ padding: '0 12px 0 16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                style={{ flex: 1, border: 'none', background: 'none', padding: '13px 0', fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-dm)', color: '#fff' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>✕</button>}
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ padding: '8px 18px', borderRadius: 50, border: `1.5px solid ${category === cat.id ? '#F9A825' : 'rgba(255,255,255,0.12)'}`, background: category === cat.id ? '#F9A825' : 'transparent', color: category === cat.id ? '#0A0A0A' : 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 40px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}>

        {/* ═══ SIDEBAR ═══ */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: '1px solid #F0F0F0', position: 'sticky', top: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.95rem', color: '#0A0A0A' }}>
              Filtres {activeFilters > 0 && <span style={{ background: '#C62828', color: '#fff', fontSize: '0.65rem', padding: '2px 7px', borderRadius: 50, marginLeft: 6 }}>{activeFilters}</span>}
            </h3>
            {activeFilters > 0 && (
              <button onClick={reset} style={{ background: 'none', border: 'none', color: '#C62828', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Prix */}
          <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #F5F5F5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>Prix maximum</span>
              <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#1B5E20', fontFamily: 'var(--font-sora)' }}>{fmt(priceMax)}</span>
            </div>
            <input type="range" min="5000" max="500000" step="5000" value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} style={{ width: '100%', accentColor: '#1B5E20', cursor: 'pointer', height: 4 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#CCC', marginTop: 6 }}>
              <span>5 000</span><span>500 000 FCFA</span>
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #F5F5F5' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 14, fontFamily: 'var(--font-sora)' }}>Note minimum</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 3, 4, 4.5].map(r => (
                <button key={r} onClick={() => setMinRating(r)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `2px solid ${minRating === r ? '#0A0A0A' : '#F0F0F0'}`, background: minRating === r ? '#0A0A0A' : '#fff', color: minRating === r ? '#fff' : '#666', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-dm)', transition: 'all 0.2s' }}>
                  {r === 0 ? 'Tout' : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Catégories */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 14, fontFamily: 'var(--font-sora)' }}>Catégorie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: 'none', background: category === cat.id ? '#F5F5F5' : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: category === cat.id ? 700 : 400, color: category === cat.id ? '#0A0A0A' : '#666', fontSize: '0.86rem', textAlign: 'left', transition: 'all 0.15s' }}>
                  <span>{cat.emoji}</span>
                  <span style={{ flex: 1 }}>{cat.label}</span>
                  {category === cat.id && <span style={{ color: '#1B5E20', fontWeight: 900, fontSize: '0.8rem' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ GRILLE ═══ */}
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            {/* Tags actifs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {search && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F5F5F5', color: '#0A0A0A', padding: '6px 14px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                  🔍 "{search}" <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '0.8rem', padding: 0, lineHeight: 1 }}>✕</button>
                </span>
              )}
              {priceMax < 500000 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF8E1', color: '#E65100', padding: '6px 14px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                  Max {fmt(priceMax)} <button onClick={() => setPriceMax(500000)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E65100', fontSize: '0.8rem', padding: 0 }}>✕</button>
                </span>
              )}
              {minRating > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFFBF0', color: '#F57F17', padding: '6px 14px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                  {minRating}★+ <button onClick={() => setMinRating(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F57F17', fontSize: '0.8rem', padding: 0 }}>✕</button>
                </span>
              )}
            </div>
            {/* Sort */}
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: '1.5px solid #F0F0F0', borderRadius: 12, padding: '10px 16px', fontSize: '0.82rem', outline: 'none', fontFamily: 'var(--font-dm)', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#0A0A0A' }}>
              {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '1px solid #F0F0F0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.2rem', color: '#0A0A0A', marginBottom: 8 }}>Aucun produit trouvé</h3>
              <p style={{ color: '#AAA', fontSize: '0.88rem', marginBottom: 24 }}>Essayez de modifier vos filtres</p>
              <button onClick={reset} style={{ background: '#0A0A0A', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sora)', fontSize: '0.88rem' }}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
              {filtered.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
