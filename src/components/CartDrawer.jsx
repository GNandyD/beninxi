'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

export default function CartDrawer() {
  const { items, totalPrice, totalItems, isOpen, setIsOpen, removeItem, updateQty } = useCart();
  const livraison = totalPrice >= 50000 ? 0 : 1500;
  const total = totalPrice + livraison;
  const progress = Math.min((totalPrice / 50000) * 100, 100);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.3s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 460,
        background: '#fff',
        zIndex: 999,
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '-8px 0 48px rgba(0,0,0,0.12)',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #F5F5F5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.15rem', color: '#0A0A0A' }}>
              Mon Panier
            </div>
            {totalItems > 0 && (
              <div style={{ background: '#0A0A0A', color: '#fff', fontSize: '0.68rem', fontWeight: 800, padding: '3px 9px', borderRadius: 999, fontFamily: 'var(--font-sora)' }}>
                {totalItems}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#F5F5F5', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', transition: 'background 0.2s',
              fontFamily: 'var(--font-dm)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress livraison */}
        <div style={{ padding: '14px 24px', background: livraison === 0 ? '#F0FAF0' : '#FAFAFA', borderBottom: '1px solid #F5F5F5' }}>
          {livraison === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#1B5E20', fontWeight: 700, fontFamily: 'var(--font-sora)' }}>
              <span>🎉</span> Livraison gratuite débloquée !
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: 8, fontFamily: 'var(--font-dm)' }}>
                <span>Plus que <strong style={{ color: '#0A0A0A' }}>{fmt(50000 - totalPrice)}</strong> pour la livraison gratuite</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: 4, background: '#F0F0F0', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #1B5E20, #2A9455)', borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '40px 0' }}>
              <div style={{ fontSize: '3.5rem' }}>🛒</div>
              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.1rem', color: '#0A0A0A' }}>Panier vide</div>
              <div style={{ color: '#AAA', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.6 }}>Ajoutez des produits pour commencer vos achats</div>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: '#0A0A0A', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sora)', fontSize: '0.85rem', marginTop: 8 }}
              >
                Découvrir les produits →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', gap: 14, padding: '14px', borderRadius: 16,
                    background: '#FAFAFA', border: '1px solid #F0F0F0',
                    animation: 'fadeUp 0.3s ease',
                  }}
                >
                  {/* Image */}
                  <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F0F0F0' }}>
                    <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0A0A0A', marginBottom: 4, lineHeight: 1.3, fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#AAA', marginBottom: 10 }}>{item.color}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Qty */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E8E8E8', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                        <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-sora)', color: '#0A0A0A' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      {/* Prix */}
                      <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.92rem', color: '#1B5E20' }}>
                        {fmt(item.price * item.qty)}
                      </div>
                    </div>
                  </div>

                  {/* Supprimer */}
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#FFF0F0', cursor: 'pointer', color: '#C62828', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-start', transition: 'background 0.2s' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #F5F5F5', background: '#fff' }}>
            {/* Récap */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#888' }}>
                <span>Sous-total</span>
                <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{fmt(totalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#888' }}>
                <span>Livraison</span>
                <span style={{ fontWeight: 600, color: livraison === 0 ? '#1B5E20' : '#0A0A0A' }}>
                  {livraison === 0 ? 'Gratuite 🎉' : fmt(livraison)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F0F0F0', marginTop: 4 }}>
                <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.15rem', color: '#1B5E20' }}>{fmt(total)}</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/paiement"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#0A0A0A', color: '#fff',
                padding: '16px', borderRadius: 16,
                fontWeight: 800, fontSize: '0.95rem',
                textDecoration: 'none', fontFamily: 'var(--font-sora)',
                transition: 'transform 0.2s, background 0.2s',
                letterSpacing: 0.3,
              }}
            >
              Commander · {fmt(total)} →
            </Link>

            {/* Paiements */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {['📱 MTN Money', '📱 Moov Money', '💵 Espèces'].map(p => (
                <span key={p} style={{ fontSize: '0.68rem', color: '#AAA', fontWeight: 600, background: '#F5F5F5', padding: '4px 10px', borderRadius: 50 }}>{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
