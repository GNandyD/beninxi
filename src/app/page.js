'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { categories, demoProducts } from '@/data/catalog';
import { mergeProducts, searchProduct } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

const appSteps = [
  { number: '1', title: 'Sélectionne', text: 'Parcours une sélection vérifiée et choisis ton article.' },
  { number: '2', title: 'Confirme', text: 'Vérifie ton panier, ta ville et ton adresse de livraison.' },
  { number: '3', title: 'Règle', text: 'Paie en toute sécurité avec Kkiapay.' },
  { number: '4', title: 'Reçois', text: 'BéninXi prépare la commande et coordonne la livraison.' },
];

const trustItems = [
  { title: 'Produits vérifiés', text: 'Une sélection claire avant paiement.' },
  { title: 'Paiement sécurisé', text: 'Kkiapay gère Mobile Money et carte.' },
  { title: 'Support WhatsApp', text: 'Une assistance directe pour tes questions.' },
];

export default function HomePage() {
  const { totalItems } = useCart();
  const [products, setProducts] = useState(demoProducts);
  const [query, setQuery] = useState('');
  const popularProducts = useMemo(() => (
    products
      .filter(product => searchProduct(product, query))
      .sort((a, b) => Number(b.sold || b.reviews || 0) - Number(a.sold || a.reviews || 0))
      .slice(0, 8)
  ), [products, query]);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .limit(80)
      .then(({ data }) => {
        setProducts(mergeProducts(data || [], demoProducts));
      });
  }, []);

  return (
    <main style={{ background: '#F5F5F7', minHeight: '100vh', fontFamily: 'var(--font-dm)' }}>
      <Navbar />

      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '28px clamp(16px, 4vw, 40px) 88px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'stretch' }}>
          <div style={{ minHeight: 360, borderRadius: 34, background: '#111', color: '#fff', padding: 'clamp(28px, 5vw, 56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 24px 70px rgba(0,0,0,0.18)' }}>
            <div>
              <div style={{ color: '#F9A825', fontSize: '0.78rem', fontWeight: 900, fontFamily: 'var(--font-sora)', marginBottom: 16 }}>BéninXi</div>
              <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)', lineHeight: 0.98, letterSpacing: -3, margin: 0, maxWidth: 680, fontWeight: 950 }}>
                Vos achats au Bénin, avec plus de confiance.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.66)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 520, margin: '24px 0 0' }}>
                Produits sélectionnés, paiement Kkiapay sécurisé et livraison organisée par BéninXi.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 36 }}>
              <Link href="/catalogue" style={{ background: '#fff', color: '#111', borderRadius: 999, padding: '14px 24px', textDecoration: 'none', fontWeight: 900, fontFamily: 'var(--font-sora)' }}>
                Explorer le catalogue
              </Link>
              <Link href="/catalogue?cat=smartphones" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '14px 24px', textDecoration: 'none', fontWeight: 900, fontFamily: 'var(--font-sora)' }}>
                Voir smartphones
              </Link>
            </div>
          </div>

          <div style={{ borderRadius: 34, background: '#fff', border: '1px solid #E7E7EC', padding: 22, boxShadow: '0 18px 44px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#A7A7AE', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 900, fontFamily: 'var(--font-sora)' }}>Panier</div>
              <div style={{ color: '#F9A825', fontSize: 48, fontWeight: 950, letterSpacing: -2, marginTop: 12 }}>{totalItems}</div>
              <div style={{ color: '#77777F', fontWeight: 800 }}>{totalItems > 1 ? 'articles au panier' : 'article au panier'}</div>
            </div>
            <div style={{ background: '#F5F5F7', borderRadius: 24, padding: 16 }}>
              <div style={{ color: '#111', fontSize: '0.95rem', fontWeight: 950, marginBottom: 8 }}>Paiement sécurisé</div>
              <div style={{ color: '#77777F', fontSize: '0.84rem', lineHeight: 1.6 }}>Kkiapay ouvre une fenêtre sécurisée avant validation finale.</div>
            </div>
          </div>
        </div>

        <section style={{ background: '#fff', borderRadius: 34, border: '1px solid #E7E7EC', padding: '24px clamp(18px, 3vw, 30px)', marginTop: 20, boxShadow: '0 18px 44px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: 0, color: '#111', fontSize: '1.35rem', letterSpacing: -0.7, fontWeight: 950 }}>Comment utiliser BéninXi</h2>
              <div style={{ display: 'inline-block', marginTop: 10, color: '#1B5E20', background: '#EEF6EF', borderRadius: 999, padding: '7px 12px', fontSize: '0.76rem', fontWeight: 900 }}>Un parcours clair en 4 étapes</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F5F5F7', border: '1px solid #E7E7EC', borderRadius: 18, padding: '0 14px', minWidth: 280 }}>
              <span style={{ width: 12, height: 12, border: '2px solid #A7A7AE', borderRadius: 999, display: 'inline-block', marginRight: 10 }} />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher smartphone, pagne..." style={{ flex: 1, height: 48, border: 0, outline: 0, background: 'transparent', color: '#111', fontSize: '0.9rem' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            {appSteps.map(step => (
              <div key={step.number} style={{ background: '#FAFAFC', border: '1px solid #EFEFF3', borderRadius: 24, padding: 18 }}>
                <div style={{ color: '#1B5E20', fontSize: 24, fontWeight: 950 }}>{step.number}</div>
                <div style={{ color: '#111', fontWeight: 950, margin: '8px 0 6px' }}>{step.title}</div>
                <div style={{ color: '#77777F', fontSize: '0.82rem', lineHeight: 1.55 }}>{step.text}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '22px 0 8px' }}>
          {categories.map(category => (
            <Link key={category.id} href={`/catalogue${category.id === 'all' ? '' : `?cat=${category.id}`}`} style={{ flexShrink: 0, textDecoration: 'none', color: category.id === 'all' ? '#fff' : '#111', background: category.id === 'all' ? '#111' : '#fff', border: '1px solid #E7E7EC', borderRadius: 999, padding: '12px 18px', fontWeight: 900 }}>
              {category.label}
            </Link>
          ))}
        </div>

        <section style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <h2 style={{ color: '#111', margin: 0, fontSize: '1.8rem', letterSpacing: -1, fontWeight: 950 }}>Produits populaires</h2>
              <p style={{ color: '#77777F', margin: '6px 0 0', fontWeight: 750 }}>{popularProducts.length} sélection{popularProducts.length > 1 ? 's' : ''} disponible{popularProducts.length > 1 ? 's' : ''}</p>
            </div>
            <Link href="/catalogue" style={{ color: '#1B5E20', textDecoration: 'none', fontWeight: 900 }}>Voir tout</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
            {popularProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 34 }}>
          {trustItems.map(item => (
            <div key={item.title} style={{ background: '#111', color: '#fff', borderRadius: 28, padding: 24 }}>
              <div style={{ color: '#F9A825', fontWeight: 950, marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.64)', lineHeight: 1.6 }}>{item.text}</div>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
