'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, totalItems, totalPrice } = useCart();
  const livraison = totalPrice >= 50000 ? 0 : 1500;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />

      {/* Drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.2rem', color: '#0A0A0A' }}>Mon Panier</h2>
            <p style={{ fontSize: '0.78rem', color: '#999', marginTop: 2 }}>{totalItems} article{totalItems > 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ width: 40, height: 40, borderRadius: '50%', background: '#F5F5F5', border: 'none', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Livraison gratuite progress */}
        {totalPrice < 50000 && (
          <div style={{ padding: '14px 28px', background: '#FFF8E1', borderBottom: '1px solid #FFE082' }}>
            <div style={{ fontSize: '0.78rem', color: '#F57F17', fontWeight: 600, marginBottom: 6 }}>
              Plus que <strong>{fmt(50000 - totalPrice)}</strong> pour la livraison gratuite !
            </div>
            <div style={{ height: 4, background: '#FFE082', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#F9A825', borderRadius: 2, width: `${Math.min((totalPrice / 50000) * 100, 100)}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
        {totalPrice >= 50000 && (
          <div style={{ padding: '12px 28px', background: '#E8F5E9', borderBottom: '1px solid #C8E6C9' }}>
            <div style={{ fontSize: '0.78rem', color: '#1B5E20', fontWeight: 700 }}>🎉 Livraison gratuite débloquée !</div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🛍️</div>
              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1rem', color: '#0A0A0A', marginBottom: 8 }}>Votre panier est vide</div>
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: 24 }}>Découvrez nos produits</div>
              <button onClick={() => setIsOpen(false)} style={{ background: '#1B5E20', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
                Voir le catalogue
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '16px', background: '#FAFAFA', borderRadius: 16, border: '1px solid #F0F0F0' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0A0A0A', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#999', marginBottom: 8 }}>{item.color} · {item.size}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E8E8E8', borderRadius: 8, overflow: 'hidden' }}>
                        <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: '#555' }}>−</button>
                        <span style={{ width: 28, textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700, color: '#555' }}>+</button>
                      </div>
                      <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.92rem', color: '#1B5E20' }}>{fmt(item.price * item.qty)}</div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CCC', fontSize: '1rem', alignSelf: 'flex-start', padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 28px', borderTop: '1px solid #F0F0F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem', color: '#666' }}>
              <span>Sous-total</span><span style={{ fontWeight: 600, color: '#0A0A0A' }}>{fmt(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: '0.85rem', color: '#666' }}>
              <span>Livraison</span>
              <span style={{ fontWeight: 600, color: livraison === 0 ? '#1B5E20' : '#0A0A0A' }}>{livraison === 0 ? 'Gratuite 🎉' : fmt(livraison)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingTop: 16, borderTop: '2px solid #F0F0F0' }}>
              <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, fontSize: '1.2rem', color: '#1B5E20' }}>{fmt(totalPrice + livraison)}</span>
            </div>
            <Link href="/paiement" onClick={() => setIsOpen(false)} style={{ display: 'block', background: '#1B5E20', color: '#fff', textDecoration: 'none', padding: '16px', borderRadius: 14, fontWeight: 800, fontSize: '1rem', textAlign: 'center', fontFamily: 'var(--font-sora)', marginBottom: 10 }}>
              Commander — {fmt(totalPrice + livraison)}
            </Link>
            <button onClick={() => setIsOpen(false)} style={{ display: 'block', width: '100%', background: 'none', border: '1.5px solid #E8E8E8', color: '#666', padding: '12px', borderRadius: 14, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  );
}
