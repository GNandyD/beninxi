'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function ConnexionPage() {
  const router = useRouter();
  const { signInEmail, signUpEmail, signInPhone, verifyOtp, user } = useAuth();

  const [tab, setTab]         = useState('login');
  const [method, setMethod]   = useState('email'); // 'email' | 'phone'
  const [step, setStep]       = useState(1); // pour OTP
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const [login, setLogin]   = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ prenom: '', nom: '', telephone: '', email: '', password: '', confirm: '' });
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');

  if (user) router.push('/');

  function handleLogin(e)  { setLogin(f => ({ ...f, [e.target.name]: e.target.value })); }
  function handleSignup(e) { setSignup(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function submitLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInEmail({ email: login.email, password: login.password });
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message);
    }
    setLoading(false);
  }

  async function submitSignup(e) {
    e.preventDefault();
    setError('');
    if (signup.password !== signup.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (signup.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      await signUpEmail({ email: signup.email, password: signup.password, prenom: signup.prenom, nom: signup.nom, telephone: signup.telephone });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function submitPhone(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInPhone(phone);
      setStep(2);
    } catch (err) {
      setError('Impossible d\'envoyer le SMS. Vérifiez le numéro.');
    }
    setLoading(false);
  }

  async function submitOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      setError('Code incorrect. Réessayez.');
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
            <p style={{ color: '#AAA', fontSize: '0.88rem', lineHeight: 1.7 }}>
              {tab === 'signup' ? 'Vérifiez votre email pour confirmer votre compte.' : 'Redirection en cours...'}
            </p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', border: '1px solid #F0F0F0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #F0F0F0' }}>
              {[{ id: 'login', label: 'Se connecter' }, { id: 'signup', label: 'Créer un compte' }].map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setError(''); setStep(1); }} style={{ padding: '18px', border: 'none', background: tab === t.id ? '#fff' : '#FAFAFA', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', color: tab === t.id ? '#0A0A0A' : '#AAA', borderBottom: `2px solid ${tab === t.id ? '#0A0A0A' : 'transparent'}`, marginBottom: -1, transition: 'all 0.2s' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '32px' }}>

              {/* Erreur */}
              {error && (
                <div style={{ background: '#FFF0F0', border: '1px solid #FFD0D0', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: '0.82rem', color: '#C62828', fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}

              {/* LOGIN */}
              {tab === 'login' && (
                <div>
                  {/* Method toggle */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24, background: '#F5F5F5', borderRadius: 12, padding: 4 }}>
                    {[{ id: 'email', label: '📧 Email' }, { id: 'phone', label: '📱 Téléphone' }].map(m => (
                      <button key={m.id} onClick={() => { setMethod(m.id); setError(''); setStep(1); }} style={{ padding: '10px', borderRadius: 10, border: 'none', background: method === m.id ? '#fff' : 'transparent', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-sora)', color: method === m.id ? '#0A0A0A' : '#AAA', boxShadow: method === m.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {method === 'email' && (
                    <form onSubmit={submitLogin}>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Email</label>
                        <input name="email" type="email" value={login.email} onChange={handleLogin} placeholder="votre@email.com" required style={inputStyle} />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', fontFamily: 'var(--font-sora)' }}>Mot de passe</label>
                          <span style={{ fontSize: '0.75rem', color: '#1B5E20', fontWeight: 600, cursor: 'pointer' }}>Oublié ?</span>
                        </div>
                        <input name="password" type="password" value={login.password} onChange={handleLogin} placeholder="••••••••" required style={inputStyle} />
                      </div>
                      <button type="submit" disabled={loading} style={{ width: '100%', background: '#0A0A0A', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontWeight: 800, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}>
                        {loading ? '⏳ Connexion...' : 'Se connecter →'}
                      </button>
                    </form>
                  )}

                  {method === 'phone' && (
                    <div>
                      {step === 1 && (
                        <form onSubmit={submitPhone}>
                          <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Numéro de téléphone</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+22997000000" required style={inputStyle} />
                            <div style={{ fontSize: '0.72rem', color: '#AAA', marginTop: 6 }}>Format international : +229 suivi du numéro</div>
                          </div>
                          <button type="submit" disabled={loading} style={{ width: '100%', background: '#0A0A0A', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontWeight: 800, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', opacity: loading ? 0.7 : 1 }}>
                            {loading ? '⏳ Envoi SMS...' : '📱 Recevoir le code SMS →'}
                          </button>
                        </form>
                      )}
                      {step === 2 && (
                        <form onSubmit={submitOtp}>
                          <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📱</div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0A0A0A', fontFamily: 'var(--font-sora)', marginBottom: 4 }}>Code envoyé au {phone}</div>
                            <div style={{ fontSize: '0.75rem', color: '#AAA' }}>Entrez le code à 6 chiffres reçu par SMS</div>
                          </div>
                          <div style={{ marginBottom: 20 }}>
                            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" maxLength={6} required style={{ ...inputStyle, textAlign: 'center', fontSize: '1.8rem', fontFamily: 'var(--font-sora)', fontWeight: 800, letterSpacing: 12 }} />
                          </div>
                          <button type="submit" disabled={loading} style={{ width: '100%', background: '#1B5E20', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontWeight: 800, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', opacity: loading ? 0.7 : 1 }}>
                            {loading ? '⏳ Vérification...' : '✓ Vérifier le code →'}
                          </button>
                          <button type="button" onClick={() => { setStep(1); setOtp(''); }} style={{ width: '100%', background: 'none', border: 'none', color: '#AAA', fontSize: '0.8rem', cursor: 'pointer', marginTop: 12, fontFamily: 'var(--font-dm)' }}>
                            ← Changer de numéro
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
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
                    <input name="telephone" value={signup.telephone} onChange={handleSignup} placeholder="+22997000000" required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Email *</label>
                    <input name="email" type="email" value={signup.email} onChange={handleSignup} placeholder="votre@email.com" required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Mot de passe * (min. 6 caractères)</label>
                    <input name="password" type="password" value={signup.password} onChange={handleSignup} placeholder="••••••••" required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', display: 'block', marginBottom: 6, fontFamily: 'var(--font-sora)' }}>Confirmer le mot de passe *</label>
                    <input name="confirm" type="password" value={signup.confirm} onChange={handleSignup} placeholder="••••••••" required style={inputStyle} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#AAA', marginBottom: 20, lineHeight: 1.6 }}>
                    En créant un compte, vous acceptez nos <span style={{ color: '#1B5E20', fontWeight: 600 }}>Conditions d'utilisation</span> et notre <span style={{ color: '#1B5E20', fontWeight: 600 }}>Politique de confidentialité</span>.
                  </p>
                  <button type="submit" disabled={loading} style={{ width: '100%', background: '#0A0A0A', color: '#fff', border: 'none', padding: '15px', borderRadius: 12, fontWeight: 800, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sora)', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}>
                    {loading ? '⏳ Création...' : 'Créer mon compte →'}
                  </button>
                </form>
              )}

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#AAA', marginTop: 20 }}>
                {tab === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
                <span onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }} style={{ color: '#1B5E20', fontWeight: 700, cursor: 'pointer' }}>
                  {tab === 'login' ? 'Créer un compte' : 'Se connecter'}
                </span>
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {['🔒 Sécurisé SSL', '✓ Données protégées', '🇧🇯 Made in Bénin'].map(item => (
            <span key={item} style={{ fontSize: '0.72rem', color: '#CCC', fontWeight: 600 }}>{item}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
