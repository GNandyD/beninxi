'use client';
import { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile]   = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, fontFamily: 'var(--font-dm)' }}>

      {/* Main bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EFEFEF', padding: isMobile ? '0 16px' : '0 40px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 28, height: isMobile ? 60 : 72 }}>

          {/* Logo */}
        {/* Logo */}
<Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
  <img src="/logo.png" alt="BéninXi" style={{ height: isMobile ? 36 : 44, width: 'auto', objectFit: 'contain' }} />
  {!isMobile && (
    <div>
      <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1, letterSpacing: -0.5 }}>
        <span style={{ color: '#1B5E20' }}>BÉNIN</span><span style={{ color: '#C62828' }}>XI</span>
      </div>
      <div style={{ fontSize: '0.5rem', letterSpacing: 2, color: '#AAA', marginTop: 1, fontWeight: 700 }}>LE MARCHÉ DU BÉNIN</div>
    </div>
  )}
</Link>
          {/* Search — caché sur mobile */}
          {!isMobile && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: `2px solid ${focused ? '#1B5E20' : '#EFEFEF'}`, borderRadius: 14, overflow: 'hidden', background: focused ? '#fff' : '#FAFAFA', transition: 'all 0.2s' }}>
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
              {search && <button onClick={() => setSearch('')} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#AAA' }}>✕</button>}
              <Link href={`/catalogue${search ? `?q=${search}` : ''}`} style={{ background: '#C62828', color: '#fff', padding: '0 24px', height: 52, fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', textDecoration: 'none', fontFamily: 'var(--font-sora)', flexShrink: 0 }}>
                Rechercher
              </Link>
            </div>
          )}

          {/* Spacer sur mobile */}
          {isMobile && <div style={{ flex: 1 }} />}

          {/* Actions */}
          <div style={{ display: 'flex', gap: isMobile ? 0 : 4, alignItems: 'center', flexShrink: 0 }}>

            {/* Recherche mobile */}
            {isMobile && (
              <Link href="/catalogue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px 10px', textDecoration: 'none', color: '#0A0A0A' }}>
                <span style={{ fontSize: '1.2rem' }}>🔍</span>
                <span style={{ fontSize: '0.55rem', fontWeight: 600, color: '#888' }}>Chercher</span>
              </Link>
            )}

            {/* Favoris */}
            <Link href="/favoris" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: isMobile ? '8px 10px' : '8px 14px', borderRadius: 12, textDecoration: 'none', color: '#0A0A0A', position: 'relative' }}>
              <span style={{ fontSize: isMobile ? '1.2rem' : '1.25rem' }}>❤️</span>
              {favorites.length > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 6, background: '#C62828', color: '#fff', fontSize: '0.55rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '2px solid #fff' }}>
                  {favorites.length}
                </span>
              )}
              <span style={{ fontSize: '0.55rem', fontWeight: 600, color: '#888' }}>Favoris</span>
            </Link>

            {/* Compte */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMenu(!showMenu)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: isMobile ? '8px 10px' : '8px 14px', borderRadius: 12, background: showMenu ? '#F0FAF0' : 'none', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: isMobile ? '1.2rem' : '1.25rem' }}>👤</span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#1B5E20' }}>
                    {(user.user_metadata?.prenom || 'Compte').slice(0, 8)}
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
                      { label: '👤 Mon compte',      href: '/compte'    },
                      { label: '📦 Mes commandes',   href: '/compte'    },
                      { label: '❤️ Mes favoris',     href: '/favoris'   },
                    ].map(item => (
                      <Link key={item.label} href={item.href} onClick={() => setShowMenu(false)} style={{ display: 'block', padding: '10px 16px', borderRadius: 10, color: '#0A0A0A', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
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
              <Link href="/connexion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: isMobile ? '8px 10px' : '8px 14px', borderRadius: 12, textDecoration: 'none', color: '#0A0A0A' }}>
                <span style={{ fontSize: isMobile ? '1.2rem' : '1.25rem' }}>👤</span>
                <span style={{ fontSize: '0.55rem', fontWeight: 600, color: '#888' }}>Compte</span>
              </Link>
            )}

            {/* Panier */}
            <button onClick={() => setIsOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: isMobile ? '8px 10px' : '8px 14px', borderRadius: 12, background: totalItems > 0 ? '#FFF8E1' : 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <span style={{ fontSize: isMobile ? '1.2rem' : '1.25rem' }}>🛒</span>
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 6, background: '#C62828', color: '#fff', fontSize: '0.55rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '2px solid #fff' }}>
                  {totalItems}
                </span>
              )}
              <span style={{ fontSize: '0.55rem', fontWeight: 700, color: '#C62828' }}>Panier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav style={{ background: '#0A0A0A', borderBottom: '3px solid #F9A825', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 8px' : '0 40px', display: 'flex' }}>
          <Link href="/catalogue" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: isMobile ? '11px 12px' : '13px 20px', fontSize: isMobile ? '0.75rem' : '0.84rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-sora)', borderBottom: '3px solid transparent', marginBottom: -3 }}>
            Tout
          </Link>
          {categories.map(cat => (
            <Link key={cat.href} href={cat.href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: isMobile ? '11px 12px' : '13px 20px', fontSize: isMobile ? '0.75rem' : '0.84rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-sora)', borderBottom: '3px solid transparent', marginBottom: -3 }}>
              {isMobile ? cat.emoji : `${cat.emoji} ${cat.label}`}
            </Link>
          ))}
        </div>
      </nav>

      {showMenu && <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
    </header>
  );
}
