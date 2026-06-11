'use client';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import {
  getKkiapayPaymentMethods,
  getKkiapayPublicKey,
  getKkiapayTransactionId,
  isKkiapaySandbox,
  KKIAPAY_SCRIPT_URL,
  normalizeKkiapayPhone,
} from '@/lib/kkiapay';
import {
  deliveryZones,
  getCityById,
  getDeliveryFee,
  getLocationLabel,
  getPackageType,
  getPaymentMethodLabel,
  paymentMethods,
} from '@/lib/orderUtils';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

function getKkiapayWindowApi() {
  if (typeof window === 'undefined') return {};

  return {
    openWidget: window.openKkiapayWidget,
    addSuccessListener: window.addSuccessListener || ((callback) => window.addKkiapayListener?.('success', callback)),
    addFailedListener: window.addFailedListener || ((callback) => window.addKkiapayListener?.('failed', callback)),
    removeListener: window.removeKkiapayListener,
  };
}

function StepIndicator({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {[{ num: 1, label: 'Livraison' }, { num: 2, label: 'Paiement' }, { num: 3, label: 'Confirmation' }].map((s, i) => (
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
  const [step, setStep]         = useState(1);
  const [loading, setLoading]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [kkiapayReady, setKkiapayReady] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState('');
  const [draftOrder, setDraftOrder] = useState(null);

  const [form, setForm] = useState({
    prenom: '', nom: '', telephone: '', email: '', adresse: '', zone: 'sud', ville: '',
  });
  const [payMethod, setPayMethod] = useState('kkiapay');

  const cartIsEmpty    = items.length === 0;
  const selectedVille  = getCityById(form.ville);
  const livraison      = getDeliveryFee(items, form.ville);
  const total          = totalPrice + livraison;
  const typeColis     = items.length > 0 ? getPackageType(items) : null;
  const southCities    = deliveryZones[0]?.villes || [];
  const confirmedLocation = confirmedOrder
    ? getLocationLabel(confirmedOrder.zone, confirmedOrder.ville)
    : getLocationLabel(form.zone, form.ville);
  const kkiapayPublicKey = getKkiapayPublicKey();
  const kkiapaySandbox = isKkiapaySandbox();
  const isKkiapayMethod = payMethod === 'kkiapay';
  const isKkiapayConfigured = Boolean(kkiapayPublicKey);
  const isAwaitingKkiapayConfirmation = confirmedOrder?.paymentMethod === 'kkiapay' && confirmedOrder?.paymentStatus !== 'paid';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.openKkiapayWidget) {
      setKkiapayReady(true);
    }
  }, []);

  useEffect(() => {
    const { addSuccessListener, addFailedListener, removeListener } = getKkiapayWindowApi();
    if (!addSuccessListener || !addFailedListener) return undefined;

    const successHandler = async (response) => {
      if (!draftOrder) return;

      const transactionId = getKkiapayTransactionId(response);

      setLoading(true);
      setSubmitError('');
      setPaymentInfo('Paiement Kkiapay reçu. Confirmation automatique en cours...');

      try {
        if (transactionId) {
          await fetch('/api/payments/kkiapay/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_number: draftOrder.orderNumber,
              transaction_id: transactionId,
              event: 'success',
            }),
          });
        }

        clearCart();
        setConfirmedOrder({
          ...draftOrder,
          paymentMethod: 'kkiapay',
          paymentStatus: 'pending',
          paymentReference: transactionId,
        });
        setDraftOrder(null);
        setStep(3);
      } catch (error) {
        console.error(error);
        setSubmitError('Le paiement a été reçu, mais la commande n’a pas pu être synchronisée automatiquement.');
      } finally {
        setLoading(false);
      }
    };

    const failedHandler = async (error) => {
      const message = error?.failureMessage || error?.message || 'Le paiement Kkiapay a été interrompu. Vous pouvez réessayer avec la même commande.';
      const transactionId = getKkiapayTransactionId(error);

      setSubmitError(message);
      setPaymentInfo(draftOrder ? `Commande ${draftOrder.orderNumber} en attente. Vous pouvez relancer le paiement.` : '');

      if (draftOrder && transactionId) {
        try {
          await fetch('/api/payments/kkiapay/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_number: draftOrder.orderNumber,
              transaction_id: transactionId,
              event: 'failed',
            }),
          });
        } catch (linkError) {
          console.error(linkError);
        }
      }
    };

    addSuccessListener(successHandler);
    addFailedListener(failedHandler);

    return () => {
      if (removeListener) {
        removeListener('success', successHandler);
        removeListener('failed', failedHandler);
      }
    };
  }, [clearCart, draftOrder]);

  function resetDraftOrder() {
    setDraftOrder(null);
    setPaymentInfo('');
  }

  function handleForm(e) {
    resetDraftOrder();
    setSubmitError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function selectVille(villeId) {
    resetDraftOrder();
    setSubmitError('');
    setForm(f => ({ ...f, zone: 'sud', ville: villeId }));
  }

  function step1Valid() { return !cartIsEmpty && form.prenom && form.nom && form.telephone && form.adresse && form.ville; }

  async function createOrder(paymentMethod) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          form,
          items,
          payment_method: paymentMethod,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de confirmer la commande.');
      }

      return {
        orderId: payload.order_id,
        orderNumber: payload.order_number,
        subtotal: payload.subtotal,
        deliveryFee: payload.delivery_fee,
        total: payload.total,
        paymentMethod: payload.payment_method,
        paymentStatus: payload.payment_status,
        zone: payload.zone,
        ville: payload.ville,
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error('Impossible de confirmer la commande.');
    }
  }

  function ensureKkiapayAvailable() {
    if (!kkiapayPublicKey) {
      throw new Error('Ajoute NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY dans .env.local pour activer le paiement Kkiapay.');
    }
    if (!kkiapayReady) {
      throw new Error('Le module Kkiapay n’est pas encore chargé. Réessaie dans quelques secondes.');
    }

    const { openWidget } = getKkiapayWindowApi();
    if (!openWidget) {
      throw new Error('Le widget Kkiapay est indisponible pour le moment.');
    }

    return openWidget;
  }

  function openKkiapayWidget(order) {
    const openWidget = ensureKkiapayAvailable();

    openWidget({
      amount: order.total,
      key: kkiapayPublicKey,
      api_key: kkiapayPublicKey,
      sandbox: kkiapaySandbox,
      email: form.email || undefined,
      phone: normalizeKkiapayPhone(form.telephone),
      name: `${form.prenom} ${form.nom}`,
      reason: `Commande ${order.orderNumber}`,
      partnerId: order.orderNumber,
      data: JSON.stringify({ order_number: order.orderNumber }),
      countries: ['BJ'],
      paymentmethod: getKkiapayPaymentMethods(),
      position: 'center',
      theme: '#1B5E20',
    });
  }

  async function handleConfirm() {
    if (cartIsEmpty) {
      setSubmitError('Votre panier est vide.');
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      if (!draftOrder) {
        ensureKkiapayAvailable();
      }

      const order = draftOrder || await createOrder('kkiapay');
      setDraftOrder(order);
      setPaymentInfo(`Commande ${order.orderNumber} créée. Finalisez le paiement dans la fenêtre Kkiapay.`);
      openKkiapayWidget(order);
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : 'Impossible de confirmer la commande.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid #EBEBEB', borderRadius: 14, padding: '15px 18px',
    fontSize: '0.92rem', outline: 'none', fontFamily: 'var(--font-dm)', color: '#0A0A0A',
    background: '#FAFAFA', transition: 'border 0.2s', boxSizing: 'border-box',
  };

  return (
    <main style={{ background: '#F8F8F8', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Script
        src={KKIAPAY_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={() => {
          setKkiapayReady(true);
        }}
        onError={() => {
          setKkiapayReady(false);
          setSubmitError('Impossible de charger le widget Kkiapay.');
        }}
      />
      <Navbar />

      {/* Header */}
      <div style={{ background: '#0A0A0A', padding: '36px 48px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginBottom: 12, fontFamily: 'var(--font-sora)', letterSpacing: 2 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Accueil</Link> › <Link href="/catalogue" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Catalogue</Link> › Paiement
          </div>
          <div style={{ marginBottom: step < 3 ? 32 : 0 }}>
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
          <div style={{ background: '#fff', borderRadius: 28, padding: '64px 48px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#F0FAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.2rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '2rem', color: '#0A0A0A', marginBottom: 12 }}>
              {isAwaitingKkiapayConfirmation ? 'Paiement reçu !' : 'Commande confirmée !'}
            </h2>
            <p style={{ color: '#AAA', fontSize: '0.95rem', marginBottom: 32, lineHeight: 1.7 }}>
              {isAwaitingKkiapayConfirmation
                ? `Votre paiement Kkiapay a été reçu. La confirmation automatique dépend du webhook Kkiapay configuré sur votre tableau de bord.`
                : `Merci pour votre commande. Vous recevrez une confirmation par SMS au ${form.telephone}.`}
            </p>
            <div style={{ background: '#F8F8F8', borderRadius: 18, padding: '20px 32px', display: 'inline-block', marginBottom: 40 }}>
              <div style={{ fontSize: '0.68rem', color: '#BBB', fontFamily: 'var(--font-sora)', letterSpacing: 2, marginBottom: 6 }}>NUMÉRO DE COMMANDE</div>
              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.5rem', color: '#0A0A0A', letterSpacing: 3 }}>{confirmedOrder?.orderNumber}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              {[
                { icon: 'Lieu', label: 'Livraison',  val: confirmedLocation, bg: '#F0FAF0' },
                { icon: 'Total', label: 'Total payé', val: fmt(confirmedOrder?.total ?? total), bg: '#FFF8E1' },
                { icon: 'Pay', label: 'Paiement',   val: getPaymentMethodLabel(confirmedOrder?.paymentMethod || payMethod), bg: '#F8F8F8' },
              ].map((c, i) => (
                <div key={i} style={{ background: c.bg, borderRadius: 16, padding: '16px 24px', textAlign: 'center', minWidth: 140 }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontSize: '0.72rem', color: '#AAA', fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{c.val}</div>
                </div>
              ))}
            </div>
            <Link href="/" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '15px 40px', borderRadius: 999, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.9rem', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              Retour à l&apos;accueil →
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
                  {cartIsEmpty && (
                    <div style={{ background: '#FFF8E1', color: '#8A5A00', border: '1px solid #F6D78B', borderRadius: 14, padding: '14px 16px', marginBottom: 20, fontSize: '0.85rem', lineHeight: 1.6 }}>
                      Votre panier est vide. Ajoutez au moins un produit avant de finaliser la commande.
                    </div>
                  )}

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

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 7, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>ADRESSE COMPLÈTE *</label>
                    <input name="adresse" value={form.adresse} onChange={handleForm} placeholder="Quartier, rue, point de repère..." style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                  </div>

                  {/* Type de colis */}
                  {items.length > 0 && (
                    <div style={{ background: '#F8F8F8', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>📦</span>
                      <div>
                        <span style={{ color: '#666' }}>Type de colis : </span>
                        <strong style={{ color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>
                          {typeColis === 'petit' ? 'Petit — bijoux & montres' : typeColis === 'moyen' ? 'Moyen — vêtements & chaussures' : 'Grand — meubles'}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Ville de livraison */}
                  <div style={{ marginBottom: 28 }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 12, fontFamily: 'var(--font-sora)', letterSpacing: 0.5 }}>VILLE DE LIVRAISON *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#FAFAFA', border: '1.5px solid #EBEBEB', borderRadius: 16, padding: 12 }}>
                      {southCities.map(ville => (
                          <button
                            key={ville.id}
                            onClick={() => selectVille(ville.id)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${form.ville === ville.id ? '#1B5E20' : 'transparent'}`, background: form.ville === ville.id ? '#F0FAF0' : '#fff', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {form.ville === ville.id && <span style={{ color: '#1B5E20', fontWeight: 900, fontSize: '0.8rem' }}>✓</span>}
                              <span style={{ fontWeight: form.ville === ville.id ? 700 : 500, fontSize: '0.88rem', color: '#0A0A0A', fontFamily: 'var(--font-dm)' }}>{ville.label}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#1B5E20', fontFamily: 'var(--font-sora)' }}>
                                {fmt(getDeliveryFee(items, ville.id))}
                              </div>
                              <div style={{ fontSize: '0.62rem', color: '#BBB', marginTop: 1 }}>tarif ville</div>
                            </div>
                          </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => step1Valid() && setStep(2)}
                    style={{ width: '100%', background: step1Valid() ? '#0A0A0A' : '#F0F0F0', color: step1Valid() ? '#fff' : '#AAA', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', cursor: step1Valid() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', boxShadow: step1Valid() ? '0 8px 24px rgba(0,0,0,0.15)' : 'none' }}
                  >
                    Continuer vers le paiement →
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <button onClick={() => { resetDraftOrder(); setStep(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AAA', fontSize: '0.85rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm)' }}>
                    ← Retour
                  </button>
                  <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.1rem', color: '#0A0A0A', marginBottom: 24 }}>Méthode de paiement</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {paymentMethods.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 16, border: `2px solid ${payMethod === m.id ? '#0A0A0A' : '#EBEBEB'}`, background: payMethod === m.id ? '#F8F8F8' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input type="radio" name="pay" value={m.id} checked={payMethod === m.id} onChange={() => { resetDraftOrder(); setSubmitError(''); setPayMethod(m.id); }} style={{ accentColor: '#0A0A0A' }} />
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{m.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>{m.label}</div>
                          <div style={{ fontSize: '0.74rem', color: '#AAA', marginTop: 2 }}>{m.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div style={{ background: '#F8F8F8', borderRadius: 14, padding: '16px 18px', marginBottom: 24, border: '1px solid #F0F0F0' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#AAA', fontFamily: 'var(--font-sora)', marginBottom: 8, letterSpacing: 1 }}>LIVRAISON À</div>
                    <div style={{ fontSize: '0.86rem', color: '#555' }}><strong style={{ color: '#0A0A0A' }}>{form.prenom} {form.nom}</strong> · {form.telephone}</div>
                    <div style={{ fontSize: '0.8rem', color: '#AAA', marginTop: 4 }}>{form.adresse}</div>
                    <div style={{ fontSize: '0.8rem', color: '#1B5E20', marginTop: 4, fontWeight: 700 }}>{getLocationLabel(form.zone, form.ville)}</div>
                  </div>
                  {isKkiapayMethod && (
                    <div style={{ background: '#FFFBF0', color: '#8A5A00', border: '1px solid #F6D78B', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: '0.82rem', lineHeight: 1.6 }}>
                      Kkiapay ouvrira une fenêtre sécurisée pour finaliser le paiement par Mobile Money ou carte bancaire.
                    </div>
                  )}
                  {isKkiapayMethod && !isKkiapayConfigured && (
                    <div style={{ background: '#FFF0F0', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: '0.82rem', lineHeight: 1.6 }}>
                      Kkiapay n’est pas encore configuré sur cet environnement. Ajoute `NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY` avant d’activer ce mode de paiement.
                    </div>
                  )}
                  {isKkiapayMethod && isKkiapayConfigured && !kkiapayReady && (
                    <div style={{ background: '#F5F9FF', color: '#184A8B', border: '1px solid #C9DDF8', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: '0.82rem', lineHeight: 1.6 }}>
                      Chargement du module Kkiapay en cours...
                    </div>
                  )}
                  {paymentInfo && (
                    <div style={{ background: '#F5F9FF', color: '#184A8B', border: '1px solid #C9DDF8', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: '0.84rem', lineHeight: 1.6 }}>
                      {paymentInfo}
                    </div>
                  )}
                  {submitError && (
                    <div style={{ background: '#FFF0F0', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: '0.84rem', lineHeight: 1.6 }}>
                      {submitError}
                    </div>
                  )}

                  <button onClick={handleConfirm} disabled={loading || (isKkiapayMethod && !isKkiapayConfigured)} style={{ width: '100%', background: loading || (isKkiapayMethod && !isKkiapayConfigured) ? '#F0F0F0' : '#F9A825', color: loading || (isKkiapayMethod && !isKkiapayConfigured) ? '#AAA' : '#0A0A0A', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', cursor: loading || (isKkiapayMethod && !isKkiapayConfigured) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', boxShadow: loading || (isKkiapayMethod && !isKkiapayConfigured) ? 'none' : '0 8px 24px rgba(249,168,37,0.3)' }}>
                    {loading
                      ? '⏳ Traitement...'
                      : isKkiapayMethod && !isKkiapayConfigured
                        ? 'Kkiapay non configuré'
                      : isKkiapayMethod
                        ? `${draftOrder ? '↻ Relancer Kkiapay' : '✓ Payer avec Kkiapay'} · ${fmt(total)}`
                        : `✓ Confirmer · ${fmt(total)}`}
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
                      <Image src={item.img} alt={item.name} fill sizes="52px" style={{ objectFit: 'cover' }} />
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
                  <span>Sous-total</span>
                  <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{fmt(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#888' }}>
                  <span>Expédition {form.ville && `· ${selectedVille?.label}`}</span>
                  <span style={{ fontWeight: 600, color: '#0A0A0A' }}>
                    {!form.ville ? '—' : fmt(livraison)}
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
