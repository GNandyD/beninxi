'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminProductsPanel from '@/components/AdminProductsPanel';
import Navbar from '@/components/Navbar';
import OrderNotificationsPanel from '@/components/OrderNotificationsPanel';
import OrderTimeline from '@/components/OrderTimeline';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  getAdminOrderQuickActions,
  getLocationLabel,
  getOrderDeliveryFee,
  getOrderStatusLabel,
  getOrderSubtotal,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  orderStatusConfig,
  orderStatusFlow,
  orderStatuses,
  paymentStatusConfig,
  paymentStatuses,
} from '@/lib/orderUtils';

function fmt(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function formatOrderDate(value) {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [draftStatus, setDraftStatus] = useState('pending');
  const [draftPaymentStatus, setDraftPaymentStatus] = useState('pending');
  const [savingTarget, setSavingTarget] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('orders');

  const selectedOrder = useMemo(() => {
    if (!orders.length) return null;
    return orders.find(order => order.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);
  const quickActions = useMemo(() => (
    selectedOrder ? getAdminOrderQuickActions(selectedOrder) : []
  ), [selectedOrder]);

  const summary = useMemo(() => (
    orders.reduce((acc, order) => {
      acc.total += 1;
      acc.revenue += Number(order.total || 0);
      if (order.payment_status === 'paid') acc.paid += 1;
      if (order.payment_status === 'pending') acc.pendingPayments += 1;
      if (order.status === 'shipping') acc.shipping += 1;
      return acc;
    }, {
      total: 0,
      revenue: 0,
      paid: 0,
      pendingPayments: 0,
      shipping: 0,
    })
  ), [orders]);

  const isSaving = Boolean(savingTarget);

  const loadOrders = useCallback(async () => {
    if (!user) return;

    setLoadingOrders(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.push('/connexion');
        return;
      }

      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('payment_status', paymentFilter);

      const response = await fetch(`/api/admin/orders${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const payload = await response.json();
      if (response.status === 401) {
        router.push('/connexion');
        return;
      }
      if (response.status === 403) {
        setAccessDenied(true);
        setOrders([]);
        return;
      }
      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de charger les commandes.');
      }

      setAccessDenied(false);
      setOrders(payload.orders || []);
      setSelectedOrderId(currentSelectedId => (
        (payload.orders || []).some(order => order.id === currentSelectedId)
          ? currentSelectedId
          : payload.orders?.[0]?.id || null
      ));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les commandes.');
    } finally {
      setLoadingOrders(false);
    }
  }, [paymentFilter, router, searchQuery, statusFilter, user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/connexion');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(loadOrders, 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders, user]);

  useEffect(() => {
    if (!selectedOrder) return;
    setDraftStatus(selectedOrder.status || 'pending');
    setDraftPaymentStatus(selectedOrder.payment_status || 'pending');
  }, [selectedOrder]);

  async function saveOrder() {
    if (!selectedOrder) return;
    await updateOrder(
      {
        status: draftStatus,
        payment_status: draftPaymentStatus,
      },
      {
        savingKey: 'manual',
        successText: `Commande ${selectedOrder.order_number} mise a jour.`,
      }
    );
  }

  async function updateOrder(body, { savingKey, successText }) {
    if (!selectedOrder) return;

    setSavingTarget(savingKey);
    setError('');
    setSuccessMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.push('/connexion');
        return;
      }

      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de mettre a jour la commande.');
      }

      setOrders(currentOrders => currentOrders.map(order => (
        order.id === payload.order.id ? payload.order : order
      )));
      setSuccessMessage(successText);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible de mettre a jour la commande.');
    } finally {
      setSavingTarget('');
    }
  }

  async function runQuickAction(action) {
    if (!selectedOrder) return;

    await updateOrder(
      { action: action.id },
      {
        savingKey: action.id,
        successText: `${action.label} applique a ${selectedOrder.order_number}.`,
      }
    );
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  const inputStyle = {
    width: '100%',
    border: '1.5px solid #EAEAEA',
    borderRadius: 14,
    padding: '13px 16px',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'var(--font-dm)',
    color: '#0A0A0A',
    background: '#FAFAFA',
    boxSizing: 'border-box',
  };

  if (!user) return null;

  return (
    <main style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      <div style={{ padding: '28px clamp(16px, 4vw, 40px) 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', background: 'radial-gradient(circle at 88% 12%, rgba(249,168,37,0.2), transparent 28%), linear-gradient(135deg, #111 0%, #050505 100%)', borderRadius: 34, padding: 'clamp(28px, 5vw, 52px)', color: '#fff', boxShadow: '0 28px 80px rgba(0,0,0,0.18)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -70, bottom: -90, width: 240, height: 240, borderRadius: '50%', background: 'rgba(27,94,32,0.34)', filter: 'blur(6px)' }} />
          <div style={{ position: 'relative', fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginBottom: 14, fontFamily: 'var(--font-sora)', letterSpacing: 2 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Accueil</Link> › Admin
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 22, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', background: 'rgba(249,168,37,0.14)', color: '#F9A825', border: '1px solid rgba(249,168,37,0.22)', borderRadius: 999, padding: '7px 12px', fontSize: '0.72rem', fontWeight: 900, fontFamily: 'var(--font-sora)', marginBottom: 14 }}>
                BéninXi Control
              </div>
              <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 950, fontSize: 'clamp(2.1rem, 5vw, 4.5rem)', lineHeight: 0.98, color: '#fff', letterSpacing: -2.4, margin: 0 }}>
                {activeAdminTab === 'products' ? 'Gestion du catalogue' : 'Tableau de bord commandes'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.98rem', maxWidth: 650, lineHeight: 1.75, margin: '18px 0 0' }}>
                {activeAdminTab === 'products'
                  ? 'Ajoute, ajuste et rends indisponibles les produits affichés sur le web et le mobile.'
                  : 'Suivi des commandes, verification des paiements et mise a jour des statuts depuis une seule page.'}
              </p>
            </div>
            <div style={{ minWidth: 220, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 28, padding: 20, backdropFilter: 'blur(18px)' }}>
              <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: '0.72rem', fontWeight: 900, letterSpacing: 1.4, fontFamily: 'var(--font-sora)', marginBottom: 10 }}>SESSION ADMIN</div>
              <div style={{ color: '#fff', fontWeight: 950, marginBottom: 4 }}>{user?.user_metadata?.prenom || 'Admin'} {user?.user_metadata?.nom || ''}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              {activeAdminTab === 'orders' && (
                <button onClick={loadOrders} style={{ width: '100%', marginTop: 18, background: '#F9A825', color: '#0A0A0A', border: 'none', borderRadius: 999, padding: '12px 18px', fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-sora)' }}>
                  Actualiser
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 56px' }}>
        {accessDenied ? (
          <div style={{ background: '#fff', borderRadius: 30, padding: '38px 34px', border: '1px solid #E7E7EC', boxShadow: '0 22px 60px rgba(0,0,0,0.08)', maxWidth: 720 }}>
            <div style={{ display: 'inline-flex', width: 48, height: 48, borderRadius: 18, background: '#111', color: '#F9A825', alignItems: 'center', justifyContent: 'center', fontWeight: 950, marginBottom: 16 }}>BX</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.2rem', color: '#0A0A0A', marginBottom: 10 }}>
              Acces administrateur requis
            </h2>
            <p style={{ color: '#666', lineHeight: 1.7, fontSize: '0.92rem' }}>
              Cette page attend soit un role `admin` dans Supabase, soit un drapeau `is_admin`, soit un email liste dans `ADMIN_EMAILS`.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', marginBottom: 22, background: '#fff', border: '1px solid #E7E7EC', borderRadius: 999, padding: 6, boxShadow: '0 18px 44px rgba(0,0,0,0.05)' }}>
              {[
                { id: 'orders', label: 'Commandes' },
                { id: 'products', label: 'Produits' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  style={{ background: activeAdminTab === tab.id ? '#111' : 'transparent', color: activeAdminTab === tab.id ? '#fff' : '#77777F', border: 0, borderRadius: 999, padding: '11px 18px', fontWeight: 900, fontFamily: 'var(--font-sora)', cursor: 'pointer', boxShadow: activeAdminTab === tab.id ? '0 10px 24px rgba(0,0,0,0.16)' : 'none' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeAdminTab === 'products' ? (
              <AdminProductsPanel />
            ) : (
              <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Commandes chargees', value: summary.total, tone: '#0A0A0A', bg: '#fff' },
                { label: 'Paiements valides', value: summary.paid, tone: '#1B5E20', bg: '#F0FAF0' },
                { label: 'Paiements en attente', value: summary.pendingPayments, tone: '#8A5A00', bg: '#FFFBF0' },
                { label: 'Chiffre charge', value: fmt(summary.revenue), tone: '#C62828', bg: '#FFF5F5' },
              ].map(card => (
                <div key={card.label} style={{ background: card.bg, borderRadius: 28, padding: '22px 24px', border: '1px solid #E7E7EC', boxShadow: '0 18px 44px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9A9AA1', fontWeight: 900, fontFamily: 'var(--font-sora)', letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' }}>{card.label}</div>
                  <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 950, fontSize: '1.5rem', color: card.tone, letterSpacing: -0.7 }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 28, padding: 18, border: '1px solid #E7E7EC', boxShadow: '0 18px 44px rgba(0,0,0,0.05)', marginBottom: 20 }}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, alignItems: 'center' }}>
                <input
                  value={searchInput}
                  onChange={event => setSearchInput(event.target.value)}
                  placeholder="Recherche par numero, client, telephone, email..."
                  style={inputStyle}
                />
                <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} style={inputStyle}>
                  <option value="all">Tous les statuts</option>
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
                  ))}
                </select>
                <select value={paymentFilter} onChange={event => setPaymentFilter(event.target.value)} style={inputStyle}>
                  <option value="all">Tous les paiements</option>
                  {paymentStatuses.map(status => (
                    <option key={status} value={status}>{getPaymentStatusLabel(status)}</option>
                  ))}
                </select>
                <button type="submit" style={{ background: '#0A0A0A', color: '#fff', border: 'none', borderRadius: 16, padding: '14px 20px', fontWeight: 900, fontFamily: 'var(--font-sora)', cursor: 'pointer' }}>
                  Filtrer
                </button>
              </form>
            </div>

            {error && (
              <div style={{ background: '#FFF0F0', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: 16, padding: '14px 16px', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div style={{ background: '#F0FAF0', color: '#1B5E20', border: '1px solid #CDE8CF', borderRadius: 16, padding: '14px 16px', marginBottom: 20, fontSize: '0.9rem', lineHeight: 1.6 }}>
                {successMessage}
              </div>
            )}

            {loadingOrders ? (
              <div style={{ background: '#fff', borderRadius: 30, padding: '80px 24px', border: '1px solid #E7E7EC', textAlign: 'center', boxShadow: '0 18px 44px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #F0F0F0', borderTop: '3px solid #1B5E20', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ color: '#888' }}>Chargement des commandes...</div>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 30, padding: '80px 24px', border: '1px solid #E7E7EC', textAlign: 'center', boxShadow: '0 18px 44px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'inline-flex', width: 54, height: 54, borderRadius: 20, background: '#111', color: '#F9A825', alignItems: 'center', justifyContent: 'center', fontWeight: 950, marginBottom: 16 }}>0</div>
                <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.15rem', color: '#0A0A0A', marginBottom: 8 }}>
                  Aucune commande trouvee
                </h2>
                <p style={{ color: '#888' }}>Essaie un autre filtre ou recharge la liste.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.map(order => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      style={{
                        background: selectedOrder?.id === order.id ? '#111' : '#fff',
                        color: selectedOrder?.id === order.id ? '#fff' : '#111',
                        borderRadius: 26,
                        padding: '20px 22px',
                        border: `1.5px solid ${selectedOrder?.id === order.id ? '#111' : '#E7E7EC'}`,
                        boxShadow: selectedOrder?.id === order.id ? '0 20px 50px rgba(0,0,0,0.16)' : '0 14px 34px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, color: selectedOrder?.id === order.id ? '#fff' : '#0A0A0A', fontSize: '0.92rem', marginBottom: 4 }}>
                            {order.order_number}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: selectedOrder?.id === order.id ? 'rgba(255,255,255,0.55)' : '#888' }}>
                            {order.customer_name} · {formatOrderDate(order.created_at)}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 900, color: selectedOrder?.id === order.id ? '#F9A825' : '#1B5E20', fontSize: '0.9rem', flexShrink: 0 }}>
                          {fmt(order.total)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{ background: orderStatusConfig[order.status]?.bg || '#F5F5F5', color: orderStatusConfig[order.status]?.color || '#666', padding: '6px 12px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-sora)' }}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                        <span style={{ background: paymentStatusConfig[order.payment_status]?.bg || '#F5F5F5', color: paymentStatusConfig[order.payment_status]?.color || '#666', padding: '6px 12px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-sora)' }}>
                          {getPaymentStatusLabel(order.payment_status)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: selectedOrder?.id === order.id ? 'rgba(255,255,255,0.62)' : '#666', lineHeight: 1.6 }}>
                        {order.customer_phone}
                        {order.ville ? ` · ${getLocationLabel(order.zone, order.ville)}` : ''}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedOrder && (
                  <div style={{ background: '#fff', borderRadius: 32, padding: '28px', border: '1px solid #E7E7EC', boxShadow: '0 24px 70px rgba(0,0,0,0.08)', position: 'sticky', top: 98 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                      <div>
                        <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.2rem', color: '#0A0A0A', marginBottom: 6 }}>
                          {selectedOrder.order_number}
                        </h2>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                          {selectedOrder.customer_name} · {formatOrderDate(selectedOrder.created_at)}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#1B5E20' }}>
                        {fmt(selectedOrder.total)}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#888', marginBottom: 6, fontFamily: 'var(--font-sora)', fontWeight: 700 }}>
                          Statut commande
                        </label>
                        <select value={draftStatus} onChange={event => setDraftStatus(event.target.value)} style={inputStyle}>
                          {orderStatuses.map(status => (
                            <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: '#888', marginBottom: 6, fontFamily: 'var(--font-sora)', fontWeight: 700 }}>
                          Statut paiement
                        </label>
                        <select value={draftPaymentStatus} onChange={event => setDraftPaymentStatus(event.target.value)} style={inputStyle}>
                          {paymentStatuses.map(status => (
                            <option key={status} value={status}>{getPaymentStatusLabel(status)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {quickActions.length > 0 && (
                      <div style={{ marginBottom: 18 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0A0A0A', marginBottom: 12, fontFamily: 'var(--font-sora)' }}>
                          Actions rapides
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {quickActions.map(action => (
                            <button
                              key={action.id}
                              onClick={() => runQuickAction(action)}
                              disabled={isSaving}
                              style={{
                                background: isSaving && savingTarget !== action.id ? '#F5F5F5' : action.bg,
                                color: isSaving && savingTarget !== action.id ? '#AAA' : action.color,
                                border: `1px solid ${isSaving && savingTarget !== action.id ? '#EAEAEA' : action.border}`,
                                borderRadius: 14,
                                padding: '12px 14px',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                minWidth: 172,
                                textAlign: 'left',
                              }}
                            >
                              <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.8rem', marginBottom: 4 }}>
                                {savingTarget === action.id ? 'Traitement...' : action.label}
                              </div>
                              <div style={{ fontSize: '0.72rem', lineHeight: 1.5, opacity: 0.86 }}>
                                {action.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={saveOrder} disabled={isSaving} style={{ width: '100%', background: isSaving ? '#E9E9E9' : '#0A0A0A', color: isSaving ? '#888' : '#fff', border: 'none', borderRadius: 14, padding: '14px 18px', fontWeight: 800, fontFamily: 'var(--font-sora)', cursor: isSaving ? 'not-allowed' : 'pointer', marginBottom: 22 }}>
                      {savingTarget === 'manual' ? 'Mise a jour...' : 'Sauvegarder les statuts'}
                    </button>

                    <div style={{ background: '#F8F8F8', borderRadius: 16, padding: '18px 18px', marginBottom: 18 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0A0A0A', marginBottom: 14, fontFamily: 'var(--font-sora)' }}>
                        Suivi logistique
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        {orderStatusFlow.map((status, index) => {
                          const currentIndex = orderStatusFlow.indexOf(selectedOrder.status);
                          const done = index <= currentIndex;

                          return (
                            <div key={status} style={{ display: 'flex', alignItems: 'center', flex: index < orderStatusFlow.length - 1 ? 1 : 'none' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: done ? '#1B5E20' : '#EDEDED', color: done ? '#fff' : '#BBB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800 }}>
                                  {done ? '✓' : index + 1}
                                </div>
                                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: done ? '#1B5E20' : '#AAA', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                  {getOrderStatusLabel(status)}
                                </div>
                              </div>
                              {index < orderStatusFlow.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: done && index < currentIndex ? '#1B5E20' : '#EDEDED', margin: '0 4px', marginBottom: 22 }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <OrderTimeline
                        events={selectedOrder.order_events}
                        title="Historique d’activité"
                        emptyMessage="Aucun événement n’a encore été enregistré sur cette commande."
                      />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <OrderNotificationsPanel
                        notifications={selectedOrder.order_notifications}
                        title="Notifications client"
                        emptyMessage="Aucune notification n’a encore été enregistrée pour cette commande."
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                      <div style={{ background: '#F8F8F8', borderRadius: 16, padding: '16px 18px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, fontFamily: 'var(--font-sora)', marginBottom: 8 }}>CLIENT</div>
                        <div style={{ fontWeight: 700, color: '#0A0A0A', marginBottom: 4 }}>{selectedOrder.customer_name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.6 }}>{selectedOrder.customer_phone}</div>
                        {selectedOrder.customer_email && (
                          <div style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.6 }}>{selectedOrder.customer_email}</div>
                        )}
                      </div>
                      <div style={{ background: '#F8F8F8', borderRadius: 16, padding: '16px 18px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 700, fontFamily: 'var(--font-sora)', marginBottom: 8 }}>PAIEMENT</div>
                        <div style={{ fontWeight: 700, color: '#0A0A0A', marginBottom: 4 }}>{getPaymentMethodLabel(selectedOrder.payment_method)}</div>
                        <div style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.6 }}>{getPaymentStatusLabel(selectedOrder.payment_status)}</div>
                        {selectedOrder.payment_reference && (
                          <div style={{ fontSize: '0.74rem', color: '#999', marginTop: 6 }}>Ref: {selectedOrder.payment_reference}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ background: '#FFF8E1', borderRadius: 16, padding: '16px 18px', marginBottom: 18 }}>
                      <div style={{ fontSize: '0.72rem', color: '#8A5A00', fontWeight: 700, fontFamily: 'var(--font-sora)', marginBottom: 8 }}>LIVRAISON</div>
                      <div style={{ fontWeight: 700, color: '#0A0A0A', marginBottom: 4 }}>{selectedOrder.address}</div>
                      <div style={{ fontSize: '0.82rem', color: '#8A5A00', lineHeight: 1.6 }}>
                        {getLocationLabel(selectedOrder.zone, selectedOrder.ville)}
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 12, fontFamily: 'var(--font-sora)' }}>
                        Articles commandes
                      </div>
                      {(selectedOrder.items || []).map((item, index) => (
                        <div key={`${item.id}-${index}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
                          <div style={{ width: 54, height: 54, borderRadius: 12, overflow: 'hidden', background: '#F8F8F8', position: 'relative', flexShrink: 0 }}>
                            <Image src={item.img} alt={item.name} fill sizes="54px" style={{ objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0A0A0A' }}>{item.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#888', marginTop: 2 }}>
                              Qte: {item.qty} · {item.size || 'Standard'} · {item.color || 'Standard'}
                            </div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.85rem', color: '#0A0A0A', flexShrink: 0 }}>
                            {fmt(Number(item.price || 0) * Number(item.qty || 0))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: '#F0FAF0', borderRadius: 18, padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: 8 }}>
                        <span>Sous-total</span>
                        <span>{fmt(getOrderSubtotal(selectedOrder))}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: 8 }}>
                        <span>Livraison</span>
                        <span>{fmt(getOrderDeliveryFee(selectedOrder))}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(27,94,32,0.12)' }}>
                        <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, color: '#0A0A0A' }}>Total</span>
                        <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, color: '#1B5E20', fontSize: '1.02rem' }}>{fmt(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
