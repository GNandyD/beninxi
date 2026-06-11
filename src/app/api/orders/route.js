import { NextResponse } from 'next/server';
import { createAuthenticatedSupabaseClient } from '@/lib/adminServer';
import { logOrderCreatedEvent } from '@/lib/orderEvents';
import {
  checkoutPaymentMethodIds,
  getDeliveryFee,
  getItemsSubtotal,
  isCityInZone,
  normalizeOrderItems,
} from '@/lib/orderUtils';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const supabase = createAuthenticatedSupabaseClient(authHeader);

    if (!supabase) {
      return NextResponse.json({ error: 'Configuration Supabase incomplète.' }, { status: 500 });
    }

    const body = await request.json();
    const form = body.form || {};
    const items = normalizeOrderItems(body.items);
    const paymentMethod = body.payment_method;
    const zone = form.zone || 'sud';
    const ville = form.ville;

    if (!items.length) {
      return NextResponse.json({ error: 'Votre panier est vide.' }, { status: 400 });
    }
    if (!form.prenom || !form.nom || !form.telephone || !form.adresse || !ville) {
      return NextResponse.json({ error: 'Les informations de livraison sont incomplètes.' }, { status: 400 });
    }
    if (!isCityInZone(zone, ville)) {
      return NextResponse.json({ error: 'Ville de livraison invalide.' }, { status: 400 });
    }
    if (!checkoutPaymentMethodIds.has(paymentMethod)) {
      return NextResponse.json({ error: 'Méthode de paiement invalide.' }, { status: 400 });
    }

    const subtotal = getItemsSubtotal(items);
    const delivery = getDeliveryFee(items, ville);
    const total = subtotal + delivery;
    const orderNumber = 'BX' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 5).toUpperCase();
    const { data: authData } = authHeader
      ? await supabase.auth.getUser()
      : { data: { user: null } };
    const userId = authData?.user?.id || null;
    let createdOrder = null;

    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: userId,
      customer_name: `${form.prenom} ${form.nom}`,
      customer_phone: form.telephone,
      customer_email: form.email || null,
      address: form.adresse,
      zone,
      ville,
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

    const adminSupabase = getSupabaseAdmin();
    if (adminSupabase) {
      const { data } = await adminSupabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();

      createdOrder = data || null;

      if (createdOrder) {
        await logOrderCreatedEvent(adminSupabase, createdOrder);
      }
    }

    return NextResponse.json({
      order_id: createdOrder?.id || null,
      order_number: orderNumber,
      subtotal,
      delivery_fee: delivery,
      total,
      payment_method: paymentMethod,
      payment_status: 'pending',
      zone,
      ville,
    });
  } catch {
    return NextResponse.json({ error: 'Impossible de créer la commande.' }, { status: 500 });
  }
}
