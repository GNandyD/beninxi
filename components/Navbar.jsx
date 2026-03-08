'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const categories = [
  { label: 'Vêtements',  href: '/catalogue?cat=vetements',  emoji: '👗' },
  { label: 'Chaussures', href: '/catalogue?cat=chaussures', emoji: '👟' },
  { label: 'Meubles',    href: '/catalogue?cat=meubles',    emoji: '🛋️' },
  { label: 'Montres',    href: '/catalogue?cat=montres',    emoji: '⌚' },
  { label: 'Colliers',   href: '/catalogue?cat=colliers',   emoji: '📿' },
  { label: 'Chaînes',    href: '/catalogue?cat=chaines',    emoji: '⛓️' },
];

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, fontFamily: 'var(--font-dm)' }}>

      {/* Top stripe */}
      <div style={{ background: '#1B5E20', color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: '9px 16px', fontSize: '0.78rem', fontWeight: 600, letterSpacing: 0.3 }}>
        🚚 Livraison gratuite dès 50 000 FCFA à Cotonou &nbsp;·&nbsp; 📱 MTN Money & Moov Money &nbsp;·&nbsp; 🎁 <strong>-10%</strong> sur votre 1ère commande : <strong>BENINXI10</strong>
      </div>

      {/* Main bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EFEFEF', padding: '0 40px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 28, height: 72 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: '1.75rem', lineHeight: 1, letterSpacing: -1 }}>
              <span style={{ color: '#1B5E20' }}>BÉNIN</span><span style={{ color: '#C62828' }}>XI</span>
            </div>
            <div style={{ fontSize: '0.55rem', letterSpacing: 3, color: '#AAA', textAlign: 'center', marginTop: 1, fontWeight: 700 }}>LE MARCHÉ DU BÉNIN</div>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: `2px solid ${focused ? '#1B5E20' : '#EFEFEF'}`, borderRadius: 14, overflow: 'hidden', background: focused ? '#fff' : '#FAFAFA', transition: 'all 0.2s', boxShadow: focused ? '0 0 0 4px rgba(27,94,32,0.08)' : 'none' }}>
            <span style={{ padding: '0 12px 0 16px', color: '#999' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Rechercher vêtements, meubles, montres..."
              style={{ flex: 1, border: 'none', background: 'none', padding: '14px 0', fontSize: '0.92rem', outline: 'none', fontFamily: 'var(--font-dm)', color: '#0A0A0A' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#AAA' }}>✕</button>
            )}
            <Link href={`/catalogue${search ? `?q=${search}` : ''}`} style={{ background: '#C62828', color: '#fff', padding: '0 24px', height: 52, fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', textDecoration: 'none', fontFamily: 'var(--font-sora)', letterSpacing: 0.3, flexShrink: 0 }}>
              Rechercher
            </Link>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
            <Link href="/connexion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 14px', borderRadius: 12, textDecoration: 'none', color: '#0A0A0A' }}>
              <span style={{ fontSize: '1.25rem' }}>👤</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#888' }}>Compte</span>
            </Link>
            <Link href="/catalogue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 14px', borderRadius: 12, textDecoration: 'none', color: '#0A0A0A' }}>
              <span style={{ fontSize: '1.25rem' }}>❤️</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#888' }}>Favoris</span>
            </Link>
            <button onClick={() => setIsOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 14px', borderRadius: 12, background: totalItems > 0 ? '#FFF8E1' : 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <span style={{ fontSize: '1.25rem' }}>🛒</span>
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 8, background: '#C62828', color: '#fff', fontSize: '0.6rem', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '2px solid #fff' }}>
                  {totalItems}
                </span>
              )}
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#C62828' }}>Panier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav style={{ background: '#0A0A0A', borderBottom: '3px solid #F9A825' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 40px', display: 'flex', overflowX: 'auto' }}>
          <Link href="/catalogue" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '13px 20px', fontSize: '0.84rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-sora)', borderBottom: '3px solid transparent', marginBottom: -3, transition: 'all 0.2s' }}>
            Tout voir
          </Link>
          {categories.map(cat => (
            <Link key={cat.href} href={cat.href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '13px 20px', fontSize: '0.84rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-sora)', borderBottom: '3px solid transparent', marginBottom: -3, transition: 'all 0.2s' }}>
              {cat.emoji} {cat.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
