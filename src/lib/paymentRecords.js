export async function upsertPaymentRecord(supabase, {
  order,
  transactionId,
  status = 'pending',
  payload = {},
  provider = 'kkiapay',
} = {}) {
  if (!supabase || !order) return { data: null, error: null };

  const payment = {
    order_id: order.id || null,
    order_number: order.order_number || null,
    provider,
    transaction_id: transactionId || null,
    amount: Number(order.total || payload?.amount || 0),
    currency: payload?.currency || 'XOF',
    status,
    raw_payload: payload || {},
  };

  if (transactionId) {
    const existing = await supabase
      .from('payments')
      .select('id')
      .eq('provider', provider)
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (existing.error) return existing;

    if (existing.data?.id) {
      return supabase
        .from('payments')
        .update(payment)
        .eq('id', existing.data.id)
        .select('*')
        .maybeSingle();
    }

    return supabase
      .from('payments')
      .insert(payment)
      .select('*')
      .maybeSingle();
  }

  return supabase
    .from('payments')
    .insert(payment)
    .select('*')
    .maybeSingle();
}

export async function decrementStockForPaidOrder(supabase, orderId) {
  if (!supabase || !orderId) return { data: null, error: null };
  return supabase.rpc('decrement_stock_for_paid_order', {
    target_order_id: orderId,
  });
}
