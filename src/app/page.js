'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

const slides = [
  {
    tag: '✦ NOUVELLE COLLECTION',
    title: 'Mode\nAfricaine\nPremium.',
    sub: 'Robes wax, boubous brodés et tenues traditionnelles confectionnés par des artisans béninois.',
    cta: 'Explorer la mode',
    href: '/catalogue?cat=vetements',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #1B3A1F 50%, #0F2D12 100%)',
    accent: '#2A9455',
    img: 'https://images.unsplash.com/photo-1558171813-1a5ee65fa0a2?w=800&q=80',
  },
  {
    tag: '⌚ MONTRES & BIJOUX',
    title: 'L\'Élégance\nà Portée\nde Main.',
    sub: 'Montres premium, colliers et chaînes dorées pour sublimer chaque occasion.',
    cta: 'Voir les montres',
    href: '/catalogue?cat=montres',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #2D1A00 50%, #1A0F00 100%)',
    accent: '#F9A825',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  },
  {
    tag: '🛋️ ART DE VIVRE',
    title: 'Votre\nIntérieur\nSublimé.',
    sub: 'Meubles artisanaux béninois. Livraison et montage inclus à Cotonou.',
    cta: 'Voir les meubles',
    href: '/catalogue?cat=meubles',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #1A0A0A 50%, #2D1010 100%)',
    accent: '#C62828',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  },
];

