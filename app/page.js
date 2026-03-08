'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

const heroSlides = [
  {
    tag: '🔥 VENTE FLASH — 48H SEULEMENT',
    title: 'La Mode\nAfricaine\nRedéfinie.',
    sub: 'Robes wax, boubous premium et tenues modernes jusqu\'à -50%',
    cta: 'Découvrir la collection',
    href: '/catalogue?cat=vetements',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #1B5E20 60%, #2E7D32 100%)',
    img: 'https://images.unsplash.com/photo-1558171813-1a5ee65fa0a2?w=700&q=80',
  },
  {
    tag: '✨ NOUVELLE COLLECTION',
    title: 'Montres &\nBijoux\nde Luxe.',
    sub: 'Colliers, chaînes et montres premium. Livraison sécurisée.',
    cta: 'Voir les bijoux',
    href: '/catalogue?cat=montres',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #7B1818 60%, #C62828 100%)',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80',
  },
  {
    tag: '🛋️ DÉCO & MAISON',
    title: 'Votre\nIntérieur\nSublimé.',
    sub: 'Meubles artisanaux béninois. Livraison et montage inclus.',
    cta: 'Explorer les meubles',
    href: '/catalogue?cat=meubles',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #3E2723 60%, #5D4037 100%)',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80',
  },
];

