'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

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
  const { user, signOut }         = useAuth();
  const { favorites }             = useFavorites();
  const [search, setSearch]       = useState('');
  const [focused, setFocused]     = useState(false);
  const [showMenu, setShowMenu]   = useState(false);

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
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.75rem', lineHeight: 1, letterSpacing: -1 }}>
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

            {/* Favoris */}
<Link href="/favoris" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 14px', borderRadius: 12, textDecoration: 'none', color: '#0A0A0A', position: 'relative' }}>
  <span style={{ fontSize: '1.25rem' }}>❤️</span>
  {favorites.length > 0 && (
    <span style={{ position: 'absolute', top: 4, right: 8, background: '#C62828', color: '#fff', fontSize: '0.6rem', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '2px solid #fff' }}>
      {favorites.length}
    </span>
  )}
  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#888' }}>Favoris</span>
</Link>

            {/* Compte — connecté ou non */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMenu(!showMenu)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 14px', borderRadius: 12, background: showMenu ? '#F0FAF0' : 'none', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: '1.25rem' }}>👤</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1B5E20' }}>
                    {user.user_metadata?.prenom || 'Mon compte'}
                  </span>
                </button>
                {showMenu && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '8px', minWidth: 200, zIndex: 200, marginTop: 8 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F5', marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>
                        {user.user_metadata?.prenom} {user.user_metadata?.nom}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#AAA', marginTop: 2 }}>{user.email}</div>
                    </div>
                    {[
                      { label: '📦 Mes commandes',  href: '/compte' },
                      { label: '❤️ Mes favoris',    href: '/catalogue' },
                      { label: '📍 Mes adresses',   href: '/compte' },
                      { label: '⚙️ Mon profil',     href: '/compte' },
                    ].map(item => (
                      <Link key={item.label} href={item.href} onClick={() => setShowMenu(false)} style={{ display: 'block', padding: '10px 16px', borderRadius: 10, color: '#0A0A0A', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, transition: 'background 0.15s' }}>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid #F5F5F5', marginTop: 4, paddingTop: 4 }}>
                      <button onClick={() => { signOut(); setShowMenu(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', borderRadius: 10, color: '#C62828', background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-dm)' }}>
                        🚪 Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/connexion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 14px', borderRadius: 12, textDecoration: 'none', color: '#0A0A0A' }}>
                <span style={{ fontSize: '1.25rem' }}>👤</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#888' }}>Compte</span>
              </Link>
            )}

            {/* Panier */}
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

      {/* Overlay menu */}
      {showMenu && <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
    </header>
  );
}
