import { NextResponse } from 'next/server';
import {
  logAdminOrderUpdateEvent,
  sortOrderEvents,
} from '@/lib/orderEvents';
import { getAdminUserFromRequest } from '@/lib/adminServer';
import {
  ORDER_WITH_EVENTS_AND_NOTIFICATIONS_SELECT,
  sortOrderNotifications,
} from '@/lib/orderNotifications';
import {
  getAdminOrderActionUpdate,
  orderStatusIds,
  paymentStatusIds,
} from '@/lib/orderUtils';
import {
  decrementStockForPaidOrder,
  upsertPaymentRecord,
} from '@/lib/paymentRecords';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(request, { params }) {
  try {
    const { user: adminUser, error, status } = await getAdminUserFromRequest(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant.' }, { status: 500 });
    }

    const orderId = params?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 400 });
    }

    const { data: currentOrder, error: currentOrderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (currentOrderError || !currentOrder) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
    }

    const body = await request.json();
    const actionId = typeof body.action === 'string' ? body.action.trim() : '';
    const nextStatus = typeof body.status === 'string' ? body.status.trim() : null;
    const nextPaymentStatus = typeof body.payment_status === 'string' ? body.payment_status.trim() : null;
    let updates = {};

    if (actionId) {
      updates = getAdminOrderActionUpdate(currentOrder, actionId) || {};
      if (!Object.keys(updates).length) {
        return NextResponse.json({ error: 'Action indisponible pour cette commande.' }, { status: 400 });
      }
    }

    if (!actionId && nextStatus) {
      if (!orderStatusIds.has(nextStatus)) {
        return NextResponse.json({ error: 'Statut de commande invalide.' }, { status: 400 });
      }
      updates.status = nextStatus;
    }

    if (!actionId && nextPaymentStatus) {
      if (!paymentStatusIds.has(nextPaymentStatus)) {
        return NextResponse.json({ error: 'Statut de paiement invalide.' }, { status: 400 });
      }
      updates.payment_status = nextPaymentStatus;
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'Aucune modification fournie.' }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    await logAdminOrderUpdateEvent(supabase, {
      beforeOrder: currentOrder,
      afterOrder: data,
      actionId,
      actorLabel: adminUser?.user_metadata?.full_name || adminUser?.email || 'Admin',
    });

    if (currentOrder.payment_status !== 'paid' && data.payment_status === 'paid') {
      await upsertPaymentRecord(supabase, {
        order: data,
        transactionId: data.payment_reference || null,
        status: 'paid',
        payload: {
          source: 'admin',
          action: actionId || 'manual_payment_status_update',
          actor: adminUser?.email || null,
        },
      });
      const { error: stockError } = await decrementStockForPaidOrder(supabase, data.id);
      if (stockError) {
        return NextResponse.json({ error: stockError.message }, { status: 400 });
      }
    }

    const { data: refreshedOrder, error: refreshedOrderError } = await supabase
      .from('orders')
      .select(ORDER_WITH_EVENTS_AND_NOTIFICATIONS_SELECT)
      .eq('id', orderId)
      .single();

    if (refreshedOrderError) {
      return NextResponse.json({ error: refreshedOrderError.message }, { status: 400 });
    }

    return NextResponse.json({
      order: {
        ...refreshedOrder,
        order_events: sortOrderEvents(refreshedOrder.order_events || []),
        order_notifications: sortOrderNotifications(refreshedOrder.order_notifications || []),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Impossible de mettre à jour la commande.' }, { status: 500 });
  }
}
