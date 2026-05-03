'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

const reviewsList = [
  { name: 'Adjoua K.',  rating: 5, date: 'Il y a 3 jours',   comment: 'Produit magnifique ! Qualité au rendez-vous, livraison rapide. Je recommande vivement BéninXi.', avatar: '👩🏾' },
  { name: 'Kofi M.',    rating: 5, date: 'Il y a 1 semaine',  comment: 'Très satisfait de mon achat. Le produit correspond exactement à la description. Parfait !', avatar: '👨🏾' },
  { name: 'Aminata D.', rating: 4, date: 'Il y a 2 semaines', comment: 'Bonne qualité, bon rapport qualité/prix. Livraison en 2 jours à Cotonou. Je suis satisfaite.', avatar: '👩🏿' },
];

export default function ProductPage({ params: paramsPromise }) {
  const params = React.use(paramsPromise);
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [product, setProduct]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [qty, setQty]           = useState(1);
  const [added, setAdded]       = useState(false);

  const liked = isFavorite(product?.id);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 44, height: 44, border: '3px solid #F0F0F0', borderTop: '3px solid #1B5E20', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#BBB', fontSize: '0.85rem', fontFamily: 'var(--font-sora)', fontWeight: 700 }}>Chargement...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );

  if (!product) return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '3rem' }}>😕</div>
        <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, color: '#0A0A0A' }}>Produit introuvable</h2>
        <Link href="/catalogue" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 999, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem' }}>
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
      <div style={{ background: '#F8F8F8', borderBottom: '1px solid #F0F0F0', padding: '12px 48px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#BBB' }}>
          <Link href="/" style={{ color: '#BBB', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>Accueil</Link>
          <span>›</span>
          <Link href="/catalogue" style={{ color: '#BBB', textDecoration: 'none', fontWeight: 600 }}>Catalogue</Link>
          <span>›</span>
          <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '52px 48px' }}>

        {/* ═══ MAIN GRID ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 72, marginBottom: 96 }}>

          {/* Galerie */}
          <div>
            {/* Image principale */}
            <div style={{ borderRadius: 28, overflow: 'hidden', marginBottom: 14, position: 'relative', background: '#F8F8F8', aspectRatio: '4/3', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
              <Image src={images[activeImg]} alt={product.name} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover', transition: 'opacity 0.3s ease' }} />
              {discount > 0 && (
                <div style={{ position: 'absolute', top: 20, left: 20, background: '#C62828', color: '#fff', padding: '8px 18px', borderRadius: 999, fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-sora)' }}>
                  -{discount}%
                </div>
              )}
              <button onClick={() => toggleFavorite(product)} style={{ position: 'absolute', top: 20, right: 20, width: 48, height: 48, borderRadius: '50%', background: liked ? '#FFF0F0' : 'rgba(255,255,255,0.95)', border: liked ? '2px solid #C62828' : 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
                {liked ? '❤️' : '🤍'}
              </button>
              {product.stock <= 10 && (
                <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(0,0,0,0.75)', color: '#F9A825', padding: '8px 16px', borderRadius: 10, fontSize: '0.76rem', fontWeight: 700, fontFamily: 'var(--font-sora)', backdropFilter: 'blur(8px)' }}>
                  ⚡ Plus que {product.stock} en stock
                </div>
              )}
            </div>
            {/* Thumbnails */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ borderRadius: 16, overflow: 'hidden', cursor: 'pointer', border: `2.5px solid ${activeImg === i ? '#0A0A0A' : 'transparent'}`, boxShadow: activeImg === i ? '0 4px 14px rgba(0,0,0,0.12)' : 'none', transition: 'all 0.2s', aspectRatio: '1', background: '#F8F8F8', position: 'relative' }}>
                  <Image src={img} alt="" fill sizes="(max-width: 900px) 25vw, 160px" style={{ objectFit: 'cover', opacity: activeImg === i ? 1 : 0.5, transition: 'opacity 0.2s' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Infos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Vendeur */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem' }}>🏪</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{product.seller}</div>
                <div style={{ fontSize: '0.7rem', color: '#AAA' }}>⭐ {product.rating} · {product.sold} ventes</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#F0FAF0', color: '#1B5E20', padding: '4px 12px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, fontFamily: 'var(--font-sora)' }}>✓ Certifié</div>
            </div>

            {/* Titre */}
            <div style={{ borderBottom: '1px solid #F5F5F5', paddingBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.9rem', color: '#0A0A0A', lineHeight: 1.08, marginBottom: 16, letterSpacing: -0.8 }}>
                {product.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.floor(product.rating) ? '#F9A825' : '#EBEBEB', fontSize: '0.95rem' }}>★</span>)}
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A' }}>{product.rating}</span>
                <span style={{ color: '#BBB', fontSize: '0.82rem' }}>({product.reviews} avis)</span>
                <span style={{ color: '#BBB', fontSize: '0.82rem' }}>· {product.sold} vendus</span>
              </div>
            </div>

            {/* Prix */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '2.6rem', color: '#1B5E20', letterSpacing: -1.5 }}>{fmt(product.price)}</span>
                {product.old_price && <span style={{ fontSize: '1.1rem', color: '#CCC', textDecoration: 'line-through' }}>{fmt(product.old_price)}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.old_price && (
                  <span style={{ background: '#FFF8E1', color: '#E65100', padding: '5px 13px', borderRadius: 10, fontSize: '0.74rem', fontWeight: 800 }}>
                    Économisez {fmt(product.old_price - product.price)}
                  </span>
                )}
                <span style={{ background: '#F0FAF0', color: '#1B5E20', padding: '5px 13px', borderRadius: 10, fontSize: '0.74rem', fontWeight: 700 }}>
                  ✓ En stock
                </span>
              </div>
            </div>

            {/* Quantité */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 12, fontFamily: 'var(--font-sora)' }}>Quantité</div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #F0F0F0', borderRadius: 16, overflow: 'hidden', width: 'fit-content', background: '#F8F8F8' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 48, height: 48, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#0A0A0A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: 52, textAlign: 'center', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-sora)', color: '#0A0A0A' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} style={{ width: 48, height: 48, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#0A0A0A', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleAdd} style={{ flex: 1, background: added ? '#1B5E20' : '#0A0A0A', color: '#fff', border: 'none', padding: '18px', borderRadius: 18, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.3s', letterSpacing: 0.3, boxShadow: added ? '0 8px 24px rgba(27,94,32,0.3)' : '0 8px 24px rgba(0,0,0,0.15)' }}>
                {added ? '✓ Ajouté au panier !' : '🛒 Ajouter au panier'}
              </button>
              <Link href="/paiement" style={{ flex: 1, background: '#F9A825', color: '#0A0A0A', border: 'none', padding: '18px', borderRadius: 18, fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--font-sora)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 0.3, boxShadow: '0 8px 24px rgba(249,168,37,0.3)' }}>
                ⚡ Acheter maintenant
              </Link>
            </div>

            {/* Livraison */}
            <div style={{ background: '#F8F8F8', borderRadius: 18, padding: '20px', border: '1px solid #F0F0F0' }}>
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
              {[
                { l: '📱 MTN Money',  bg: '#FFD700', c: '#0A0A0A' },
                { l: '📱 Moov Money', bg: '#0066CC', c: '#fff'    },
                { l: '💵 Espèces',    bg: '#F5F5F5', c: '#0A0A0A' },
              ].map(p => (
                <span key={p.l} style={{ background: p.bg, color: p.c, padding: '6px 14px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700 }}>{p.l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ ONGLETS ═══ */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #F0F0F0', overflow: 'hidden', marginBottom: 96, boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>
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
                      <span style={{ color: '#1B5E20', fontWeight: 900 }}>✓</span>
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
                          <div style={{ height: '100%', background: '#F9A825', borderRadius: 3, width: star === 5 ? '72%' : star === 4 ? '20%' : '8%' }} />
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
                  {[
                    ['Cotonou Centre', '24–48h',    'Gratuite dès 50k'],
                    ['Grand Cotonou',  '48–72h',    '1 500 FCFA'      ],
                    ['Porto-Novo',     '2–3 jours', '2 500 FCFA'      ],
                    ['Parakou',        '3–5 jours', '5 000 FCFA'      ],
                  ].map(([z,d,p]) => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#BBB', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-sora)' }}>SIMILAIRES</div>
                <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.8rem', color: '#0A0A0A', letterSpacing: -0.5 }}>Vous aimerez aussi</h2>
              </div>
              <Link href={`/catalogue?cat=${product.category}`} style={{ color: '#1B5E20', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'var(--font-sora)' }}>Voir plus →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {related.map(p => (
                <Link key={p.id} href={`/produit/${p.id}`} style={{ textDecoration: 'none', background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'block', transition: 'transform 0.3s, box-shadow 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}
                >
                  <div style={{ height: 200, overflow: 'hidden', background: '#F8F8F8', position: 'relative' }}>
                    <Image src={p.img} alt={p.name} fill sizes="(max-width: 900px) 100vw, 25vw" style={{ objectFit: 'cover', transition: 'transform 0.5s' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#BBB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontFamily: 'var(--font-sora)' }}>{p.seller}</div>
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
