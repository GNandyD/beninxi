import { NextResponse } from 'next/server';
import { getAdminUserFromRequest } from '@/lib/adminServer';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const PRODUCT_SELECT = 'id,name,category,price,old_price,rating,reviews,img,badge,stock,available,description,created_at';

function sanitizeSearchTerm(value) {
  return String(value || '').replace(/[,%]/g, ' ').trim();
}

function toNumber(value, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function buildProductPayload(body = {}) {
  const payload = {
    name: String(body.name || '').trim(),
    category: String(body.category || '').trim(),
    price: toNumber(body.price),
    old_price: body.old_price === '' || body.old_price == null ? null : toNumber(body.old_price),
    rating: toNumber(body.rating, 4.5),
    reviews: toNumber(body.reviews, 0),
    img: String(body.img || '').trim(),
    badge: String(body.badge || '').trim() || null,
    stock: toNumber(body.stock, 0),
    available: body.available !== false,
    description: String(body.description || '').trim() || null,
  };

  return payload;
}

function validateProductPayload(payload) {
  if (!payload.name) return 'Le nom du produit est obligatoire.';
  if (!payload.category) return 'La catégorie est obligatoire.';
  if (!payload.img) return 'L’image du produit est obligatoire.';
  if (payload.price < 0) return 'Le prix doit être positif.';
  if (payload.stock < 0) return 'Le stock doit être positif.';
  return null;
}

export async function GET(request) {
  try {
    const { error, status } = await getAdminUserFromRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const category = String(searchParams.get('category') || '').trim();
    const availability = String(searchParams.get('availability') || '').trim();
    const search = sanitizeSearchTerm(searchParams.get('q'));
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 300, 1), 500);

    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (availability === 'available') {
      query = query.eq('available', true).gt('stock', 0);
    }
    if (availability === 'low_stock') {
      query = query.gt('stock', 0).lte('stock', 3);
    }
    if (availability === 'unavailable') {
      query = query.or('available.eq.false,stock.lte.0');
    }
    if (search) {
      query = query.or([
        `name.ilike.%${search}%`,
        `category.ilike.%${search}%`,
        `badge.ilike.%${search}%`,
      ].join(','));
    }

    const { data, error: queryError } = await query;
    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 400 });
    }

    return NextResponse.json({ products: data || [] });
  } catch {
    return NextResponse.json({ error: 'Impossible de charger les produits.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { error, status } = await getAdminUserFromRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant.' }, { status: 500 });
    }

    const payload = buildProductPayload(await request.json());
    const validationError = validateProductPayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data, error: insertError } = await supabase
      .from('products')
      .insert(payload)
      .select(PRODUCT_SELECT)
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Impossible de créer le produit.' }, { status: 500 });
  }
}
