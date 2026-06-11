import { dispatchOrderNotifications } from '@/lib/orderNotifications';

export const ORDER_WITH_EVENTS_SELECT = '*, order_events(*)';

const quickActionEventCopy = {
  confirm_order: {
    title: 'Commande confirmée',
    description: 'La commande a été validée pour préparation.',
  },
  mark_shipping: {
    title: 'Commande en livraison',
    description: 'Le colis a été marqué comme expédié.',
  },
  mark_delivered: {
    title: 'Commande livrée',
    description: 'La livraison a été finalisée.',
  },
  mark_paid: {
    title: 'Paiement validé',
    description: 'Le paiement a été marqué comme encaissé.',
  },
  mark_failed: {
    title: 'Paiement échoué',
    description: 'La tentative de paiement a été marquée comme échouée.',
  },
  refund_payment: {
    title: 'Paiement remboursé',
    description: 'Un remboursement a été enregistré sur cette commande.',
  },
  cancel_order: {
    title: 'Commande annulée',
    description: 'Le traitement de la commande a été interrompu.',
  },
  reopen_order: {
    title: 'Commande rouverte',
    description: 'La commande a été replacée dans le circuit de traitement.',
  },
};

const eventAppearance = {
  order_created: { icon: '🧾', color: '#0A0A0A', bg: '#F5F5F5', border: '#E0E0E0' },
  payment_confirmed: { icon: '💳', color: '#1B5E20', bg: '#F0FAF0', border: '#CDE8CF' },
  payment_failed: { icon: '⚠️', color: '#C62828', bg: '#FFF0F0', border: '#FFCDD2' },
  order_updated: { icon: '🔄', color: '#0A0A0A', bg: '#F5F5F5', border: '#E0E0E0' },
  confirm_order: { icon: '✅', color: '#1B5E20', bg: '#F0FAF0', border: '#CDE8CF' },
  mark_shipping: { icon: '🚚', color: '#0B5CAD', bg: '#EAF4FF', border: '#C9E0FF' },
  mark_delivered: { icon: '📦', color: '#1B5E20', bg: '#F0FAF0', border: '#CDE8CF' },
  mark_paid: { icon: '💰', color: '#8A5A00', bg: '#FFF8E1', border: '#F6D78B' },
  mark_failed: { icon: '❌', color: '#C62828', bg: '#FFF0F0', border: '#FFCDD2' },
  refund_payment: { icon: '↩️', color: '#0066CC', bg: '#E3F2FD', border: '#C9DDF8' },
  cancel_order: { icon: '🛑', color: '#C62828', bg: '#FFF5F5', border: '#FFD4D4' },
  reopen_order: { icon: '♻️', color: '#0A0A0A', bg: '#F5F5F5', border: '#E0E0E0' },
};

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null)
  );
}

function sanitizeMetadata(metadata) {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};
}

export function sortOrderEvents(events = []) {
  return [...(Array.isArray(events) ? events : [])].sort((left, right) => (
    new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  ));
}

export function withSortedOrderEvents(orders = []) {
  return (Array.isArray(orders) ? orders : []).map(order => ({
    ...order,
    order_events: sortOrderEvents(order?.order_events || []),
  }));
}

export function getOrderEventAppearance(eventType) {
  return eventAppearance[eventType] || {
    icon: '📝',
    color: '#0A0A0A',
    bg: '#F5F5F5',
    border: '#E0E0E0',
  };
}

async function insertOrderEvent(supabase, {
  order,
  eventType,
  title,
  description = '',
  actorType = 'system',
  actorLabel = null,
  fromStatus = null,
  toStatus = null,
  fromPaymentStatus = null,
  toPaymentStatus = null,
  metadata = {},
}) {
  if (!supabase || !order?.id || !order?.order_number || !eventType || !title) {
    return { data: null, error: null };
  }

  const result = await supabase.from('order_events').insert({
    order_id: order.id,
    order_number: order.order_number,
    event_type: eventType,
    title,
    description,
    actor_type: actorType,
    actor_label: actorLabel,
    from_status: fromStatus,
    to_status: toStatus,
    from_payment_status: fromPaymentStatus,
    to_payment_status: toPaymentStatus,
    metadata: sanitizeMetadata(metadata),
  }).select('*').single();

  if (!result.error && result.data) {
    try {
      await dispatchOrderNotifications(supabase, {
        order,
        event: result.data,
      });
    } catch {}
  }

  return result;
}

