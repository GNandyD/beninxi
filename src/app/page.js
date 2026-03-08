'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

const heroSlides = [
  {
    tag: 'NOUVELLE COLLECTION 2026',
    title: 'La Mode\nAfricaine\nRedéfinie.',
    sub: 'Robes wax, boubous premium et tenues modernes. Livraison rapide à Cotonou.',
    cta: 'Découvrir',
    href: '/catalogue?cat=vetements',
    bg: '#0A0A0A',
    accent: '#F9A825',
    img: 'https://images.unsplash.com/photo-1558171813-1a5ee65fa0a2?w=800&q=90',
  },
  {
    tag: 'COLLECTION LUXE',
    title: 'Montres &\nBijoux\nPremium.',
    sub: 'Colliers, chaînes et montres de prestige. Authenticité garantie.',
    cta: 'Explorer',
    href: '/catalogue?cat=montres',
    bg: '#0D1B2A',
    accent: '#C62828',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90',
  },
  {
    tag: 'ART DE VIVRE',
    title: 'Votre\nIntérieur\nSublimé.',
    sub: 'Meubles artisanaux béninois. Livraison et montage inclus à Cotonou.',
    cta: 'Voir les meubles',
    href: '/catalogue?cat=meubles',
    bg: '#1A0A00',
    accent: '#1B5E20',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=90',
  },
];

