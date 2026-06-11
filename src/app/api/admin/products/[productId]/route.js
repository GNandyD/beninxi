import { NextResponse } from 'next/server';
import { getAdminUserFromRequest } from '@/lib/adminServer';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const PRODUCT_SELECT = 'id,name,category,price,old_price,rating,reviews,img,badge,stock,available,description,created_at';

function toNumber(value, fallback = 0) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

function buildProductUpdates(body = {}) {
  const updates = {};

  if ('name' in body) updates.name = String(body.name || '').trim();
  if ('category' in body) updates.category = String(body.category || '').trim();
  if ('price' in body) updates.price = toNumber(body.price);
  if ('old_price' in body) updates.old_price = body.old_price === '' || body.old_price == null ? null : toNumber(body.old_price);
  if ('rating' in body) updates.rating = toNumber(body.rating, 4.5);
  if ('reviews' in body) updates.reviews = toNumber(body.reviews, 0);
  if ('img' in body) updates.img = String(body.img || '').trim();
  if ('badge' in body) updates.badge = String(body.badge || '').trim() || null;
  if ('stock' in body) updates.stock = toNumber(body.stock, 0);
  if ('available' in body) updates.available = body.available !== false;
  if ('description' in body) updates.description = String(body.description || '').trim() || null;

  return updates;
}

function validateProductUpdates(updates) {
  if ('name' in updates && !updates.name) return 'Le nom du produit est obligatoire.';
  if ('category' in updates && !updates.category) return 'La catégorie est obligatoire.';
  if ('img' in updates && !updates.img) return 'L’image du produit est obligatoire.';
  if ('price' in updates && updates.price < 0) return 'Le prix doit être positif.';
  if ('stock' in updates && updates.stock < 0) return 'Le stock doit être positif.';
  return null;
}

export async function PATCH(request, { params }) {
  try {
    const { error, status } = await getAdminUserFromRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant.' }, { status: 500 });
    }

    const productId = params?.productId;
    if (!productId) {
      return NextResponse.json({ error: 'Produit introuvable.' }, { status: 400 });
    }

    const updates = buildProductUpdates(await request.json());
    const validationError = validateProductUpdates(updates);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'Aucune modification fournie.' }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', decodeURIComponent(productId))
      .select(PRODUCT_SELECT)
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ product: data });
  } catch {
    return NextResponse.json({ error: 'Impossible de mettre à jour le produit.' }, { status: 500 });
  }
}
