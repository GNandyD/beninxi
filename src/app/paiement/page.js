'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

const zones = [
  { id: 'cotonou_centre', label: 'Cotonou Centre',  delai: '24–48h',    prix: 0     },
  { id: 'grand_cotonou',  label: 'Grand Cotonou',   delai: '48–72h',    prix: 1500  },
  { id: 'porto_novo',     label: 'Porto-Novo',      delai: '2–3 jours', prix: 2500  },
  { id: 'parakou',        label: 'Parakou',         delai: '3–5 jours', prix: 5000  },
];

const payMethods = [
  { id: 'mtn',    label: 'MTN Mobile Money',  icon: '📱', color: '#FFD700', desc: 'Paiement instantané via MTN Money'  },
  { id: 'moov',   label: 'Moov Money',        icon: '📱', color: '#0066CC', desc: 'Paiement instantané via Moov Money' },
  { id: 'cash',   label: 'Espèces',           icon: '💵', color: '#1B5E20', desc: 'Paiement à la livraison'            },
];

export default function PaiementPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderNum, setOrderNum] = useState('');

  const [form, setForm] = useState({
    prenom: '', nom: '', telephone: '', email: '', adresse: '', zone: 'cotonou_centre',
  });
  const [payMethod, setPayMethod] = useState('mtn');

  const selectedZone = zones.find(z => z.id === form.zone);
  const livraison = totalPrice >= 50000 && form.zone === 'cotonou_centre' ? 0 : selectedZone?.prix || 0;
  const total = totalPrice + livraison;

  function handleForm(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  function step1Valid() { return form.prenom && form.nom && form.telephone && form.adresse; }

  async function handleConfirm() {
    setLoading(true);
    try {
      const num = 'BX' + Date.now().toString().slice(-8);
      await supabase.from('orders').insert({
        customer_name: `${form.prenom} ${form.nom}`,
        customer_phone: form.telephone,
        customer_email: form.email,
        address: form.adresse,
        zone: form.zone,
        total,
        payment_method: payMethod,
        items: items,
        status: 'pending',
      });
      setOrderNum(num);
      clearCart();
      setStep(3);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid #F0F0F0', borderRadius: 12, padding: '14px 16px',
    fontSize: '0.92rem', outline: 'none', fontFamily: 'var(--font-dm)', color: '#0A0A0A',
    background: '#FAFAFA', transition: 'border 0.2s', boxSizing: 'border-box',
  };

  return (
    <main style={{ background: '#F8F8F8', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#0A0A0A', padding: '36px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: 10, fontFamily: 'var(--font-sora)', letterSpacing: 2 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Accueil</Link> › <Link href="/catalogue" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Catalogue</Link> › Paiement
          </div>
          <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.8rem', color: '#fff', letterSpacing: -0.5, marginBottom: 28 }}>
            {step === 3 ? '✓ Commande confirmée' : 'Finaliser la commande'}
          </h1>

          {/* Steps */}
          {step < 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {[
                { num: 1, label: 'Livraison'  },
                { num: 2, label: 'Paiement'   },
                { num: 3, label: 'Confirmation' },
              ].map((s, i) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s.num ? '#F9A825' : 'rgba(255,255,255,0.1)', color: step >= s.num ? '#0A0A0A' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-sora)', transition: 'all 0.3s' }}>
                      {step > s.num ? '✓' : s.num}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: step >= s.num ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-sora)' }}>{s.label}</span>
                  </div>
                  {i < 2 && <div style={{ width: 60, height: 1, background: step > s.num ? '#F9A825' : 'rgba(255,255,255,0.1)', margin: '0 16px', transition: 'all 0.3s' }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 40px' }}>

        {/* ═══ STEP 3 — CONFIRMATION ═══ */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '60px 40px', background: '#fff', borderRadius: 24, border: '1px solid #F0F0F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#F0FAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.8rem', color: '#0A0A0A', marginBottom: 10 }}>Commande confirmée !</h2>
            <p style={{ color: '#AAA', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.7 }}>
              Merci pour votre commande. Vous recevrez une confirmation<br />par SMS au {form.telephone}.
            </p>
            <div style={{ background: '#F8F8F8', borderRadius: 16, padding: '20px 32px', display: 'inline-block', marginBottom: 36 }}>
              <div style={{ fontSize: '0.72rem', color: '#AAA', fontFamily: 'var(--font-sora)', letterSpacing: 1.5, marginBottom: 6 }}>NUMÉRO DE COMMANDE</div>
              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.4rem', color: '#0A0A0A', letterSpacing: 2 }}>{orderNum}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: '#F0FAF0', borderRadius: 14, padding: '16px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>🚚</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A' }}>Livraison</div>
                <div style={{ fontSize: '0.72rem', color: '#AAA' }}>{selectedZone?.delai}</div>
              </div>
              <div style={{ background: '#FFF8E1', borderRadius: 14, padding: '16px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>💰</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A' }}>Total payé</div>
                <div style={{ fontSize: '0.72rem', color: '#AAA' }}>{fmt(total)}</div>
              </div>
              <div style={{ background: '#F8F8F8', borderRadius: 14, padding: '16px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>📱</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A' }}>Paiement</div>
                <div style={{ fontSize: '0.72rem', color: '#AAA' }}>{payMethods.find(p => p.id === payMethod)?.label}</div>
              </div>
            </div>
            <div style={{ marginTop: 36 }}>
              <Link href="/" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 50, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem', display: 'inline-block' }}>
                Retour à l'accueil →
              </Link>
            </div>
          </div>
        )}

        {step < 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

            {/* Formulaire */}
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>

              {/* ═══ STEP 1 ═══ */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.15rem', color: '#0A0A0A', marginBottom: 24 }}>📍 Informations de livraison</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Prénom *</label>
                      <input name="prenom" value={form.prenom} onChange={handleForm} placeholder="Kofi" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Nom *</label>
                      <input name="nom" value={form.nom} onChange={handleForm} placeholder="Adjovi" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Téléphone * (MTN ou Moov)</label>
                    <input name="telephone" value={form.telephone} onChange={handleForm} placeholder="+229 97 00 00 00" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Email (optionnel)</label>
                    <input name="email" value={form.email} onChange={handleForm} placeholder="kofi@email.com" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Adresse de livraison *</label>
                    <input name="adresse" value={form.adresse} onChange={handleForm} placeholder="Quartier, rue, description..." style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 10, fontFamily: 'var(--font-sora)' }}>Zone de livraison *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {zones.map(z => (
                        <label key={z.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${form.zone === z.id ? '#0A0A0A' : '#F0F0F0'}`, background: form.zone === z.id ? '#F8F8F8' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input type="radio" name="zone" value={z.id} checked={form.zone === z.id} onChange={handleForm} style={{ accentColor: '#0A0A0A' }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{z.label}</div>
                              <div style={{ fontSize: '0.72rem', color: '#AAA' }}>{z.delai}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: z.prix === 0 && totalPrice >= 50000 ? '#1B5E20' : '#0A0A0A', fontFamily: 'var(--font-sora)' }}>
                            {z.prix === 0 || (z.id === 'cotonou_centre' && totalPrice >= 50000) ? '🎉 Gratuit' : fmt(z.prix)}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => step1Valid() && setStep(2)} style={{ width: '100%', background: step1Valid() ? '#0A0A0A' : '#F0F0F0', color: step1Valid() ? '#fff' : '#AAA', border: 'none', padding: '16px', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem', cursor: step1Valid() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sora)', transition: 'all 0.2s' }}>
                    Continuer vers le paiement →
                  </button>
                </div>
              )}

              {/* ═══ STEP 2 ═══ */}
              {step === 2 && (
                <div>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AAA', fontSize: '0.85rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm)' }}>
                    ← Retour
                  </button>
                  <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.15rem', color: '#0A0A0A', marginBottom: 24 }}>💳 Méthode de paiement</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                    {payMethods.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14, border: `2px solid ${payMethod === m.id ? '#0A0A0A' : '#F0F0F0'}`, background: payMethod === m.id ? '#F8F8F8' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input type="radio" name="pay" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} style={{ accentColor: '#0A0A0A' }} />
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{m.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{m.label}</div>
                          <div style={{ fontSize: '0.75rem', color: '#AAA', marginTop: 2 }}>{m.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Résumé livraison */}
                  <div style={{ background: '#F8F8F8', borderRadius: 14, padding: '16px 20px', marginBottom: 24, border: '1px solid #F0F0F0' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', fontFamily: 'var(--font-sora)', marginBottom: 10 }}>📍 Livraison à</div>
                    <div style={{ fontSize: '0.85rem', color: '#555' }}><strong>{form.prenom} {form.nom}</strong> · {form.telephone}</div>
                    <div style={{ fontSize: '0.82rem', color: '#AAA', marginTop: 4 }}>{form.adresse} · {selectedZone?.label}</div>
                  </div>

                  <button onClick={handleConfirm} disabled={loading} style={{ width: '100%', background: '#F9A825', color: '#0A0A0A', border: 'none', padding: '16px', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}>
                    {loading ? '⏳ Traitement...' : `✓ Confirmer — ${fmt(total)}`}
                  </button>
                </div>
              )}
            </div>

            {/* Résumé commande */}
            <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', position: 'sticky', top: 100 }}>
              <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.95rem', color: '#0A0A0A', marginBottom: 20 }}>
                Votre commande ({items.length} article{items.length > 1 ? 's' : ''})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 280, overflowY: 'auto' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F8F8F8', position: 'relative' }}>
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: -6, right: -6, background: '#0A0A0A', color: '#fff', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>{item.qty}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#AAA', marginTop: 2 }}>{item.color}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.85rem', color: '#0A0A0A', flexShrink: 0 }}>{fmt(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                  <span>Sous-total</span><span style={{ fontWeight: 600, color: '#0A0A0A' }}>{fmt(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                  <span>Livraison</span>
                  <span style={{ fontWeight: 600, color: livraison === 0 ? '#1B5E20' : '#0A0A0A' }}>
                    {livraison === 0 ? 'Gratuite 🎉' : fmt(livraison)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid #F5F5F5', marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.15rem', color: '#1B5E20' }}>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
