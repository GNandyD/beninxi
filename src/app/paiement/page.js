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
  { id: 'mtn',  label: 'MTN Mobile Money', icon: '📱', color: '#FFD700', desc: 'Paiement instantané via MTN Money',  textColor: '#0A0A0A' },
  { id: 'moov', label: 'Moov Money',       icon: '📱', color: '#0066CC', desc: 'Paiement instantané via Moov Money', textColor: '#fff'    },
  { id: 'cash', label: 'Espèces',          icon: '💵', color: '#1B5E20', desc: 'Paiement à la livraison',            textColor: '#fff'    },
];

function StepIndicator({ step }) {
  const steps = [
    { num: 1, label: 'Livraison'    },
    { num: 2, label: 'Paiement'     },
    { num: 3, label: 'Confirmation' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s.num ? '#F9A825' : 'rgba(255,255,255,0.1)', color: step >= s.num ? '#0A0A0A' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-sora)', transition: 'all 0.3s' }}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: step >= s.num ? '#fff' : 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sora)' }}>{s.label}</span>
          </div>
          {i < 2 && <div style={{ width: 48, height: 1, background: step > s.num ? '#F9A825' : 'rgba(255,255,255,0.1)', margin: '0 14px', transition: 'all 0.3s' }} />}
        </div>
      ))}
    </div>
  );
}