const categories = [
  { label: 'Vêtements',  href: '/catalogue?cat=vetements',  emoji: '👗', img: 'https://images.unsplash.com/photo-1558171813-1a5ee65fa0a2?w=600&q=80'    },
  { label: 'Chaussures', href: '/catalogue?cat=chaussures', emoji: '👟', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'    },
  { label: 'Meubles',    href: '/catalogue?cat=meubles',    emoji: '🛋️', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'   },
  { label: 'Montres',    href: '/catalogue?cat=montres',    emoji: '⌚', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'  },
  { label: 'Colliers',   href: '/catalogue?cat=colliers',   emoji: '📿', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80' },
  { label: 'Chaînes',    href: '/catalogue?cat=chaines',    emoji: '⛓️', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
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
    <Link href={`/produit/${p.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ position: 'relative', height: 280, overflow: 'hidden', background: '#F8F8F8' }}>
        <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
        {p.badge && (
          <div style={{ position: 'absolute', top: 14, left: 14, background: ['Luxe','Premium'].includes(p.badge) ? '#0A0A0A' : '#1B5E20', color: '#fff', padding: '5px 13px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800, fontFamily: 'var(--font-sora)', letterSpacing: 0.8 }}>
            {p.badge}
          </div>
        )}
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 14, right: 50, background: '#C62828', color: '#fff', padding: '5px 10px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800 }}>
            -{discount}%
          </div>
        )}
        <button onClick={e => { e.preventDefault(); setLiked(!liked); }} style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%', background: liked ? '#FFF0F0' : 'rgba(255,255,255,0.95)', border: liked ? '1.5px solid #C62828' : 'none', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}>
          {liked ? '❤️' : '🤍'}
        </button>
        <button onClick={handleAdd} style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: added ? '#1B5E20' : '#fff', color: added ? '#fff' : '#0A0A0A', border: 'none', padding: '10px 28px', borderRadius: 50, fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {added ? '✓ Ajouté !' : '+ Ajouter au panier'}
        </button>
      </div>
      <div style={{ padding: '16px 18px 20px' }}>
        <div style={{ fontSize: '0.63rem', color: '#AAA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 5, fontFamily: 'var(--font-sora)' }}>{p.seller}</div>
        <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0A0A0A', marginBottom: 10, lineHeight: 1.35, fontFamily: 'var(--font-dm)' }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 12 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.floor(p.rating) ? '#F9A825' : '#E8E8E8', fontSize: '0.75rem' }}>★</span>)}
          <span style={{ fontSize: '0.7rem', color: '#999', marginLeft: 4, fontFamily: 'var(--font-dm)' }}>({p.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F5F5F5', paddingTop: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.05rem', color: '#1B5E20' }}>{fmt(p.price)}</div>
            {p.old_price && <div style={{ fontSize: '0.72rem', color: '#CCC', textDecoration: 'line-through', marginTop: 1 }}>{fmt(p.old_price)}</div>}
          </div>
          {p.old_price && (
            <div style={{ background: '#FFF8E1', color: '#E65100', padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800 }}>
              Économisez {fmt(p.old_price - p.price)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #F0F0F0', background: '#fff' }}>
      <div style={{ height: 280, background: 'linear-gradient(90deg, #F5F5F5 25%, #EFEFEF 50%, #F5F5F5 75%)', backgroundSize: '200% 100%' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ height: 10, background: '#F5F5F5', borderRadius: 5, width: '40%', marginBottom: 10 }} />
        <div style={{ height: 14, background: '#F5F5F5', borderRadius: 5, marginBottom: 8 }} />
        <div style={{ height: 10, background: '#F5F5F5', borderRadius: 5, width: '30%' }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [flash, setFlash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 59, s: 59 });
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setImgLoaded(false);
    const t = setTimeout(() => setImgLoaded(true), 100);
    return () => clearTimeout(t);
  }, [slide]);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 5, m: 59, s: 59 };
      });
    }, 1000);
    return () => clearInterval(t);
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

      {/* ═══════════ HERO ═══════════ */}
      <section style={{ background: s.bg, minHeight: '92vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative', overflow: 'hidden', transition: 'background 1s' }}>

        {/* Fond décoratif */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 80% 50%, ${s.accent}18 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -100, left: -100, width: 600, height: 600, borderRadius: '50%', background: `${s.accent}06`, pointerEvents: 'none' }} />

        {/* Texte */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '100px 64px 100px 80px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${s.accent}18`, border: `1px solid ${s.accent}40`, color: s.accent, padding: '8px 18px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800, marginBottom: 32, fontFamily: 'var(--font-sora)', letterSpacing: 2, width: 'fit-content' }}>
            ✦ {s.tag}
          </div>
          <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(3rem, 5.5vw, 5rem)', color: '#fff', lineHeight: 1.02, marginBottom: 28, whiteSpace: 'pre-line', letterSpacing: -2 }}>
            {s.title}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', marginBottom: 44, lineHeight: 1.75, maxWidth: 420, fontFamily: 'var(--font-dm)' }}>
            {s.sub}
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link href={s.href} style={{ background: s.accent, color: s.accent === '#F9A825' ? '#0A0A0A' : '#fff', textDecoration: 'none', padding: '16px 40px', borderRadius: 50, fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-sora)', boxShadow: `0 12px 32px ${s.accent}50`, letterSpacing: 0.3, display: 'inline-block', transition: 'transform 0.2s' }}>
              {s.cta} →
            </Link>
            <Link href="/catalogue" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-dm)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2 }}>
              Voir tout le catalogue
            </Link>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 10, marginTop: 52, alignItems: 'center' }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 32 : 8, height: 8, borderRadius: 4, background: i === slide ? s.accent : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.4s', padding: 0 }} />
            ))}
          </div>
        </div>

        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 80px 60px 40px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 520, aspectRatio: '4/5', borderRadius: 32, overflow: 'hidden', boxShadow: `0 60px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)` }}>
            <img
              src={s.img}
              alt="hero"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.6s', transform: 'scale(1.02)' }}
              onLoad={() => setImgLoaded(true)}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
            {/* Badge flottant */}
            <div style={{ position: 'absolute', bottom: 24, left: 24, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '14px 20px', color: '#fff' }}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', marginBottom: 3, fontFamily: 'var(--font-sora)', letterSpacing: 1 }}>LIVRAISON</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-sora)' }}>Gratuite dès 50 000 FCFA</div>
            </div>
          </div>
        </div>

        {/* Stats en bas */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 80px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { num: '2 000+', label: 'Produits' },
            { num: '50 000+', label: 'Clients satisfaits' },
            { num: '24–48h', label: 'Livraison Cotonou' },
            { num: '4.9 ★', label: 'Note moyenne' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.3rem', color: s.accent }}>{stat.num}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 3, fontFamily: 'var(--font-dm)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CATÉGORIES ═══════════ */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '88px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C62828', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-sora)' }}>PARCOURIR</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: '#0A0A0A', letterSpacing: -1 }}>Nos catégories</h2>
          </div>
          <Link href="/catalogue" style={{ color: '#666', fontSize: '0.88rem', textDecoration: 'none', fontFamily: 'var(--font-dm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            Tout voir <span style={{ fontSize: '1.1rem' }}>→</span>
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {categories.map((cat, i) => (
            <Link key={i} href={cat.href} style={{ textDecoration: 'none', display: 'block', borderRadius: 20, overflow: 'hidden', position: 'relative', aspectRatio: '3/4', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', transition: 'transform 0.3s' }}>
              <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{cat.emoji}</div>
                <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.92rem', color: '#fff', lineHeight: 1.2 }}>{cat.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ FLASH SALE ═══════════ */}
      {flash.length > 0 && (
        <section style={{ background: '#0A0A0A', padding: '88px 0' }}>
          <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C6282818', border: '1px solid #C6282840', color: '#C62828', padding: '6px 16px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 800, marginBottom: 14, fontFamily: 'var(--font-sora)', letterSpacing: 1.5 }}>
                  ⚡ VENTE FLASH
                </div>
                <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '2.2rem', color: '#fff', letterSpacing: -0.5 }}>Offres du moment</h2>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontFamily: 'var(--font-dm)', marginRight: 4 }}>Se termine dans</span>
                {[String(timeLeft.h).padStart(2,'0'), String(timeLeft.m).padStart(2,'0'), String(timeLeft.s).padStart(2,'0')].map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ background: '#1A1A1A', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: 10, fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.1rem', minWidth: 50, textAlign: 'center' }}>{v}</div>
                    {i < 2 && <span style={{ color: '#555', fontSize: '1.1rem', fontWeight: 800 }}>:</span>}
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

      {/* ═══════════ PRODUITS POPULAIRES ═══════════ */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '88px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1B5E20', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10, fontFamily: 'var(--font-sora)' }}>TENDANCES</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: '#0A0A0A', letterSpacing: -1 }}>Les plus populaires</h2>
          </div>
          <Link href="/catalogue" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-sora)', display: 'inline-block' }}>
            Voir tout →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {loading ? [1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />) : products.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* ═══════════ DOUBLE BANNER ═══════════ */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '0 40px 88px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Link href="/catalogue?cat=vetements" style={{ textDecoration: 'none', borderRadius: 28, overflow: 'hidden', position: 'relative', height: 360, display: 'block' }}>
            <img src="https://images.unsplash.com/photo-1558171813-1a5ee65fa0a2?w=800&q=80" alt="Mode" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(27,94,32,0.92) 0%, rgba(27,94,32,0.4) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, padding: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ background: 'rgba(249,168,37,0.2)', color: '#F9A825', padding: '5px 14px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800, display: 'inline-block', marginBottom: 14, fontFamily: 'var(--font-sora)', letterSpacing: 1.5, width: 'fit-content' }}>NOUVELLE COLLECTION</div>
              <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '2rem', color: '#fff', marginBottom: 8, letterSpacing: -0.5, lineHeight: 1.1 }}>Mode Africaine<br /><span style={{ color: '#F9A825' }}>Printemps 2026</span></h3>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontFamily: 'var(--font-dm)', marginBottom: 24 }}>Robes wax, boubous et tenues modernes</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#1B5E20', padding: '12px 24px', borderRadius: 50, fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-sora)', width: 'fit-content' }}>
                Découvrir →
              </div>
            </div>
          </Link>
          <Link href="/catalogue?cat=montres" style={{ textDecoration: 'none', borderRadius: 28, overflow: 'hidden', position: 'relative', height: 360, display: 'block' }}>
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" alt="Montres" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, padding: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ background: 'rgba(249,168,37,0.2)', color: '#F9A825', padding: '5px 14px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 800, display: 'inline-block', marginBottom: 14, fontFamily: 'var(--font-sora)', letterSpacing: 1.5, width: 'fit-content' }}>JUSQU'À -40%</div>
              <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '2rem', color: '#fff', marginBottom: 8, letterSpacing: -0.5, lineHeight: 1.1 }}>Montres & Bijoux<br /><span style={{ color: '#F9A825' }}>de Luxe</span></h3>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontFamily: 'var(--font-dm)', marginBottom: 24 }}>Colliers, chaînes et montres premium</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F9A825', color: '#0A0A0A', padding: '12px 24px', borderRadius: 50, fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-sora)', width: 'fit-content' }}>
                Voir les offres →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ background: '#0A0A0A', padding: '72px 40px 36px', fontFamily: 'var(--font-dm)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 56, marginBottom: 56, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 18 }}>
                <span style={{ color: '#1B5E20' }}>BÉNIN</span><span style={{ color: '#F9A825' }}>XI</span>
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.85, maxWidth: 280, marginBottom: 28, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-dm)' }}>
                La marketplace premium du Bénin. Achetez en toute confiance avec livraison rapide à Cotonou.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ l: '📱 MTN Money', bg: '#FFD700', c: '#0A0A0A' }, { l: '📱 Moov Money', bg: '#0066CC', c: '#fff' }, { l: '💵 Espèces', bg: '#1A1A1A', c: 'rgba(255,255,255,0.6)' }].map(p => (
                  <span key={p.l} style={{ background: p.bg, color: p.c, padding: '6px 14px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700 }}>{p.l}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Boutique', links: [['Vêtements', '/catalogue?cat=vetements'], ['Chaussures', '/catalogue?cat=chaussures'], ['Meubles', '/catalogue?cat=meubles'], ['Montres', '/catalogue?cat=montres'], ['Colliers & Chaînes', '/catalogue?cat=colliers']] },
              { title: 'Mon compte', links: [['Se connecter', '/connexion'], ['Mes commandes', '/connexion'], ['Mes favoris', '/connexion'], ['Mes adresses', '/connexion']] },
              { title: 'Aide', links: [['Livraison', '/catalogue'], ['Retours', '/catalogue'], ['FAQ', '/catalogue'], ['Contact', '/connexion'], ['Suivi commande', '/connexion']] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 800, marginBottom: 22, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'var(--font-dm)' }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>© 2026 BéninXi — 🇧🇯 Fièrement Made in Bénin</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['📘', '📸', '💬'].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>{icon}</div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
