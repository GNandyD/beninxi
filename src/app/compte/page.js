'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { supabase } from '@/lib/supabase';

function fmt(p) { return p?.toLocaleString('fr-FR') + ' FCFA'; }

const statusConfig = {
  pending:    { label: 'En attente',    color: '#F57F17', bg: '#FFFDE7' },
  confirmed:  { label: 'Confirmée',     color: '#1B5E20', bg: '#F0FAF0' },
  shipping:   { label: 'En livraison',  color: '#0066CC', bg: '#E3F2FD' },
  delivered:  { label: 'Livrée',        color: '#1B5E20', bg: '#F0FAF0' },
  cancelled:  { label: 'Annulée',       color: '#C62828', bg: '#FFF0F0' },
};

export default function ComptePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { favorites } = useFavorites();
  const [activeTab, setActiveTab] = useState('commandes');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [profile, setProfile] = useState({
    prenom: '', nom: '', telephone: '', email: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [addresses, setAddresses] = useState([
    { id: 1, label: 'Domicile', adresse: '', zone: 'cotonou_centre', default: true },
  ]);
  const [newAddress, setNewAddress] = useState({ label: '', adresse: '', zone: 'cotonou_centre' });
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/connexion'); return; }
    setProfile({
      prenom:    user.user_metadata?.prenom    || '',
      nom:       user.user_metadata?.nom       || '',
      telephone: user.user_metadata?.telephone || '',
      email:     user.email || '',
    });
    loadOrders();
  }, [user]);

  async function loadOrders() {
    setLoadingOrders(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', user?.user_metadata?.telephone || '')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoadingOrders(false);
  }

  async function saveProfile() {
    setSavingProfile(true);
    await supabase.auth.updateUser({
      data: { prenom: profile.prenom, nom: profile.nom, telephone: profile.telephone, full_name: `${profile.prenom} ${profile.nom}` }
    });
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid #F0F0F0', borderRadius: 12, padding: '13px 16px',
    fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-dm)', color: '#0A0A0A',
    background: '#FAFAFA', boxSizing: 'border-box',
  };

  const tabs = [
    { id: 'commandes', label: '📦 Commandes', count: orders.length },
    { id: 'favoris',   label: '❤️ Favoris',   count: favorites.length },
    { id: 'adresses',  label: '📍 Adresses',   count: addresses.length },
    { id: 'profil',    label: '⚙️ Profil',     count: null },
  ];

  if (!user) return null;

  return (
    <main style={{ background: '#F8F8F8', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: '#0A0A0A', padding: '48px 40px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: 14, fontFamily: 'var(--font-sora)', letterSpacing: 2 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Accueil</Link> › Mon compte
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
              👤
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.6rem', color: '#fff', letterSpacing: -0.5, marginBottom: 4 }}>
                {user.user_metadata?.prenom} {user.user_metadata?.nom}
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{user.email}</div>
            </div>
            <button onClick={() => { signOut(); router.push('/'); }} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 50, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-sora)' }}>
              🚪 Déconnexion
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 32, flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 20px', borderRadius: 50, border: `1.5px solid ${activeTab === t.id ? '#F9A825' : 'rgba(255,255,255,0.12)'}`, background: activeTab === t.id ? '#F9A825' : 'transparent', color: activeTab === t.id ? '#0A0A0A' : 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sora)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{ background: activeTab === t.id ? '#0A0A0A' : 'rgba(255,255,255,0.2)', color: activeTab === t.id ? '#F9A825' : '#fff', fontSize: '0.65rem', padding: '1px 7px', borderRadius: 50, fontWeight: 800 }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 40px' }}>

        {/* ═══ COMMANDES ═══ */}
        {activeTab === 'commandes' && (
          <div>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ width: 40, height: 40, border: '3px solid #F0F0F0', borderTop: '3px solid #1B5E20', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, border: '1px solid #F0F0F0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📦</div>
                <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.2rem', color: '#0A0A0A', marginBottom: 8 }}>Aucune commande</h3>
                <p style={{ color: '#AAA', fontSize: '0.88rem', marginBottom: 24 }}>Vous n'avez pas encore passé de commande</p>
                <Link href="/catalogue" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem', display: 'inline-block' }}>
                  Découvrir les produits →
                </Link>
              </div>
            ) : selectedOrder ? (
              /* Détail commande */
              <div>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.85rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-dm)' }}>
                  ← Retour aux commandes
                </button>
                <div style={{ background: '#fff', borderRadius: 24, padding: '32px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.2rem', color: '#0A0A0A', marginBottom: 6 }}>
                        Commande #{selectedOrder.id?.toString().slice(-8).toUpperCase()}
                      </h2>
                      <div style={{ fontSize: '0.8rem', color: '#AAA' }}>
                        {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ background: statusConfig[selectedOrder.status]?.bg || '#F5F5F5', color: statusConfig[selectedOrder.status]?.color || '#666', padding: '8px 18px', borderRadius: 50, fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-sora)' }}>
                      {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                    </div>
                  </div>

                  {/* Suivi */}
                  <div style={{ background: '#F8F8F8', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 16, fontFamily: 'var(--font-sora)' }}>Suivi de commande</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      {['pending','confirmed','shipping','delivered'].map((s, i) => {
                        const statuses = ['pending','confirmed','shipping','delivered'];
                        const currentIdx = statuses.indexOf(selectedOrder.status);
                        const done = i <= currentIdx;
                        return (
                          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#1B5E20' : '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: done ? '#fff' : '#CCC', transition: 'all 0.3s' }}>
                                {done ? '✓' : i + 1}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: done ? '#1B5E20' : '#AAA', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                {statusConfig[s]?.label}
                              </div>
                            </div>
                            {i < 3 && <div style={{ flex: 1, height: 2, background: done && i < currentIdx ? '#1B5E20' : '#F0F0F0', margin: '0 4px', marginBottom: 22, transition: 'all 0.3s' }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Produits */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 14, fontFamily: 'var(--font-sora)' }}>Articles commandés</div>
                    {(selectedOrder.items || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: '#F8F8F8', flexShrink: 0 }}>
                          <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0A0A0A' }}>{item.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#AAA', marginTop: 2 }}>Qté : {item.qty}</div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.9rem', color: '#0A0A0A' }}>{fmt(item.price * item.qty)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Total + Livraison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ background: '#F8F8F8', borderRadius: 14, padding: '16px 20px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#AAA', marginBottom: 8, fontFamily: 'var(--font-sora)' }}>LIVRAISON</div>
                      <div style={{ fontSize: '0.88rem', color: '#0A0A0A', fontWeight: 600 }}>{selectedOrder.address}</div>
                      <div style={{ fontSize: '0.78rem', color: '#AAA', marginTop: 4 }}>{selectedOrder.zone}</div>
                    </div>
                    <div style={{ background: '#F0FAF0', borderRadius: 14, padding: '16px 20px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#AAA', marginBottom: 8, fontFamily: 'var(--font-sora)' }}>TOTAL PAYÉ</div>
                      <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.3rem', color: '#1B5E20' }}>{fmt(selectedOrder.total)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#AAA', marginTop: 4 }}>{selectedOrder.payment_method}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Liste commandes */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map(order => (
                  <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ background: '#fff', borderRadius: 18, padding: '20px 24px', border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', transition: 'box-shadow 0.2s' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F8F8F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📦</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)', marginBottom: 4 }}>
                        Commande #{order.id?.toString().slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#AAA' }}>
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · {(order.items || []).length} article(s)
                      </div>
                    </div>
                    <div style={{ background: statusConfig[order.status]?.bg || '#F5F5F5', color: statusConfig[order.status]?.color || '#666', padding: '6px 14px', borderRadius: 50, fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--font-sora)', flexShrink: 0 }}>
                      {statusConfig[order.status]?.label || order.status}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1rem', color: '#0A0A0A', flexShrink: 0 }}>{fmt(order.total)}</div>
                    <div style={{ color: '#CCC', fontSize: '1rem' }}>›</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ FAVORIS ═══ */}
        {activeTab === 'favoris' && (
          <div>
            {favorites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, border: '1px solid #F0F0F0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🤍</div>
                <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.2rem', color: '#0A0A0A', marginBottom: 8 }}>Aucun favori</h3>
                <p style={{ color: '#AAA', fontSize: '0.88rem', marginBottom: 24 }}>Cliquez sur ❤️ sur un produit pour le sauvegarder</p>
                <Link href="/catalogue" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem', display: 'inline-block' }}>
                  Voir le catalogue →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {favorites.map(p => (
                  <Link key={p.id} href={`/produit/${p.id}`} style={{ textDecoration: 'none', background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #F0F0F0', display: 'block', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ height: 200, overflow: 'hidden', background: '#F8F8F8' }}>
                      <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0A0A0A', marginBottom: 6 }}>{p.name}</div>
                      <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.95rem', color: '#1B5E20' }}>{fmt(p.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ADRESSES ═══ */}
        {activeTab === 'adresses' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
              {addresses.map(a => (
                <div key={a.id} style={{ background: '#fff', borderRadius: 18, padding: '22px', border: `2px solid ${a.default ? '#1B5E20' : '#F0F0F0'}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.9rem', color: '#0A0A0A' }}>📍 {a.label}</div>
                    {a.default && <span style={{ background: '#F0FAF0', color: '#1B5E20', padding: '3px 10px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700 }}>Par défaut</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>{a.adresse || 'Adresse non renseignée'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#AAA', marginTop: 6 }}>{a.zone}</div>
                </div>
              ))}

              {/* Ajouter adresse */}
              {!addingAddress ? (
                <button onClick={() => setAddingAddress(true)} style={{ background: '#F8F8F8', borderRadius: 18, padding: '22px', border: '2px dashed #E0E0E0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 120 }}>
                  <span style={{ fontSize: '1.5rem' }}>+</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#AAA', fontFamily: 'var(--font-sora)' }}>Ajouter une adresse</span>
                </button>
              ) : (
                <div style={{ background: '#fff', borderRadius: 18, padding: '22px', border: '2px solid #F9A825', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '0.88rem', color: '#0A0A0A', marginBottom: 14 }}>Nouvelle adresse</div>
                  <input placeholder="Label (ex: Domicile, Bureau...)" value={newAddress.label} onChange={e => setNewAddress(a => ({ ...a, label: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
                  <input placeholder="Adresse complète" value={newAddress.adresse} onChange={e => setNewAddress(a => ({ ...a, adresse: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
                  <select value={newAddress.zone} onChange={e => setNewAddress(a => ({ ...a, zone: e.target.value }))} style={{ ...inputStyle, marginBottom: 14 }}>
                    <option value="cotonou_centre">Cotonou Centre</option>
                    <option value="grand_cotonou">Grand Cotonou</option>
                    <option value="porto_novo">Porto-Novo</option>
                    <option value="parakou">Parakou</option>
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setAddresses(prev => [...prev, { ...newAddress, id: Date.now(), default: false }]); setAddingAddress(false); setNewAddress({ label: '', adresse: '', zone: 'cotonou_centre' }); }} style={{ flex: 1, background: '#0A0A0A', color: '#fff', border: 'none', padding: '10px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sora)', fontSize: '0.82rem' }}>
                      Sauvegarder
                    </button>
                    <button onClick={() => setAddingAddress(false)} style={{ padding: '10px 16px', background: '#F5F5F5', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#666', fontWeight: 600 }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ PROFIL ═══ */}
        {activeTab === 'profil' && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ background: '#fff', borderRadius: 24, padding: '32px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.1rem', color: '#0A0A0A', marginBottom: 24 }}>⚙️ Mon profil</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Prénom</label>
                  <input value={profile.prenom} onChange={e => setProfile(p => ({ ...p, prenom: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Nom</label>
                  <input value={profile.nom} onChange={e => setProfile(p => ({ ...p, nom: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Téléphone</label>
                <input value={profile.telephone} onChange={e => setProfile(p => ({ ...p, telephone: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Email</label>
                <input value={profile.email} disabled style={{ ...inputStyle, background: '#F5F5F5', color: '#AAA' }} />
                <div style={{ fontSize: '0.72rem', color: '#CCC', marginTop: 4 }}>L'email ne peut pas être modifié</div>
              </div>
              <button onClick={saveProfile} disabled={savingProfile} style={{ width: '100%', background: profileSaved ? '#1B5E20' : '#0A0A0A', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontWeight: 800, fontSize: '0.92rem', cursor: savingProfile ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', opacity: savingProfile ? 0.7 : 1, transition: 'all 0.3s' }}>
                {profileSaved ? '✓ Profil sauvegardé !' : savingProfile ? '⏳ Sauvegarde...' : 'Sauvegarder le profil'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
