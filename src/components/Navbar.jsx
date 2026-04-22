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
  const [scrolled, setScrolled]   = useState(false);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768); }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      fontFamily: 'var(--font-dm)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>

      {/* Main bar */}
      <div style={{
        background: scrolled ? 'rgba(255,255,255,0.92)' : '#fff',
        borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.06)' : '#F0F0F0'}`,
        padding: isMobile ? '0 16px' : '0 48px',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 32, height: isMobile ? 58 : 68 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="BéninXi" style={{ height: isMobile ? 32 : 40, width: 'auto', objectFit: 'contain' }} />
            {!isMobile && (
              <div>
                <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.3rem', lineHeight: 1, letterSpacing: -0.5 }}>
                  <span style={{ color: '#1B5E20' }}>BÉNIN</span><span style={{ color: '#C62828' }}>XI</span>
                </div>
                <div style={{ fontSize: '0.48rem', letterSpacing: 2.5, color: '#BBB', marginTop: 2, fontWeight: 700 }}>LE MARCHÉ DU BÉNIN</div>
              </div>
            )}
          </Link>

          {/* Search — desktop */}
          {!isMobile && (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              border: `1.5px solid ${focused ? '#1B5E20' : '#EBEBEB'}`,
              borderRadius: 50, overflow: 'hidden',
              background: focused ? '#fff' : '#F8F8F8',
              transition: 'all 0.25s ease',
              boxShadow: focused ? '0 0 0 4px rgba(27,94,32,0.07)' : 'none',
            }}>
              <span style={{ padding: '0 12px 0 18px', color: '#999', fontSize: '0.85rem' }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Rechercher vêtements, meubles, montres..."
                style={{ flex: 1, border: 'none', background: 'none', padding: '13px 0', fontSize: '0.88rem', outline: 'none', fontFamily: 'var(--font-dm)', color: '#0A0A0A' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#CCC', fontSize: '0.9rem' }}>✕</button>}
              <Link href={`/catalogue${search ? `?q=${search}` : ''}`} style={{
                background: '#C62828', color: '#fff',
                padding: '0 24px', height: 46,
                fontWeight: 700, fontSize: '0.84rem',
                display: 'flex', alignItems: 'center',
                textDecoration: 'none',
                fontFamily: 'var(--font-sora)',
                flexShrink: 0,
                borderRadius: '0 50px 50px 0',
                letterSpacing: 0.3,
              }}>
                Rechercher
              </Link>
            </div>
          )}

          {/* Spacer mobile */}
          {isMobile && <div style={{ flex: 1 }} />}

          {/* Actions */}
          <div style={{ display: 'flex', gap: isMobile ? 0 : 2, alignItems: 'center', flexShrink: 0 }}>

            {/* Recherche mobile */}
            {isMobile && (
              <Link href="/catalogue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '8px 10px', textDecoration: 'none', color: '#0A0A0A' }}>
                <span style={{ fontSize: '1.15rem' }}>🔍</span>
                <span style={{ fontSize: '0.52rem', fontWeight: 600, color: '#999' }}>Chercher</span>
              </Link>
            )}

            {/* Favoris */}
            <Link href="/favoris" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: isMobile ? '8px 10px' : '8px 12px', borderRadius: 14, textDecoration: 'none', color: '#0A0A0A', position: 'relative', transition: 'background 0.2s' }}>
              <span style={{ fontSize: isMobile ? '1.15rem' : '1.2rem' }}>❤️</span>
              {favorites.length > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 6, background: '#C62828', color: '#fff', fontSize: '0.5rem', width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '1.5px solid #fff' }}>
                  {favorites.length}
                </span>
              )}
              <span style={{ fontSize: '0.52rem', fontWeight: 600, color: '#999' }}>Favoris</span>
            </Link>

            {/* Compte */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowMenu(!showMenu)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  padding: isMobile ? '8px 10px' : '8px 12px', borderRadius: 14,
                  background: showMenu ? '#F0FAF0' : 'none', border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                  <span style={{ fontSize: isMobile ? '1.15rem' : '1.2rem' }}>👤</span>
                  <span style={{ fontSize: '0.52rem', fontWeight: 700, color: '#1B5E20' }}>
                    {(user.user_metadata?.prenom || 'Compte').slice(0, 8)}
                  </span>
                </button>
                {showMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#fff', borderRadius: 20,
                    border: '1px solid #F0F0F0',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                    padding: '8px', minWidth: 220, zIndex: 200,
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F5', marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>
                        {user.user_metadata?.prenom} {user.user_metadata?.nom}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#BBB', marginTop: 2 }}>{user.email}</div>
                    </div>
                    {[
                      { label: '👤 Mon compte',    href: '/compte'  },
                      { label: '📦 Mes commandes', href: '/compte'  },
                      { label: '❤️ Mes favoris',   href: '/favoris' },
                    ].map(item => (
                      <Link key={item.label} href={item.href} onClick={() => setShowMenu(false)} style={{ display: 'block', padding: '10px 16px', borderRadius: 12, color: '#0A0A0A', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 500, transition: 'background 0.15s' }}>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: '1px solid #F5F5F5', marginTop: 4, paddingTop: 4 }}>
                      <button onClick={() => { signOut(); setShowMenu(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', borderRadius: 12, color: '#C62828', background: 'none', border: 'none', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-dm)' }}>
                        🚪 Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/connexion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: isMobile ? '8px 10px' : '8px 12px', borderRadius: 14, textDecoration: 'none', color: '#0A0A0A' }}>
                <span style={{ fontSize: isMobile ? '1.15rem' : '1.2rem' }}>👤</span>
                <span style={{ fontSize: '0.52rem', fontWeight: 600, color: '#999' }}>Compte</span>
              </Link>
            )}

            {/* Panier */}
            <button onClick={() => setIsOpen(true)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              padding: isMobile ? '8px 10px' : '8px 12px', borderRadius: 14,
              background: totalItems > 0 ? '#FFF8E1' : 'none',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s',
            }}>
              <span style={{ fontSize: isMobile ? '1.15rem' : '1.2rem' }}>🛒</span>
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 6, background: '#C62828', color: '#fff', fontSize: '0.5rem', width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '1.5px solid #fff' }}>
                  {totalItems}
                </span>
              )}
              <span style={{ fontSize: '0.52rem', fontWeight: 700, color: '#C62828' }}>Panier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav style={{
        background: '#0A0A0A',
        borderBottom: '2px solid #F9A825',
        overflowX: 'auto',
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 8px' : '0 48px', display: 'flex' }}>
          <Link href="/catalogue" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', padding: isMobile ? '10px 12px' : '12px 18px', fontSize: isMobile ? '0.72rem' : '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-sora)', borderBottom: '2px solid transparent', marginBottom: -2, transition: 'all 0.2s', letterSpacing: 0.3 }}>
            Tout
          </Link>
          {categories.map(cat => (
            <Link key={cat.href} href={cat.href} style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', padding: isMobile ? '10px 12px' : '12px 18px', fontSize: isMobile ? '0.72rem' : '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-sora)', borderBottom: '2px solid transparent', marginBottom: -2, transition: 'all 0.2s', letterSpacing: 0.3 }}>
              {isMobile ? cat.emoji : `${cat.emoji} ${cat.label}`}
            </Link>
          ))}
        </div>
      </nav>

      {showMenu && <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
    </header>
  );
}
