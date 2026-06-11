import { NextResponse } from 'next/server';
import {
  getKkiapayTransactionId,
  getKkiapayWebhookSecret,
  isKkiapayFailurePayload,
  isKkiapaySuccessPayload,
} from '@/lib/kkiapay';
import {
  logPaymentConfirmedEvent,
  logPaymentFailedEvent,
} from '@/lib/orderEvents';
import {
  decrementStockForPaidOrder,
  upsertPaymentRecord,
} from '@/lib/paymentRecords';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

async function findOrder(supabase, orderNumber, transactionId) {
  if (orderNumber) {
    const byOrderNumber = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .eq('payment_method', 'kkiapay')
      .maybeSingle();

    if (byOrderNumber.data) return byOrderNumber;
    if (byOrderNumber.error) return byOrderNumber;
  }

  if (transactionId) {
    return supabase
      .from('orders')
      .select('*')
      .eq('payment_reference', transactionId)
      .eq('payment_method', 'kkiapay')
      .maybeSingle();
  }

  return { data: null, error: null };
}

function hasMatchingAmount(orderTotal, transactionAmount) {
  const expected = Number(orderTotal);
  const received = Number(transactionAmount);

  return Number.isFinite(expected) && Number.isFinite(received) && expected === received;
}

export async function POST(request) {
  try {
    const expectedSecret = getKkiapayWebhookSecret();
    const incomingSecret = request.headers.get('x-kkiapay-secret') || '';

    if (!expectedSecret) {
      return NextResponse.json({ error: 'KKIAPAY_WEBHOOK_SECRET manquant.' }, { status: 500 });
    }
    if (!incomingSecret || incomingSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Signature webhook invalide.' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant.' }, { status: 500 });
    }

    const payload = await request.json();
    const orderNumber = String(payload.partnerId || payload.stateData?.order_number || '').trim();
    const transactionId = getKkiapayTransactionId(payload);
    const paymentSucceeded = isKkiapaySuccessPayload(payload);
    const paymentFailed = isKkiapayFailurePayload(payload);

    if (!paymentSucceeded && !paymentFailed) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const { data: order, error: orderError } = await findOrder(supabase, orderNumber, transactionId);
    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }
    if (!order) {
      return NextResponse.json({ received: true, ignored: true, reason: 'order_not_found' });
    }
    if (paymentSucceeded && !hasMatchingAmount(order.total, payload.amount)) {
      return NextResponse.json({ received: true, ignored: true, reason: 'amount_mismatch' });
    }

    const updates = {
      payment_reference: transactionId || null,
      payment_status: paymentSucceeded ? 'paid' : 'failed',
    };

    if (paymentSucceeded) {
      updates.status = 'confirmed';
    }

    const nothingChanged = (
      order.payment_reference === updates.payment_reference &&
      order.payment_status === updates.payment_status &&
      order.status === (updates.status || order.status)
    );

    if (nothingChanged) {
      await upsertPaymentRecord(supabase, {
        order,
        transactionId,
        status: paymentSucceeded ? 'paid' : 'failed',
        payload,
      });
      if (paymentSucceeded) {
        await decrementStockForPaidOrder(supabase, order.id);
      }
      return NextResponse.json({ received: true, order_number: order.order_number, duplicate: true });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (paymentSucceeded) {
      await upsertPaymentRecord(supabase, {
        order: updatedOrder,
        transactionId,
        status: 'paid',
        payload,
      });
      await decrementStockForPaidOrder(supabase, updatedOrder.id);
      await logPaymentConfirmedEvent(supabase, {
        beforeOrder: order,
        afterOrder: updatedOrder,
        transactionId,
        source: 'Kkiapay',
      });
    } else {
      await upsertPaymentRecord(supabase, {
        order: updatedOrder,
        transactionId,
        status: 'failed',
        payload,
      });
      await logPaymentFailedEvent(supabase, {
        beforeOrder: order,
        afterOrder: updatedOrder,
        transactionId,
        source: 'Kkiapay',
      });
    }

    return NextResponse.json({ received: true, order_number: order.order_number });
  } catch {
    return NextResponse.json({ error: 'Impossible de traiter le webhook Kkiapay.' }, { status: 500 });
  }
}