export default function PaiementPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderNum, setOrderNum] = useState('');

  const [form, setForm] = useState({
    prenom: '', nom: '', telephone: '', email: '', adresse: '', zone: 'cotonou_centre',
  });
  const [payMethod, setPayMethod] = useState('mtn');

  const selectedZone = zones.find(z => z.id === form.zone);
  const livraison    = totalPrice >= 50000 && form.zone === 'cotonou_centre' ? 0 : selectedZone?.prix || 0;
  const total        = totalPrice + livraison;

  function handleForm(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }
  function step1Valid()  { return form.prenom && form.nom && form.telephone && form.adresse; }

  async function handleConfirm() {
    setLoading(true);
    try {
      const num = 'BX' + Date.now().toString().slice(-8);
      await supabase.from('orders').insert({
        customer_name:  `${form.prenom} ${form.nom}`,
        customer_phone: form.telephone,
        customer_email: form.email,
        address:        form.adresse,
        zone:           form.zone,
        total,
        payment_method: payMethod,
        items,
        status: 'pending',
      });
      setOrderNum(num);
      clearCart();
      setStep(3);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid #EBEBEB', borderRadius: 14, padding: '15px 18px',
    fontSize: '0.92rem', outline: 'none', fontFamily: 'var(--font-dm)', color: '#0A0A0A',
    background: '#FAFAFA', transition: 'border 0.2s', boxSizing: 'border-box',
  };

  return (
    <main style={{ background: '#F8F8F8', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#0A0A0A', padding: '36px 48px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginBottom: 12, fontFamily: 'var(--font-sora)', letterSpacing: 2 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Accueil</Link> › <Link href="/catalogue" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Catalogue</Link> › Paiement
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: step < 3 ? 32 : 0 }}>
            <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.8rem', color: '#fff', letterSpacing: -0.5 }}>
              {step === 3 ? '✓ Commande confirmée' : 'Finaliser la commande'}
            </h1>
          </div>
          {step < 3 && <StepIndicator step={step} />}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 48px' }}>

        {/* ═══ CONFIRMATION ═══ */}
        {step === 3 && (
          <div style={{ background: '#fff', borderRadius: 28, padding: '64px 48px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0', animation: 'scaleIn 0.4s ease' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#F0FAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.2rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '2rem', color: '#0A0A0A', marginBottom: 12, letterSpacing: -0.5 }}>Commande confirmée !</h2>
            <p style={{ color: '#AAA', fontSize: '0.95rem', marginBottom: 32, lineHeight: 1.7 }}>
              Merci pour votre commande. Vous recevrez une confirmation<br />par SMS au {form.telephone}.
            </p>
            <div style={{ background: '#F8F8F8', borderRadius: 18, padding: '20px 32px', display: 'inline-block', marginBottom: 40 }}>
              <div style={{ fontSize: '0.68rem', color: '#BBB', fontFamily: 'var(--font-sora)', letterSpacing: 2, marginBottom: 6 }}>NUMÉRO DE COMMANDE</div>
              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.5rem', color: '#0A0A0A', letterSpacing: 3 }}>{orderNum}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              {[
                { icon: '🚚', label: 'Livraison',  val: selectedZone?.delai, bg: '#F0FAF0' },
                { icon: '💰', label: 'Total payé', val: fmt(total),          bg: '#FFF8E1' },
                { icon: '📱', label: 'Paiement',   val: payMethods.find(p => p.id === payMethod)?.label, bg: '#F8F8F8' },
              ].map((c, i) => (
                <div key={i} style={{ background: c.bg, borderRadius: 16, padding: '16px 24px', textAlign: 'center', minWidth: 140 }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontSize: '0.72rem', color: '#AAA', fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{c.val}</div>
                </div>
              ))}
            </div>
            <Link href="/" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '15px 40px', borderRadius: 999, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.9rem', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              Retour à l'accueil →
            </Link>
          </div>
        )}

        {step < 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

            {/* Formulaire */}
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>

              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.1rem', color: '#0A0A0A', marginBottom: 24 }}>📍 Informations de livraison</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 7, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>PRÉNOM *</label>
                      <input name="prenom" value={form.prenom} onChange={handleForm} placeholder="Kofi" style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 7, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>NOM *</label>
                      <input name="nom" value={form.nom} onChange={handleForm} placeholder="Adjovi" style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 7, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>TÉLÉPHONE *</label>
                    <input name="telephone" value={form.telephone} onChange={handleForm} placeholder="+229 97 00 00 00" style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 7, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>EMAIL (optionnel)</label>
                    <input name="email" value={form.email} onChange={handleForm} placeholder="votre@email.com" style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 7, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>ADRESSE *</label>
                    <input name="adresse" value={form.adresse} onChange={handleForm} placeholder="Quartier, rue, description..." style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                  </div>

                  {/* Zones */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 12, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>ZONE DE LIVRAISON *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {zones.map(z => (
                        <label key={z.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 14, border: `1.5px solid ${form.zone === z.id ? '#0A0A0A' : '#EBEBEB'}`, background: form.zone === z.id ? '#F8F8F8' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input type="radio" name="zone" value={z.id} checked={form.zone === z.id} onChange={handleForm} style={{ accentColor: '#0A0A0A' }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{z.label}</div>
                              <div style={{ fontSize: '0.72rem', color: '#AAA', marginTop: 2 }}>{z.delai}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: z.prix === 0 ? '#1B5E20' : '#0A0A0A', fontFamily: 'var(--font-sora)' }}>
                            {z.prix === 0 || (z.id === 'cotonou_centre' && totalPrice >= 50000) ? '🎉 Gratuit' : fmt(z.prix)}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => step1Valid() && setStep(2)} style={{ width: '100%', background: step1Valid() ? '#0A0A0A' : '#F0F0F0', color: step1Valid() ? '#fff' : '#AAA', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', cursor: step1Valid() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', boxShadow: step1Valid() ? '0 8px 24px rgba(0,0,0,0.15)' : 'none' }}>
                    Continuer vers le paiement →
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AAA', fontSize: '0.85rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm)' }}>
                    ← Retour
                  </button>
                  <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.1rem', color: '#0A0A0A', marginBottom: 24 }}>💳 Méthode de paiement</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {payMethods.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 16, border: `2px solid ${payMethod === m.id ? '#0A0A0A' : '#EBEBEB'}`, background: payMethod === m.id ? '#F8F8F8' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input type="radio" name="pay" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} style={{ accentColor: '#0A0A0A' }} />
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{m.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{m.label}</div>
                          <div style={{ fontSize: '0.74rem', color: '#AAA', marginTop: 2 }}>{m.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Résumé livraison */}
                  <div style={{ background: '#F8F8F8', borderRadius: 14, padding: '16px 18px', marginBottom: 24, border: '1px solid #F0F0F0' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#AAA', fontFamily: 'var(--font-sora)', marginBottom: 8, letterSpacing: 1 }}>LIVRAISON À</div>
                    <div style={{ fontSize: '0.86rem', color: '#555' }}><strong style={{ color: '#0A0A0A' }}>{form.prenom} {form.nom}</strong> · {form.telephone}</div>
                    <div style={{ fontSize: '0.8rem', color: '#AAA', marginTop: 4 }}>{form.adresse} · {selectedZone?.label}</div>
                  </div>

                  <button onClick={handleConfirm} disabled={loading} style={{ width: '100%', background: loading ? '#F0F0F0' : '#F9A825', color: loading ? '#AAA' : '#0A0A0A', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 8px 24px rgba(249,168,37,0.3)' }}>
                    {loading ? '⏳ Traitement...' : `✓ Confirmer · ${fmt(total)}`}
                  </button>
                </div>
              )}
            </div>

            {/* Résumé */}
            <div style={{ background: '#fff', borderRadius: 24, padding: '24px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', position: 'sticky', top: 100 }}>
              <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.95rem', color: '#0A0A0A', marginBottom: 18 }}>
                Commande · {items.length} article{items.length > 1 ? 's' : ''}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18, maxHeight: 260, overflowY: 'auto' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F8F8F8', position: 'relative' }}>
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: -5, right: -5, background: '#0A0A0A', color: '#fff', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 800 }}>{item.qty}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.82rem', color: '#0A0A0A', flexShrink: 0 }}>{fmt(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #F5F5F5', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#888' }}>
                  <span>Sous-total</span><span style={{ fontWeight: 600, color: '#0A0A0A' }}>{fmt(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#888' }}>
                  <span>Livraison</span>
                  <span style={{ fontWeight: 600, color: livraison === 0 ? '#1B5E20' : '#0A0A0A' }}>
                    {livraison === 0 ? 'Gratuite 🎉' : fmt(livraison)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '2px solid #F5F5F5', marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.1rem', color: '#1B5E20' }}>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
