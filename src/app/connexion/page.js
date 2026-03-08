'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ConnexionPage() {
  const [tab, setTab]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [login, setLogin] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ prenom: '', nom: '', telephone: '', email: '', password: '', confirm: '' });

  function handleLogin(e) { setLogin(f => ({ ...f, [e.target.name]: e.target.value })); }
  function handleSignup(e) { setSignup(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function submitLogin(e) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(true);
    setLoading(false);
  }

  async function submitSignup(e) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(true);
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

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 24px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '2rem', letterSpacing: -0.5 }}>
              <span style={{ color: '#1B5E20' }}>BÉNIN</span><span style={{ color: '#C62828' }}>XI</span>
            </div>
            <div style={{ fontSize: '0.6rem', letterSpacing: 3, color: '#AAA', marginTop: 2, fontWeight: 700 }}>LE MARCHÉ DU BÉNIN</div>
          </Link>
        </div>

        {success ? (
          <div style={{ background: '#fff', borderRadius: 24, padding: '48px 36px', textAlign: 'center', border: '1px solid #F0F0F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0FAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.4rem', color: '#0A0A0A', marginBottom: 10 }}>
              {tab === 'login' ? 'Connexion réussie !' : 'Compte créé !'}
            </h2>
            <p style={{ color: '#AAA', fontSize: '0.88rem', marginBottom: 28, lineHeight: 1.7 }}>
              {tab === 'login' ? 'Bienvenue sur BéninXi. Vous êtes maintenant connecté.' : 'Votre compte a été créé avec succès. Bienvenue !'}
            </p>
            <Link href="/" style={{ background: '#0A0A0A', color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 50, fontWeight: 700, fontFamily: 'var(--font-sora)', fontSize: '0.88rem', display: 'inline-block' }}>
              Découvrir les produits →
            </Link>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #F0F0F0' }}>
              {[{ id: 'login', label: 'Se connecter' }, { id: 'signup', label: 'Créer un compte' }].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '18px', border: 'none', background: tab === t.id ? '#fff' : '#FAFAFA', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', color: tab === t.id ? '#0A0A0A' : '#AAA', borderBottom: `2px solid ${tab === t.id ? '#0A0A0A' : 'transparent'}`, marginBottom: -1, transition: 'all 0.2s' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '32px' }}>

              {/* Social login */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {[
                  { icon: '📘', label: 'Facebook', bg: '#1877F2', color: '#fff' },
                  { icon: '🔵', label: 'Google',   bg: '#fff',    color: '#0A0A0A', border: '1.5px solid #F0F0F0' },
                ].map(s => (
                  <button key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: s.bg, color: s.color, border: s.border || 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-dm)', transition: 'opacity 0.2s' }}>
                    <span>{s.icon}</span> {s.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
                <span style={{ fontSize: '0.75rem', color: '#CCC', fontWeight: 600 }}>ou</span>
                <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
              </div>

              {/* LOGIN */}
              {tab === 'login' && (
                <form onSubmit={submitLogin}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Email ou téléphone</label>
                    <input name="email" value={login.email} onChange={handleLogin} placeholder="votre@email.com" required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>Mot de passe</label>
                      <span style={{ fontSize: '0.75rem', color: '#1B5E20', fontWeight: 600, cursor: 'pointer' }}>Oublié ?</span>
                    </div>
                    <input name="password" type="password" value={login.password} onChange={handleLogin} placeholder="••••••••" required style={inputStyle} />
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', background: '#0A0A0A', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontWeight: 800, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', letterSpacing: 0.3 }}>
                    {loading ? '⏳ Connexion...' : 'Se connecter →'}
                  </button>
                </form>
              )}

              {/* SIGNUP */}
              {tab === 'signup' && (
                <form onSubmit={submitSignup}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Prénom *</label>
                      <input name="prenom" value={signup.prenom} onChange={handleSignup} placeholder="Kofi" required style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Nom *</label>
                      <input name="nom" value={signup.nom} onChange={handleSignup} placeholder="Adjovi" required style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Téléphone *</label>
                    <input name="telephone" value={signup.telephone} onChange={handleSignup} placeholder="+229 97 00 00 00" required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Email</label>
                    <input name="email" value={signup.email} onChange={handleSignup} placeholder="votre@email.com" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Mot de passe *</label>
                    <input name="password" type="password" value={signup.password} onChange={handleSignup} placeholder="••••••••" required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Confirmer le mot de passe *</label>
                    <input name="confirm" type="password" value={signup.confirm} onChange={handleSignup} placeholder="••••••••" required style={inputStyle} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#AAA', marginBottom: 20, lineHeight: 1.6 }}>
                    En créant un compte, vous acceptez nos <span style={{ color: '#1B5E20', fontWeight: 600 }}>Conditions d'utilisation</span> et notre <span style={{ color: '#1B5E20', fontWeight: 600 }}>Politique de confidentialité</span>.
                  </p>
                  <button type="submit" disabled={loading} style={{ width: '100%', background: '#0A0A0A', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontWeight: 800, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', letterSpacing: 0.3 }}>
                    {loading ? '⏳ Création...' : 'Créer mon compte →'}
                  </button>
                </form>
              )}

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#AAA', marginTop: 20 }}>
                {tab === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
                <span onClick={() => setTab(tab === 'login' ? 'signup' : 'login')} style={{ color: '#1B5E20', fontWeight: 700, cursor: 'pointer' }}>
                  {tab === 'login' ? 'Créer un compte' : 'Se connecter'}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Sécurité */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {['🔒 Sécurisé', '✓ Données protégées', '🇧🇯 Made in Bénin'].map(item => (
            <span key={item} style={{ fontSize: '0.72rem', color: '#CCC', fontWeight: 600 }}>{item}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