const categories = [
  { id: 'vetements',  label: 'Vêtements',  emoji: '👗', img: 'https://images.unsplash.com/photo-1558171813-1a5ee65fa0a2?w=400&q=80' },
  { id: 'chaussures', label: 'Chaussures', emoji: '👟', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { id: 'meubles',    label: 'Meubles',    emoji: '🛋️', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
  { id: 'montres',    label: 'Montres',    emoji: '⌚', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80' },
  { id: 'colliers',   label: 'Colliers',   emoji: '📿', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
  { id: 'chaines',    label: 'Chaînes',    emoji: '⛓️', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
];

function ProductCard({ p }) {
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [added, setAdded] = useState(false);
  const liked = isFavorite(p.id);
  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;

  function handleAdd(e) {
    e.preventDefault();
    addItem({ id: p.id, name: p.name, price: p.price, img: p.img, color: 'Standard', size: 'Standard', qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Link href={`/produit/${p.id}`} className="card-hover" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div className="img-zoom" style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#F8F8F8' }}>
        <Image src={p.img} alt={p.name} fill sizes="(max-width: 900px) 100vw, 25vw" style={{ objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 55%)' }} />
        {p.badge && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: ['Luxe','Premium'].includes(p.badge) ? '#0A0A0A' : '#1B5E20', color: '#fff', padding: '4px 12px', borderRadius: 999, fontSize: '0.66rem', fontWeight: 800, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>
            {p.badge}
          </div>
        )}
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 12, right: 46, background: '#C62828', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: '0.66rem', fontWeight: 800 }}>
            -{discount}%
          </div>
        )}
        <button onClick={e => { e.preventDefault(); toggleFavorite(p); }} style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: '50%', background: liked ? '#FFF0F0' : 'rgba(255,255,255,0.95)', border: liked ? '1.5px solid #C62828' : 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
          {liked ? '❤️' : '🤍'}
        </button>
        <button onClick={handleAdd} style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: added ? '#1B5E20' : 'rgba(255,255,255,0.95)', color: added ? '#fff' : '#0A0A0A', border: 'none', padding: '9px 22px', borderRadius: 999, fontWeight: 800, fontSize: '0.76rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.25s', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
          {added ? '✓ Ajouté !' : '+ Panier'}
        </button>
      </div>
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ fontSize: '0.6rem', color: '#BBB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5, fontFamily: 'var(--font-sora)' }}>{p.seller}</div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0A0A0A', marginBottom: 8, lineHeight: 1.35, fontFamily: 'var(--font-dm)' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 10 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.floor(p.rating) ? '#F9A825' : '#EBEBEB', fontSize: '0.7rem' }}>★</span>)}
          <span style={{ fontSize: '0.66rem', color: '#BBB', marginLeft: 4 }}>({p.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F5F5F5', paddingTop: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#1B5E20' }}>{fmt(p.price)}</div>
            {p.old_price && <div style={{ fontSize: '0.68rem', color: '#CCC', textDecoration: 'line-through' }}>{fmt(p.old_price)}</div>}
          </div>
          <button onClick={handleAdd} style={{ width: 32, height: 32, borderRadius: '50%', background: added ? '#1B5E20' : '#F5F5F5', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: added ? '#fff' : '#0A0A0A' }}>
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0' }}>
      <div className="skeleton" style={{ height: 260 }} />
      <div style={{ padding: '14px 16px 18px' }}>
        <div className="skeleton" style={{ height: 8, width: '35%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 12, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 8, width: '25%' }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [slide, setSlide]       = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [seconds, setSeconds]   = useState({ h: 2, m: 47, s: 33 });
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(prev => {
        let { h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    supabase.from('products').select('*').limit(8).then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  const pad = n => String(n).padStart(2, '0');
  const s = slides[slide];

  return (
    <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section style={{ background: s.bg, minHeight: '92vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', overflow: 'hidden', transition: 'background 1s' }}>

        {/* Fond décoratif */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)' }} />

        {/* Contenu gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(32px, 8vw, 100px) clamp(20px, 5vw, 80px)', position: 'relative', zIndex: 2 }}>
          <div key={`tag-${slide}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${s.accent}18`, border: `1px solid ${s.accent}40`, color: s.accent, padding: '8px 18px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 800, marginBottom: 28, fontFamily: 'var(--font-sora)', letterSpacing: 2, width: 'fit-content', animation: 'fadeUp 0.6s ease' }}>
            {s.tag}
          </div>
          <h1 key={`title-${slide}`} style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.8rem, 5.5vw, 5rem)', color: '#fff', lineHeight: 1.02, marginBottom: 28, whiteSpace: 'pre-line', letterSpacing: -2, animation: 'fadeUp 0.6s ease 0.1s both' }}>
            {s.title}
          </h1>
          <p key={`sub-${slide}`} style={{ fontSize: 'clamp(0.88rem, 1.2vw, 1.05rem)', color: 'rgba(255,255,255,0.6)', marginBottom: 44, lineHeight: 1.75, maxWidth: 420, fontFamily: 'var(--font-dm)', animation: 'fadeUp 0.6s ease 0.2s both' }}>
            {s.sub}
          </p>
          <div key={`cta-${slide}`} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.6s ease 0.3s both' }}>
            <Link href={s.href} className="btn-press" style={{ background: s.accent, color: s.accent === '#F9A825' ? '#0A0A0A' : '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: 999, fontWeight: 800, fontSize: '0.92rem', fontFamily: 'var(--font-sora)', boxShadow: `0 12px 32px ${s.accent}50`, letterSpacing: 0.3, display: 'inline-block', transition: 'transform 0.2s' }}>
              {s.cta} →
            </Link>
            <Link href="/catalogue" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-dm)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2, transition: 'color 0.2s' }}>
              Voir tout le catalogue
            </Link>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: 52 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => { clearInterval(intervalRef.current); setSlide(i); }} style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 999, background: i === slide ? s.accent : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
            ))}
          </div>
        </div>

        {/* Image droite */}
        <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px, 6vw, 60px) clamp(16px, 5vw, 80px)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
          <Image key={`img-${slide}`} src={s.img} alt="" width={520} height={520} sizes="(max-width: 900px) 90vw, 520px" style={{ width: '100%', maxWidth: 520, height: 520, objectFit: 'cover', borderRadius: 32, boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)`, animation: 'scaleIn 0.6s ease', position: 'relative', zIndex: 1 }} />
        </div>

        {/* Stats bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px clamp(16px, 5vw, 80px)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { num: '2 000+', label: 'Produits', icon: '🛍️' },
            { num: '50k+',   label: 'Clients',  icon: '👥' },
            { num: '24–48h', label: 'Livraison', icon: '🚚' },
            { num: '4.9 ★',  label: 'Note',     icon: '⭐' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.4rem' }}>{stat.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.3rem', color: s.accent }}>{stat.num}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, fontWeight: 600 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CATÉGORIES ═══ */}
      <section style={{ padding: '80px clamp(20px, 5vw, 80px)', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#BBB', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-sora)' }}>EXPLORER</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#0A0A0A', letterSpacing: -1 }}>Nos catégories</h2>
          </div>
          <Link href="/catalogue" style={{ color: '#1B5E20', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>Voir tout →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/catalogue?cat=${cat.id}`} className="card-hover img-zoom" style={{ textDecoration: 'none', borderRadius: 20, overflow: 'hidden', position: 'relative', aspectRatio: '3/4', display: 'block', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Image src={cat.img} alt={cat.label} fill sizes="(max-width: 900px) 50vw, 16vw" style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{cat.emoji}</div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>{cat.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ FLASH SALE ═══ */}
      <section style={{ background: '#0A0A0A', padding: '56px clamp(20px, 5vw, 80px)', margin: '0 0 80px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#C62828', fontWeight: 800, letterSpacing: 2, marginBottom: 8, fontFamily: 'var(--font-sora)' }}>⚡ OFFRE LIMITÉE</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#fff', letterSpacing: -1, marginBottom: 8 }}>Flash Sale</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', fontFamily: 'var(--font-dm)' }}>Jusqu&apos;à -40% sur une sélection de produits</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {[{ val: pad(seconds.h), label: 'H' }, { val: pad(seconds.m), label: 'MIN' }, { val: pad(seconds.s), label: 'SEC' }].map(({ val, label }, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 14, padding: '14px 18px', fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.8rem', color: '#F9A825', minWidth: 64, letterSpacing: -1 }}>{val}</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 2, marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>
          <Link href="/catalogue" className="btn-press" style={{ background: '#C62828', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 999, fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-sora)', letterSpacing: 0.3, boxShadow: '0 8px 24px rgba(198,40,40,0.4)' }}>
            Voir les offres →
          </Link>
        </div>
      </section>

      {/* ═══ PRODUITS POPULAIRES ═══ */}
      <section style={{ padding: '0 clamp(20px, 5vw, 80px) 80px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#BBB', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-sora)' }}>TENDANCES</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#0A0A0A', letterSpacing: -1 }}>Les plus populaires</h2>
          </div>
          <Link href="/catalogue" style={{ color: '#1B5E20', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>Voir tout →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {loading ? [1,2,3,4].map(i => <SkeletonCard key={i} />) : products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* ═══ DOUBLE BANNER ═══ */}
      <section style={{ padding: '0 clamp(20px, 5vw, 80px) 80px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { title: 'Mode & Style', sub: 'Nouvelle collection printemps', href: '/catalogue?cat=vetements', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', color: '#1B5E20' },
            { title: 'Montres & Bijoux', sub: 'Éditions limitées', href: '/catalogue?cat=montres', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80', color: '#C62828' },
          ].map((b, i) => (
            <Link key={i} href={b.href} className="card-hover img-zoom" style={{ textDecoration: 'none', borderRadius: 24, overflow: 'hidden', position: 'relative', height: 280, display: 'block', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <Image src={b.img} alt={b.title} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${b.color}CC 0%, transparent 60%)` }} />
              <div style={{ position: 'absolute', bottom: 28, left: 28 }}>
                <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.5rem', color: '#fff', letterSpacing: -0.5, marginBottom: 6 }}>{b.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', marginBottom: 14 }}>{b.sub}</div>
                <div style={{ background: 'rgba(255,255,255,0.95)', color: '#0A0A0A', padding: '8px 18px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 800, display: 'inline-block', fontFamily: 'var(--font-sora)' }}>
                  Découvrir →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: '#0A0A0A', padding: '64px clamp(20px, 5vw, 80px) 32px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 56, marginBottom: 56, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Image src="/logo.png" alt="BéninXi" width={120} height={40} style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
                <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>
                  <span style={{ color: '#2A9455' }}>BÉNIN</span><span style={{ color: '#C62828' }}>XI</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', lineHeight: 1.8, maxWidth: 280 }}>Le premier marché digital du Bénin. Achetez vêtements, meubles, montres et bijoux artisanaux.</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                {['📱 MTN Money', '📱 Moov Money', '💵 Espèces'].map(p => (
                  <span key={p} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', padding: '5px 12px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }}>{p}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Boutique', links: ['Vêtements', 'Chaussures', 'Meubles', 'Montres', 'Colliers', 'Chaînes'] },
              { title: 'Service', links: ['Mon compte', 'Mes commandes', 'Livraison', 'Retours'] },
              { title: 'À propos', links: ['Notre histoire', 'Vendeurs', 'Blog', 'Contact'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(l => (
                    <Link key={l} href="/catalogue" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.85rem', fontFamily: 'var(--font-dm)', transition: 'color 0.2s' }}>{l}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', fontFamily: 'var(--font-dm)' }}>© 2026 BéninXi. Tous droits réservés. 🇧🇯</div>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>Made with ❤️ in Bénin</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
