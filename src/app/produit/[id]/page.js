'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

const reviewsList = [
  { name: 'Adjoua K.',  rating: 5, date: 'Il y a 3 jours',   comment: 'Produit magnifique ! Qualité au rendez-vous, livraison rapide. Je recommande vivement BéninXi.', avatar: '👩🏾' },
  { name: 'Kofi M.',    rating: 5, date: 'Il y a 1 semaine',  comment: 'Très satisfait de mon achat. Le produit correspond exactement à la description. Parfait !', avatar: '👨🏾' },
  { name: 'Aminata D.', rating: 4, date: 'Il y a 2 semaines', comment: 'Bonne qualité, bon rapport qualité/prix. Livraison en 2 jours à Cotonou. Je suis satisfaite.', avatar: '👩🏿' },
];

export default function ProductPage({ params: paramsPromise }) {
  const params = React.use(paramsPromise);
  const { addItem, setIsOpen, totalItems } = useCart();
  const [product, setProduct]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeImg,  setActiveImg]  = useState(0);
  const [activeTab,  setActiveTab]  = useState('description');
  const [qty,        setQty]        = useState(1);
  const [added,      setAdded]      = useState(false);
  const [liked,      setLiked]      = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', params.id).single();
      setProduct(data);
      if (data) {
        const { data: rel } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  function handleAdd() {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, img: product.img, color: 'Standard', size: 'Standard', qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #F0F0F0', borderTop: '3px solid #1B5E20', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, color: '#999', fontSize: '0.88rem' }}>Chargement...</div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );

  if (!product) return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '3rem' }}>😕</div>
        <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, color: '#0A0A0A' }}>Produit introuvable</h2>
        <Link href="/catalogue" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem' }}>
          Voir le catalogue →
        </Link>
      </div>
    </main>
  );

  const images = [product.img, product.img, product.img, product.img];
  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  return (
    <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div style={{ background: '#F8F8F8', borderBottom: '1px solid #F0F0F0', padding: '14px 40px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#AAA' }}>
          <Link href="/" style={{ color: '#AAA', textDecoration: 'none', fontWeight: 600 }}>Accueil</Link>
          <span>›</span>
          <Link href="/catalogue" style={{ color: '#AAA', textDecoration: 'none', fontWeight: 600 }}>Catalogue</Link>
          <span>›</span>
          <Link href={`/catalogue?cat=${product.category}`} style={{ color: '#AAA', textDecoration: 'none', fontWeight: 600, textTransform: 'capitalize' }}>{product.category}</Link>
          <span>›</span>
          <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 40px' }}>

        {/* ═══ MAIN GRID ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: 64, marginBottom: 80 }}>

          {/* Galerie */}
          <div>
            <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 14, position: 'relative', background: '#F8F8F8', aspectRatio: '4/3' }}>
              <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {discount > 0 && (
                <div style={{ position: 'absolute', top: 20, left: 20, background: '#C62828', color: '#fff', padding: '8px 18px', borderRadius: 50, fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-sora)' }}>
                  -{discount}%
                </div>
              )}
              <button onClick={() => setLiked(!liked)} style={{ position: 'absolute', top: 20, right: 20, width: 48, height: 48, borderRadius: '50%', background: liked ? '#FFF0F0' : 'rgba(255,255,255,0.95)', border: liked ? '2px solid #C62828' : 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                {liked ? '❤️' : '🤍'}
              </button>
              {product.stock <= 10 && (
                <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(0,0,0,0.8)', color: '#F9A825', padding: '8px 16px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-sora)' }}>
                  ⚡ Plus que {product.stock} en stock
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: `2.5px solid ${activeImg === i ? '#0A0A0A' : 'transparent'}`, boxShadow: activeImg === i ? '0 4px 14px rgba(0,0,0,0.12)' : 'none', transition: 'all 0.2s', aspectRatio: '1' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: activeImg === i ? 1 : 0.55, transition: 'opacity 0.2s' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Infos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Vendeur */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem' }}>🏪</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{product.seller}</div>
                <div style={{ fontSize: '0.7rem', color: '#AAA' }}>⭐ {product.rating} · {product.sold} ventes</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#F0FAF0', color: '#1B5E20', padding: '4px 12px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700, fontFamily: 'var(--font-sora)' }}>✓ Certifié</div>
            </div>

            {/* Titre */}
            <div style={{ borderBottom: '1px solid #F5F5F5', paddingBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.8rem', color: '#0A0A0A', lineHeight: 1.1, marginBottom: 14, letterSpacing: -0.5 }}>
                {product.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.floor(product.rating) ? '#F9A825' : '#EBEBEB', fontSize: '0.95rem' }}>★</span>)}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A' }}>{product.rating}</span>
                <span style={{ color: '#AAA', fontSize: '0.82rem' }}>({product.reviews} avis)</span>
                <span style={{ color: '#AAA', fontSize: '0.82rem' }}>· {product.sold} vendus</span>
              </div>
            </div>

            {/* Prix */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '2.4rem', color: '#1B5E20', letterSpacing: -1 }}>{fmt(product.price)}</span>
                {product.old_price && <span style={{ fontSize: '1.1rem', color: '#CCC', textDecoration: 'line-through' }}>{fmt(product.old_price)}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.old_price && (
                  <span style={{ background: '#FFF8E1', color: '#E65100', padding: '5px 13px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800 }}>
                    Vous économisez {fmt(product.old_price - product.price)}
                  </span>
                )}
                <span style={{ background: '#F0FAF0', color: '#1B5E20', padding: '5px 13px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>
                  ✓ En stock ({product.stock} restants)
                </span>
              </div>
            </div>

            {/* Quantité */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A', marginBottom: 12, fontFamily: 'var(--font-sora)' }}>Quantité</div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #F0F0F0', borderRadius: 14, overflow: 'hidden', width: 'fit-content', background: '#F8F8F8' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 48, height: 48, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#0A0A0A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>−</button>
                <span style={{ width: 52, textAlign: 'center', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-sora)', color: '#0A0A0A' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 48, height: 48, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#0A0A0A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleAdd} style={{ flex: 1, background: added ? '#1B5E20' : '#0A0A0A', color: '#fff', border: 'none', padding: '18px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.3s', letterSpacing: 0.3 }}>
                {added ? '✓ Ajouté au panier !' : '🛒 Ajouter au panier'}
              </button>
              <Link href="/paiement" style={{ flex: 1, background: '#F9A825', color: '#0A0A0A', border: 'none', padding: '18px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-sora)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 0.3 }}>
                ⚡ Acheter maintenant
              </Link>
            </div>

            {/* Livraison */}
            <div style={{ background: '#F8F8F8', borderRadius: 16, padding: '20px', border: '1px solid #F0F0F0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 14, fontFamily: 'var(--font-sora)' }}>🚚 Livraison</div>
              {[
                ['📍', 'Cotonou Centre',       '24–48h',    'Gratuite dès 50 000 FCFA'],
                ['🏙️', 'Grand Cotonou',        '48–72h',    '1 500 FCFA'              ],
                ['🗺️', 'Porto-Novo / Parakou', '3–5 jours', 'Sur devis'               ],
              ].map(([icon, zone, delai, prix], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 10 : 0, fontSize: '0.82rem' }}>
                  <span>{icon}</span>
                  <span style={{ fontWeight: 600, color: '#0A0A0A', minWidth: 150 }}>{zone}</span>
                  <span style={{ color: '#AAA' }}>{delai}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#1B5E20' }}>{prix}</span>
                </div>
              ))}
            </div>

            {/* Paiement */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{ l: '📱 MTN Money', bg: '#FFD700', c: '#0A0A0A' }, { l: '📱 Moov Money', bg: '#0066CC', c: '#fff' }, { l: '💵 Espèces', bg: '#F5F5F5', c: '#0A0A0A' }].map(p => (
                <span key={p.l} style={{ background: p.bg, color: p.c, padding: '6px 14px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700 }}>{p.l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ ONGLETS ═══ */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #F0F0F0', overflow: 'hidden', marginBottom: 80, boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #F5F5F5' }}>
            {[
              { id: 'description', label: 'Description'              },
              { id: 'avis',        label: `Avis (${product.reviews})` },
              { id: 'livraison',   label: 'Livraison & Retour'        },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '20px 32px', border: 'none', background: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', color: activeTab === t.id ? '#0A0A0A' : '#AAA', borderBottom: `2px solid ${activeTab === t.id ? '#0A0A0A' : 'transparent'}`, marginBottom: -1, transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '36px' }}>
            {activeTab === 'description' && (
              <div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.85, color: '#555', marginBottom: 28, maxWidth: 700 }}>{product.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 600 }}>
                  {['Qualité premium garantie', 'Livraison assurée', 'Retour sous 7 jours', 'Paiement sécurisé'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#F8F8F8', borderRadius: 12 }}>
                      <span style={{ color: '#1B5E20', fontWeight: 900, fontSize: '0.9rem' }}>✓</span>
                      <span style={{ fontSize: '0.85rem', color: '#555', fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'avis' && (
              <div>
                <div style={{ display: 'flex', gap: 48, alignItems: 'center', marginBottom: 36, padding: 28, background: '#F8F8F8', borderRadius: 20 }}>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '4rem', color: '#0A0A0A', lineHeight: 1 }}>{product.rating}</div>
                    <div style={{ color: '#F9A825', fontSize: '1.1rem', margin: '8px 0' }}>{'★'.repeat(Math.floor(product.rating))}</div>
                    <div style={{ fontSize: '0.75rem', color: '#AAA' }}>{product.reviews} avis</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(star => (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', color: '#666', width: 12, textAlign: 'right' }}>{star}</span>
                        <span style={{ color: '#F9A825', fontSize: '0.72rem' }}>★</span>
                        <div style={{ flex: 1, height: 6, background: '#EBEBEB', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#F9A825', borderRadius: 3, width: star === 5 ? '72%' : star === 4 ? '20%' : '8%', transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#AAA', width: 30 }}>{star === 5 ? '72%' : star === 4 ? '20%' : '8%'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reviewsList.map((r, i) => (
                    <div key={i} style={{ padding: '22px 26px', background: '#F8F8F8', borderRadius: 18, border: '1px solid #F0F0F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{r.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{r.name}</div>
                          <div style={{ color: '#F9A825', fontSize: '0.78rem' }}>{'★'.repeat(r.rating)}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#AAA' }}>{r.date}</div>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: '#666', lineHeight: 1.7 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'livraison' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, marginBottom: 18, color: '#0A0A0A', fontSize: '0.95rem' }}>🚚 Zones & Tarifs</h4>
                  {[['Cotonou Centre','24–48h','Gratuite dès 50k'],['Grand Cotonou','48–72h','1 500 FCFA'],['Porto-Novo','2–3 jours','2 500 FCFA'],['Parakou','3–5 jours','5 000 FCFA']].map(([z,d,p]) => (
                    <div key={z} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '12px 0', borderBottom: '1px solid #F5F5F5', fontSize: '0.84rem' }}>
                      <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{z}</span>
                      <span style={{ color: '#AAA' }}>{d}</span>
                      <span style={{ fontWeight: 700, color: '#1B5E20' }}>{p}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, marginBottom: 18, color: '#0A0A0A', fontSize: '0.95rem' }}>↩️ Politique de retour</h4>
                  {['7 jours pour retourner', 'Remboursement si défaut', 'Frais retour offerts si erreur', 'Remboursement sous 5–7 jours'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: '0.84rem', color: '#666' }}>
                      <span style={{ color: '#1B5E20', fontWeight: 900 }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ PRODUITS SIMILAIRES ═══ */}
        {related.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.6rem', color: '#0A0A0A', letterSpacing: -0.5 }}>Vous aimerez aussi</h2>
              <Link href={`/catalogue?cat=${product.category}`} style={{ color: '#666', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'var(--font-dm)' }}>Voir plus →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
              {related.map(p => (
                <Link key={p.id} href={`/produit/${p.id}`} style={{ textDecoration: 'none', background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'block' }}>
                  <div style={{ height: 200, overflow: 'hidden', background: '#F8F8F8' }}>
                    <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#AAA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontFamily: 'var(--font-sora)' }}>{p.seller}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0A0A0A', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.95rem', color: '#1B5E20' }}>{fmt(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
