import { NextResponse } from 'next/server';
import { logPaymentFailedEvent } from '@/lib/orderEvents';
import { upsertPaymentRecord } from '@/lib/paymentRecords';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ linked: false, reason: 'service_role_missing' }, { status: 202 });
    }

    const body = await request.json();
    const orderNumber = String(body.order_number || '').trim();
    const transactionId = String(body.transaction_id || '').trim();
    const event = body.event === 'failed' ? 'failed' : 'success';

    if (!orderNumber) {
      return NextResponse.json({ error: 'Numéro de commande manquant.' }, { status: 400 });
    }

    const { data: currentOrder, error: currentOrderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('payment_method', 'kkiapay')
      .maybeSingle();

    if (currentOrderError) {
      return NextResponse.json({ error: currentOrderError.message }, { status: 400 });
    }
    if (!currentOrder) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    const updates = {};
    if (transactionId) {
      updates.payment_reference = transactionId;
    }
    if (event === 'failed') {
      updates.payment_status = 'failed';
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ linked: false, reason: 'nothing_to_update' }, { status: 200 });
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_number', orderNumber)
      .eq('payment_method', 'kkiapay')
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (event === 'failed' && currentOrder.payment_status !== updatedOrder?.payment_status) {
      await upsertPaymentRecord(supabase, {
        order: updatedOrder,
        transactionId,
        status: 'failed',
        payload: body,
      });
      await logPaymentFailedEvent(supabase, {
        beforeOrder: currentOrder,
        afterOrder: updatedOrder,
        transactionId,
        source: 'Kkiapay',
      });
    } else if (transactionId) {
      await upsertPaymentRecord(supabase, {
        order: updatedOrder,
        transactionId,
        status: updatedOrder?.payment_status || 'pending',
        payload: body,
      });
    }

    return NextResponse.json({ linked: true });
  } catch {
    return NextResponse.json({ error: 'Impossible de lier la transaction Kkiapay.' }, { status: 500 });
  }
}
