'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ConnexionPage() {
  const router = useRouter();
  const { signInEmail, signUpEmail, user } = useAuth();

  const [tab, setTab]         = useState('login');
  const [method, setMethod]   = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [login, setLogin]   = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ prenom: '', nom: '', telephone: '', email: '', password: '', confirm: '' });

  if (user) router.push('/');

  const inputStyle = {
    width: '100%', border: '1.5px solid #EBEBEB', borderRadius: 14, padding: '15px 18px',
    fontSize: '0.94rem', outline: 'none', fontFamily: 'var(--font-dm)', color: '#0A0A0A',
    background: '#FAFAFA', transition: 'all 0.2s', boxSizing: 'border-box',
  };

  async function submitLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInEmail({ email: login.email, password: login.password });
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setError('Email ou mot de passe incorrect.');
    }
    setLoading(false);
  }

  async function submitSignup(e) {
    e.preventDefault();
    setError('');
    if (signup.password !== signup.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (signup.password.length < 6) { setError('Mot de passe minimum 6 caractères.'); return; }
    setLoading(true);
    try {
      await signUpEmail({ email: signup.email, password: signup.password, prenom: signup.prenom, nom: signup.nom, telephone: signup.telephone });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8F8F8', fontFamily: 'var(--font-dm)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      {/* Background décoratif */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 20% 20%, rgba(27,94,32,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(198,40,40,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Image src="/logo.png" alt="BéninXi" width={160} height={64} style={{ height: 64, width: 'auto', objectFit: 'contain' }} />
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.6rem', letterSpacing: -0.5 }}>
              <span style={{ color: '#1B5E20' }}>BÉNIN</span><span style={{ color: '#C62828' }}>XI</span>
            </div>
            <div style={{ fontSize: '0.58rem', letterSpacing: 3, color: '#BBB', fontWeight: 700 }}>LE MARCHÉ DU BÉNIN</div>
          </Link>
        </div>

        {success ? (
          <div style={{ background: '#fff', borderRadius: 28, padding: '52px 40px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #F0F0F0', animation: 'scaleIn 0.3s ease' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#F0FAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 800, fontSize: '1.5rem', color: '#0A0A0A', marginBottom: 10 }}>
              {tab === 'login' ? 'Connexion réussie !' : 'Compte créé !'}
            </h2>
            <p style={{ color: '#AAA', fontSize: '0.88rem', lineHeight: 1.7 }}>
              {tab === 'signup' ? 'Vérifiez votre email pour confirmer votre compte.' : 'Redirection en cours...'}
            </p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 28, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #F0F0F0' }}>

            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F8F8F8', padding: 6, margin: '20px 20px 0', borderRadius: 16, gap: 4 }}>
              {[{ id: 'login', label: 'Se connecter' }, { id: 'signup', label: 'Créer un compte' }].map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setError(''); }} style={{ padding: '12px', border: 'none', background: tab === t.id ? '#fff' : 'transparent', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', color: tab === t.id ? '#0A0A0A' : '#AAA', borderRadius: 12, transition: 'all 0.2s', boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '28px 32px 36px' }}>

              {/* Erreur */}
              {error && (
                <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: '0.82rem', color: '#C62828', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeUp 0.3s ease' }}>
                  ⚠️ {error}
                </div>
              )}

              {/* LOGIN */}
              {tab === 'login' && (
                <form onSubmit={submitLogin}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>EMAIL</label>
                    <input
                      name="email" type="email" value={login.email}
                      onChange={e => setLogin(f => ({ ...f, email: e.target.value }))}
                      placeholder="votre@email.com" required style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#1B5E20'}
                      onBlur={e => e.target.style.borderColor = '#EBEBEB'}
                    />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>MOT DE PASSE</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        name="password" type={showPass ? 'text' : 'password'} value={login.password}
                        onChange={e => setLogin(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••" required style={{ ...inputStyle, paddingRight: 48 }}
                        onFocus={e => e.target.style.borderColor = '#1B5E20'}
                        onBlur={e => e.target.style.borderColor = '#EBEBEB'}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#AAA' }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginBottom: 24 }}>
                    <span style={{ fontSize: '0.78rem', color: '#1B5E20', fontWeight: 700, cursor: 'pointer' }}>Mot de passe oublié ?</span>
                  </div>
                  <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#F0F0F0' : '#0A0A0A', color: loading ? '#AAA' : '#fff', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', letterSpacing: 0.3, boxShadow: loading ? 'none' : '0 8px 24px rgba(0,0,0,0.15)' }}>
                    {loading ? '⏳ Connexion...' : 'Se connecter →'}
                  </button>
                </form>
              )}

              {/* SIGNUP */}
              {tab === 'signup' && (
                <form onSubmit={submitSignup}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>PRÉNOM *</label>
                      <input name="prenom" value={signup.prenom} onChange={e => setSignup(f => ({ ...f, prenom: e.target.value }))} placeholder="Kofi" required style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>NOM *</label>
                      <input name="nom" value={signup.nom} onChange={e => setSignup(f => ({ ...f, nom: e.target.value }))} placeholder="Adjovi" required style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>TÉLÉPHONE</label>
                    <input name="telephone" value={signup.telephone} onChange={e => setSignup(f => ({ ...f, telephone: e.target.value }))} placeholder="+229 97 00 00 00" style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>EMAIL *</label>
                    <input name="email" type="email" value={signup.email} onChange={e => setSignup(f => ({ ...f, email: e.target.value }))} placeholder="votre@email.com" required style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>MOT DE PASSE * (min. 6 caractères)</label>
                    <div style={{ position: 'relative' }}>
                      <input name="password" type={showPass ? 'text' : 'password'} value={signup.password} onChange={e => setSignup(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: 48 }} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#AAA' }}>
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#555', display: 'block', marginBottom: 8, fontFamily: 'var(--font-sora)', letterSpacing: 0.3 }}>CONFIRMER LE MOT DE PASSE *</label>
                    <input name="confirm" type="password" value={signup.confirm} onChange={e => setSignup(f => ({ ...f, confirm: e.target.value }))} placeholder="••••••••" required style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B5E20'} onBlur={e => e.target.style.borderColor = '#EBEBEB'} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#AAA', marginBottom: 20, lineHeight: 1.7 }}>
                    En créant un compte, vous acceptez nos <span style={{ color: '#1B5E20', fontWeight: 700 }}>Conditions</span> et notre <span style={{ color: '#1B5E20', fontWeight: 700 }}>Politique de confidentialité</span>.
                  </p>
                  <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#F0F0F0' : '#0A0A0A', color: loading ? '#AAA' : '#fff', border: 'none', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', transition: 'all 0.2s', letterSpacing: 0.3, boxShadow: loading ? 'none' : '0 8px 24px rgba(0,0,0,0.15)' }}>
                    {loading ? '⏳ Création...' : 'Créer mon compte →'}
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
                <span style={{ fontSize: '0.72rem', color: '#CCC', fontWeight: 600 }}>ou</span>
                <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#AAA' }}>
                {tab === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
                <span onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }} style={{ color: '#1B5E20', fontWeight: 700, cursor: 'pointer' }}>
                  {tab === 'login' ? 'Créer un compte' : 'Se connecter'}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Sécurité */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {['🔒 SSL sécurisé', '✓ Données protégées', '🇧🇯 Made in Bénin'].map(item => (
            <span key={item} style={{ fontSize: '0.7rem', color: '#CCC', fontWeight: 600 }}>{item}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
