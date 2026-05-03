import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const zones = {
  cotonou_centre: 0,
  grand_cotonou: 1500,
  porto_novo: 2500,
  parakou: 5000,
};

const paymentMethods = new Set(['mtn', 'moov', 'cash']);

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => ({
      id: item.id,
      name: String(item.name || '').trim(),
      price: Number(item.price),
      img: item.img || '',
      color: item.color || 'Standard',
      size: item.size || 'Standard',
      qty: Number(item.qty),
    }))
    .filter(item => item.id && item.name && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.qty) && item.qty > 0);
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const body = await request.json();
    const form = body.form || {};
    const items = normalizeItems(body.items);
    const paymentMethod = body.payment_method;
    const zone = form.zone;

    if (!items.length) {
      return NextResponse.json({ error: 'Votre panier est vide.' }, { status: 400 });
    }
    if (!form.prenom || !form.nom || !form.telephone || !form.adresse) {
      return NextResponse.json({ error: 'Les informations de livraison sont incomplètes.' }, { status: 400 });
    }
    if (!Object.hasOwn(zones, zone)) {
      return NextResponse.json({ error: 'Zone de livraison invalide.' }, { status: 400 });
    }
    if (!paymentMethods.has(paymentMethod)) {
      return NextResponse.json({ error: 'Méthode de paiement invalide.' }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const delivery = subtotal >= 50000 && zone === 'cotonou_centre' ? 0 : zones[zone];
    const total = subtotal + delivery;
    const orderNumber = 'BX' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 5).toUpperCase();
    const { data: authData } = authHeader
      ? await supabase.auth.getUser()
      : { data: { user: null } };
    const userId = authData?.user?.id || null;

    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: userId,
      customer_name: `${form.prenom} ${form.nom}`,
      customer_phone: form.telephone,
      customer_email: form.email || null,
      address: form.adresse,
      zone,
      subtotal,
      delivery_fee: delivery,
      total,
      payment_method: paymentMethod,
      payment_status: 'pending',
      payment_reference: null,
      items,
      status: 'pending',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ order_number: orderNumber, total });
  } catch {
    return NextResponse.json({ error: 'Impossible de créer la commande.' }, { status: 500 });
  }
}