export async function logOrderCreatedEvent(supabase, order) {
  return insertOrderEvent(supabase, {
    order,
    eventType: 'order_created',
    title: 'Commande créée',
    description: `La commande ${order.order_number} a été enregistrée et attend le démarrage du traitement.`,
    actorType: 'customer',
    actorLabel: order.customer_name || null,
    toStatus: order.status,
    toPaymentStatus: order.payment_status,
    metadata: {
      total: order.total,
      payment_method: order.payment_method,
      zone: order.zone,
      ville: order.ville,
    },
  });
}

export async function logPaymentConfirmedEvent(supabase, { beforeOrder, afterOrder, transactionId = null, source = 'kkiapay' }) {
  return insertOrderEvent(supabase, {
    order: afterOrder,
    eventType: 'payment_confirmed',
    title: 'Paiement confirmé',
    description: beforeOrder?.status !== afterOrder?.status
      ? 'Le paiement a été confirmé et la commande a été validée automatiquement.'
      : 'Le paiement a été confirmé par la passerelle de paiement.',
    actorType: 'payment',
    actorLabel: source,
    fromStatus: beforeOrder?.status || null,
    toStatus: afterOrder?.status || null,
    fromPaymentStatus: beforeOrder?.payment_status || null,
    toPaymentStatus: afterOrder?.payment_status || null,
    metadata: {
      source,
      transaction_id: transactionId,
    },
  });
}

export async function logPaymentFailedEvent(supabase, { beforeOrder, afterOrder, transactionId = null, source = 'kkiapay' }) {
  return insertOrderEvent(supabase, {
    order: afterOrder,
    eventType: 'payment_failed',
    title: 'Paiement échoué',
    description: 'La transaction de paiement a été marquée comme échouée.',
    actorType: 'payment',
    actorLabel: source,
    fromStatus: beforeOrder?.status || null,
    toStatus: afterOrder?.status || null,
    fromPaymentStatus: beforeOrder?.payment_status || null,
    toPaymentStatus: afterOrder?.payment_status || null,
    metadata: {
      source,
      transaction_id: transactionId,
    },
  });
}

export async function logAdminOrderUpdateEvent(supabase, {
  beforeOrder,
  afterOrder,
  actionId = '',
  actorLabel = null,
}) {
  const statusChanged = beforeOrder?.status !== afterOrder?.status;
  const paymentChanged = beforeOrder?.payment_status !== afterOrder?.payment_status;

  if (!statusChanged && !paymentChanged) {
    return { data: null, error: null };
  }

  const actionCopy = actionId ? quickActionEventCopy[actionId] : null;
  const changeParts = [];

  if (statusChanged) {
    changeParts.push(`commande: ${beforeOrder?.status || '—'} -> ${afterOrder?.status || '—'}`);
  }
  if (paymentChanged) {
    changeParts.push(`paiement: ${beforeOrder?.payment_status || '—'} -> ${afterOrder?.payment_status || '—'}`);
  }

  return insertOrderEvent(supabase, {
    order: afterOrder,
    eventType: actionId || 'order_updated',
    title: actionCopy?.title || 'Commande mise à jour',
    description: actionCopy?.description || `Mise à jour manuelle des statuts: ${changeParts.join(' · ')}.`,
    actorType: 'admin',
    actorLabel,
    fromStatus: beforeOrder?.status || null,
    toStatus: afterOrder?.status || null,
    fromPaymentStatus: beforeOrder?.payment_status || null,
    toPaymentStatus: afterOrder?.payment_status || null,
    metadata: compactObject({
      action_id: actionId || null,
      changed_status: statusChanged || undefined,
      changed_payment_status: paymentChanged || undefined,
    }),
  });
}
