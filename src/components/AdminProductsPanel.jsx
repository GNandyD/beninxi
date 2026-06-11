'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { categories } from '@/data/catalog';
import { supabase } from '@/lib/supabase';

function fmt(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

const emptyForm = {
  name: '',
  category: 'smartphones',
  price: '',
  old_price: '',
  rating: '4.5',
  reviews: '0',
  img: '',
  badge: '',
  stock: '1',
  available: true,
  description: '',
};

const availabilityFilters = [
  { id: 'all', label: 'Tous' },
  { id: 'available', label: 'Disponibles' },
  { id: 'low_stock', label: 'Stock bas' },
  { id: 'unavailable', label: 'Indisponibles' },
];

export default function AdminProductsPanel() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const selectedProduct = useMemo(() => (
    products.find(product => String(product.id) === String(selectedProductId)) || null
  ), [products, selectedProductId]);

  const summary = useMemo(() => (
    products.reduce((acc, product) => {
      acc.total += 1;
      acc.stock += Number(product.stock || 0);
      if (product.available === false || Number(product.stock || 0) <= 0) acc.unavailable += 1;
      if (Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 3) acc.lowStock += 1;
      return acc;
    }, { total: 0, stock: 0, lowStock: 0, unavailable: 0 })
  ), [products]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Session admin invalide.');
      }

      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (availabilityFilter !== 'all') params.set('availability', availabilityFilter);

      const response = await fetch(`/api/admin/products${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de charger les produits.');
      }

      setProducts(payload.products || []);
      setSelectedProductId(currentId => (
        (payload.products || []).some(product => String(product.id) === String(currentId))
          ? currentId
          : payload.products?.[0]?.id || null
      ));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de charger les produits.');
    } finally {
      setLoading(false);
    }
  }, [availabilityFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    const timer = window.setTimeout(loadProducts, 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  useEffect(() => {
    if (!selectedProduct) return;
    setForm({
      name: selectedProduct.name || '',
      category: selectedProduct.category || 'smartphones',
      price: String(selectedProduct.price ?? ''),
      old_price: selectedProduct.old_price == null ? '' : String(selectedProduct.old_price),
      rating: String(selectedProduct.rating ?? '4.5'),
      reviews: String(selectedProduct.reviews ?? '0'),
      img: selectedProduct.img || '',
      badge: selectedProduct.badge || '',
      stock: String(selectedProduct.stock ?? '0'),
      available: selectedProduct.available !== false,
      description: selectedProduct.description || '',
    });
  }, [selectedProduct]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function startCreate() {
    setSelectedProductId(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Session admin invalide.');
      }

      const isEditing = Boolean(selectedProduct);
      const url = isEditing
        ? `/api/admin/products/${encodeURIComponent(selectedProduct.id)}`
        : '/api/admin/products';
      const body = { ...form };

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de sauvegarder le produit.');
      }

      setProducts(current => {
        if (isEditing) {
          return current.map(product => (
            String(product.id) === String(payload.product.id) ? payload.product : product
          ));
        }
        return [payload.product, ...current];
      });
      setSelectedProductId(payload.product.id);
      setSuccess(isEditing ? 'Produit mis à jour.' : 'Produit ajouté au catalogue.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible de sauvegarder le produit.');
    } finally {
      setSaving(false);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput('');
    setSearchQuery('');
    setCategoryFilter('all');
    setAvailabilityFilter('all');
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

  return (
    <div>
      <div style={{ background: '#111', color: '#fff', borderRadius: 32, padding: '26px clamp(20px, 4vw, 34px)', marginBottom: 20, boxShadow: '0 24px 70px rgba(0,0,0,0.12)', display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#F9A825', fontSize: '0.72rem', fontWeight: 950, fontFamily: 'var(--font-sora)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Catalogue réel</div>
          <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2.35rem)', letterSpacing: -1.2, fontWeight: 950 }}>Produits, stock et disponibilité</h2>
          <p style={{ color: 'rgba(255,255,255,0.58)', margin: '10px 0 0', lineHeight: 1.65 }}>Chaque modification alimente directement la vitrine web et l’application mobile.</p>
        </div>
        <button type="button" onClick={startCreate} style={{ background: '#F9A825', color: '#111', border: 0, borderRadius: 999, padding: '13px 20px', fontWeight: 950, fontFamily: 'var(--font-sora)', cursor: 'pointer', boxShadow: '0 12px 30px rgba(249,168,37,0.24)' }}>Nouveau produit</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Produits', value: summary.total, color: '#111', bg: '#fff' },
          { label: 'Stock total', value: summary.stock, color: '#1B5E20', bg: '#F0FAF0' },
          { label: 'Stock bas', value: summary.lowStock, color: '#8A5A00', bg: '#FFFBF0' },
          { label: 'Indisponibles', value: summary.unavailable, color: '#C62828', bg: '#FFF5F5' },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, borderRadius: 28, padding: '22px 24px', border: '1px solid #E7E7EC', boxShadow: '0 18px 44px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.7rem', color: '#9A9AA1', fontWeight: 900, fontFamily: 'var(--font-sora)', letterSpacing: 1.1, marginBottom: 10, textTransform: 'uppercase' }}>{card.label}</div>
            <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 950, fontSize: '1.5rem', color: card.color, letterSpacing: -0.7 }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 28, padding: 18, border: '1px solid #E7E7EC', boxShadow: '0 18px 44px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, alignItems: 'center' }}>
          <input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Recherche produit, badge, catégorie..." style={inputStyle} />
          <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} style={inputStyle}>
            {categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
          </select>
          <select value={availabilityFilter} onChange={event => setAvailabilityFilter(event.target.value)} style={inputStyle}>
            {availabilityFilters.map(filter => <option key={filter.id} value={filter.id}>{filter.label}</option>)}
          </select>
          <button type="submit" style={{ background: '#111', color: '#fff', border: 0, borderRadius: 16, padding: '14px 20px', fontWeight: 900, fontFamily: 'var(--font-sora)', cursor: 'pointer' }}>Filtrer</button>
          <button type="button" onClick={resetFilters} style={{ background: '#F5F5F7', color: '#111', border: '1px solid #E7E7EC', borderRadius: 16, padding: '14px 20px', fontWeight: 900, fontFamily: 'var(--font-sora)', cursor: 'pointer' }}>Réinitialiser</button>
        </form>
      </div>

      {error && <div style={{ background: '#FFF0F0', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: 16, padding: '14px 16px', marginBottom: 20 }}>{error}</div>}
      {success && <div style={{ background: '#F0FAF0', color: '#1B5E20', border: '1px solid #CDE8CF', borderRadius: 16, padding: '14px 16px', marginBottom: 20 }}>{success}</div>}

      {loading ? (
        <div style={{ background: '#fff', borderRadius: 30, padding: '70px 24px', border: '1px solid #E7E7EC', textAlign: 'center', color: '#888', boxShadow: '0 18px 44px rgba(0,0,0,0.05)' }}>
          Chargement des produits...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 30, padding: 36, border: '1px solid #E7E7EC', color: '#888', boxShadow: '0 18px 44px rgba(0,0,0,0.05)' }}>Aucun produit trouvé.</div>
            ) : products.map(product => {
              const stock = Number(product.stock || 0);
              const unavailable = product.available === false || stock <= 0;
              const lowStock = stock > 0 && stock <= 3;

              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  style={{ background: String(selectedProductId) === String(product.id) ? '#111' : '#fff', color: String(selectedProductId) === String(product.id) ? '#fff' : '#111', borderRadius: 26, padding: 16, border: `1.5px solid ${String(selectedProductId) === String(product.id) ? '#111' : '#E7E7EC'}`, boxShadow: String(selectedProductId) === String(product.id) ? '0 20px 50px rgba(0,0,0,0.16)' : '0 14px 34px rgba(0,0,0,0.05)', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center' }}
                >
                  <div style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden', background: '#F5F5F7', position: 'relative', flexShrink: 0 }}>
                    {product.img ? <Image src={product.img} alt={product.name} fill sizes="72px" style={{ objectFit: 'cover' }} /> : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, color: String(selectedProductId) === String(product.id) ? '#fff' : '#111', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                    <div style={{ color: String(selectedProductId) === String(product.id) ? 'rgba(255,255,255,0.58)' : '#777', fontSize: '0.78rem', marginBottom: 8 }}>{product.category} · {fmt(product.price)}</div>
                    <span style={{ display: 'inline-flex', background: unavailable ? '#FFF0F0' : lowStock ? '#FFF8E1' : '#F0FAF0', color: unavailable ? '#C62828' : lowStock ? '#8A5A00' : '#1B5E20', borderRadius: 999, padding: '5px 10px', fontSize: '0.68rem', fontWeight: 900 }}>
                      {unavailable ? 'Indisponible' : lowStock ? `Stock bas: ${stock}` : `Stock: ${stock}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={saveProduct} style={{ background: '#fff', borderRadius: 32, padding: 26, border: '1px solid #E7E7EC', boxShadow: '0 24px 70px rgba(0,0,0,0.08)', position: 'sticky', top: 98 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0, color: '#111', fontSize: '1.35rem', fontWeight: 950, letterSpacing: -0.6 }}>{selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}</h2>
                <p style={{ margin: '6px 0 0', color: '#888', fontSize: '0.84rem' }}>Ces informations alimentent le web et l’app mobile.</p>
              </div>
              {form.img ? (
                <div style={{ width: 72, height: 72, borderRadius: 18, overflow: 'hidden', background: '#F5F5F7', position: 'relative', flexShrink: 0 }}>
                  <Image src={form.img} alt={form.name || 'Aperçu produit'} fill sizes="72px" style={{ objectFit: 'cover' }} />
                </div>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Nom</label>
                <input name="name" value={form.name} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Catégorie</label>
                <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                  {categories.filter(category => category.id !== 'all').map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Prix</label>
                <input name="price" type="number" min="0" value={form.price} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Ancien prix</label>
                <input name="old_price" type="number" min="0" value={form.old_price} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Stock</label>
                <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Note</label>
                <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Avis</label>
                <input name="reviews" type="number" min="0" value={form.reviews} onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Image URL</label>
              <input name="img" value={form.img} onChange={handleChange} placeholder="https://..." style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Badge</label>
                <input name="badge" value={form.badge} onChange={handleChange} placeholder="Vérifié, Nouveau, Bon plan..." style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#111', fontWeight: 900, paddingTop: 20 }}>
                <input name="available" type="checkbox" checked={form.available} onChange={handleChange} />
                Disponible
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#777', fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <button disabled={saving} type="submit" style={{ width: '100%', background: saving ? '#E9E9E9' : '#111', color: saving ? '#888' : '#fff', border: 0, borderRadius: 16, padding: '15px 18px', fontWeight: 900, fontFamily: 'var(--font-sora)', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Sauvegarde...' : selectedProduct ? 'Sauvegarder le produit' : 'Ajouter au catalogue'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