const categories = [
  { label: 'Vêtements',  href: '/catalogue?cat=vetements',  emoji: '👗', img: 'https://images.unsplash.com/photo-1558171813-1a5ee65fa0a2?w=400&q=80',    color: '#1B5E20' },
  { label: 'Chaussures', href: '/catalogue?cat=chaussures', emoji: '👟', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',    color: '#C62828' },
  { label: 'Meubles',    href: '/catalogue?cat=meubles',    emoji: '🛋️', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',   color: '#3E2723' },
  { label: 'Montres',    href: '/catalogue?cat=montres',    emoji: '⌚', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',  color: '#0A0A0A' },
  { label: 'Colliers',   href: '/catalogue?cat=colliers',   emoji: '📿', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', color: '#F9A825' },
  { label: 'Chaînes',    href: '/catalogue?cat=chaines',    emoji: '⛓️', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80', color: '#1565C0' },
];

function ProductCard({ p }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const discount = p.old_price ? Math.round((1 - p.price / p.old_price) * 100) : 0;

  function handleAdd(e) {
    e.preventDefault();
    addItem({ id: p.id, name: p.name, price: p.price, img: p.img, color: 'Standard', size: 'Standard', qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link href={`/produit/${p.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0', transition: 'all 0.3s', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div style={{ position: 'relative', height: 260, overflow: 'hidden', background: '#F8F8F8' }}>
        <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }} />
        {p.badge && (
          <div style={{ position: 'absolute', top: 14, left: 14, background: p.badge === 'Luxe' || p.badge === 'Premium' ? '#0A0A0A' : '#1B5E20', color: '#fff', padding: '5px 12px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 800, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>
            {p.badge}
          </div>
        )}
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 14, right: 52, background: '#C62828', color: '#fff', padding: '5px 10px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 800 }}>
            -{discount}%
          </div>
        )}
        <button onClick={e => { e.preventDefault(); setLiked(!liked); }} style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {liked ? '❤️' : '🤍'}
        </button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', justifyContent: 'center' }} className="card-overlay">
          <button onClick={handleAdd} style={{ background: added ? '#1B5E20' : '#fff', color: added ? '#fff' : '#0A0A0A', border: 'none', padding: '10px 24px', borderRadius: 50, fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', width: '100%' }}>
            {added ? '✓ Ajouté !' : '+ Ajouter au panier'}
          </button>
        </div>
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>{p.seller}</div>
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0A0A0A', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.floor(p.rating) ? '#F9A825' : '#E8E8E8', fontSize: '0.78rem' }}>★</span>)}
          <span style={{ fontSize: '0.72rem', color: '#666', marginLeft: 2 }}>({p.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: '1.05rem', color: '#1B5E20' }}>{fmt(p.price)}</div>
            {p.old_price && <div style={{ fontSize: '0.75rem', color: '#BBB', textDecoration: 'line-through' }}>{fmt(p.old_price)}</div>}
          </div>
          <button onClick={handleAdd} style={{ width: 36, height: 36, borderRadius: '50%', background: added ? '#1B5E20' : '#F5F5F5', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [flash, setFlash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 59, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide(s => (s + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t.s > 0) return { ...t, s: t.s - 1 };
        if (t.m > 0) return { ...t, m: t.m - 1, s: 59 };
        if (t.h > 0) return { h: t.h - 1, m: 59, s: 59 };
        return { h: 5, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*').order('sold', { ascending: false }).limit(8);
      setProducts(data || []);
      const { data: f } = await supabase.from('products').select('*').not('old_price', 'is', null).limit(4);
      setFlash(f || []);
      setLoading(false);
    }
    load();
  }, []);

  const s = heroSlides[slide];

  return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />

      {/* HERO */}
      <section style={{ background: s.bg, minHeight: '88vh', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '0 40px', maxWidth: '100%', transition: 'background 0.8s', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 50%, rgba(249,168,37,0.08) 0%, transparent 60%)' }} />
        <div style={{ maxWidth: 640, position: 'relative', zIndex: 2, padding: '80px 0 80px 40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,168,37,0.15)', border: '1px solid rgba(249,168,37,0.3)', color: '#F9A825', padding: '8px 18px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, marginBottom: 28, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>
            {s.tag}
          </div>
          <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', color: '#fff', lineHeight: 1.05, marginBottom: 24, whiteSpace: 'pre-line', letterSpacing: -1.5 }}>
            {s.title}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', marginBottom: 36, lineHeight: 1.7, maxWidth: 440 }}>
            {s.sub}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href={s.href} style={{ background: '#F9A825', color: '#0A0A0A', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, fontWeight: 900, fontSize: '1rem', fontFamily: 'var(--font-sora)', boxShadow: '0 8px 28px rgba(249,168,37,0.4)', display: 'inline-block' }}>
              {s.cta} →
            </Link>
            <Link href="/catalogue" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.2)', display: 'inline-block' }}>
              Tout voir
            </Link>
          </div>
          {/* Slide dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: 40 }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 4, background: i === slide ? '#F9A825' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 40px 80px 0', position: 'relative', zIndex: 2 }}>
          <div style={{ width: 480, height: 520, borderRadius: 32, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', position: 'relative' }}>
            <img src={s.img} alt="hero" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.5s' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ background: '#0A0A0A', borderBottom: '3px solid #F9A825' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { icon: '🚚', title: 'Livraison rapide',    sub: 'Cotonou en 24–48h'      },
            { icon: '🔒', title: 'Paiement sécurisé',   sub: 'MTN Money & Moov Money' },
            { icon: '↩️', title: 'Retour 7 jours',      sub: 'Sans conditions'        },
            { icon: '💬', title: 'Support WhatsApp',    sub: 'Réponse en moins d\'1h' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{item.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '72px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C62828', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12, fontFamily: 'var(--font-sora)' }}>CATÉGORIES</div>
          <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#0A0A0A', letterSpacing: -0.5 }}>Explorez notre sélection</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
          {categories.map(cat => (
            <Link key={cat.href} href={cat.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0', transition: 'all 0.3s', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '100%', height: 140, overflow: 'hidden', position: 'relative' }}>
                <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${cat.color}CC, transparent)` }} />
                <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: '1.6rem' }}>{cat.emoji}</div>
              </div>
              <div style={{ padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.85rem', color: '#0A0A0A' }}>{cat.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH SALE */}
      {flash.length > 0 && (
        <section style={{ background: '#0A0A0A', padding: '72px 0' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F9A825', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-sora)' }}>⚡ VENTE FLASH</div>
                <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: '2rem', color: '#fff' }}>Offres du moment</h2>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginRight: 8 }}>Se termine dans</span>
                {[
                  { v: String(timeLeft.h).padStart(2,'0'), label: 'h' },
                  { v: String(timeLeft.m).padStart(2,'0'), label: 'm' },
                  { v: String(timeLeft.s).padStart(2,'0'), label: 's' },
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ background: '#C62828', color: '#fff', padding: '8px 14px', borderRadius: 10, fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: '1.1rem', minWidth: 48, textAlign: 'center' }}>{t.v}</div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>{i < 2 ? ':' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {flash.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* PRODUITS VEDETTES */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '72px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1B5E20', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-sora)' }}>SÉLECTION DU MOMENT</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', color: '#0A0A0A', letterSpacing: -0.5 }}>Produits populaires</h2>
          </div>
          <Link href="/catalogue" style={{ color: '#1B5E20', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', border: '2px solid #1B5E20', padding: '10px 22px', borderRadius: 50, fontFamily: 'var(--font-sora)', transition: 'all 0.2s' }}>
            Voir tout →
          </Link>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0' }}>
                <div style={{ height: 260, background: '#F5F5F5' }} />
                <div style={{ padding: 18 }}>
                  <div style={{ height: 12, background: '#F5F5F5', borderRadius: 6, marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 16, background: '#F5F5F5', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 12, background: '#F5F5F5', borderRadius: 6, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {products.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </section>

      {/* BANNER PROMO */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '0 40px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Link href="/catalogue?cat=vetements" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', borderRadius: 24, padding: '48px', position: 'relative', overflow: 'hidden', display: 'block' }}>
            <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: '9rem', opacity: 0.12 }}>👗</div>
            <div style={{ background: 'rgba(249,168,37,0.2)', color: '#F9A825', padding: '5px 14px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800, display: 'inline-block', marginBottom: 16, fontFamily: 'var(--font-sora)', letterSpacing: 1 }}>NOUVELLE COLLECTION</div>
            <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: '1.8rem', color: '#fff', marginBottom: 10, lineHeight: 1.15 }}>Mode Africaine<br /><span style={{ color: '#F9A825' }}>Printemps 2026</span></h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', marginBottom: 24 }}>Robes wax, boubous et tenues modernes</p>
            <span style={{ background: '#fff', color: '#1B5E20', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-sora)' }}>Découvrir →</span>
          </Link>
          <Link href="/catalogue?cat=montres" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #0A0A0A, #1A1A2E)', borderRadius: 24, padding: '48px', position: 'relative', overflow: 'hidden', display: 'block' }}>
            <div style={{ position: 'absolute', right: -20, bottom: -20, fontSize: '9rem', opacity: 0.12 }}>⌚</div>
            <div style={{ background: 'rgba(249,168,37,0.2)', color: '#F9A825', padding: '5px 14px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800, display: 'inline-block', marginBottom: 16, fontFamily: 'var(--font-sora)', letterSpacing: 1 }}>JUSQU'À -40%</div>
            <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: '1.8rem', color: '#fff', marginBottom: 10, lineHeight: 1.15 }}>Montres & Bijoux<br /><span style={{ color: '#F9A825' }}>de Luxe</span></h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', marginBottom: 24 }}>Colliers, chaînes et montres premium</p>
            <span style={{ background: '#F9A825', color: '#0A0A0A', padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-sora)' }}>Voir les offres →</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0A0A0A', color: 'rgba(255,255,255,0.5)', padding: '64px 40px 32px', fontFamily: 'var(--font-dm)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: '1.8rem', marginBottom: 16 }}>
                <span style={{ color: '#4CAF50' }}>BÉNIN</span><span style={{ color: '#F9A825' }}>XI</span>
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.8, maxWidth: 280, marginBottom: 24, color: 'rgba(255,255,255,0.4)' }}>
                La marketplace premium du Bénin. Achetez en toute confiance avec livraison rapide à Cotonou.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ l: '📱 MTN Money', bg: '#FFD700', c: '#0A0A0A' }, { l: '📱 Moov Money', bg: '#0066CC', c: '#fff' }, { l: '💵 Espèces', bg: '#2A2A2A', c: '#fff' }].map(p => (
                  <span key={p.l} style={{ background: p.bg, color: p.c, padding: '5px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700 }}>{p.l}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Boutique', links: [['Vêtements', '/catalogue?cat=vetements'], ['Chaussures', '/catalogue?cat=chaussures'], ['Meubles', '/catalogue?cat=meubles'], ['Montres', '/catalogue?cat=montres'], ['Colliers & Chaînes', '/catalogue?cat=colliers']] },
              { title: 'Mon compte', links: [['Se connecter', '/connexion'], ['Mes commandes', '/connexion'], ['Mes favoris', '/connexion'], ['Mes adresses', '/connexion']] },
              { title: 'Aide', links: [['Livraison', '/catalogue'], ['Retours', '/catalogue'], ['FAQ', '/catalogue'], ['Contact', '/connexion'], ['Suivi commande', '/connexion']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800, marginBottom: 20, fontFamily: 'var(--font-sora)', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: '0.8rem' }}>© 2026 BéninXi — 🇧🇯 Fièrement Made in Bénin</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['📘 Facebook', '📸 Instagram', '💬 WhatsApp'].map(s => (
                <span key={s} style={{ background: 'rgba(255,255,255,0.06)', padding: '7px 16px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
