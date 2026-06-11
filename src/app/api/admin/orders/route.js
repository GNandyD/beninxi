import { NextResponse } from 'next/server';
import {
  withSortedOrderEvents,
} from '@/lib/orderEvents';
import {
  ORDER_WITH_EVENTS_AND_NOTIFICATIONS_SELECT,
  withSortedOrderNotifications,
} from '@/lib/orderNotifications';
import { getAdminUserFromRequest } from '@/lib/adminServer';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

function sanitizeSearchTerm(value) {
  return String(value || '').replace(/[,%]/g, ' ').trim();
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
    const statusFilter = String(searchParams.get('status') || '').trim();
    const paymentStatusFilter = String(searchParams.get('payment_status') || '').trim();
    const search = sanitizeSearchTerm(searchParams.get('q'));
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 200, 1), 500);

    let query = supabase
      .from('orders')
      .select(ORDER_WITH_EVENTS_AND_NOTIFICATIONS_SELECT)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (paymentStatusFilter && paymentStatusFilter !== 'all') {
      query = query.eq('payment_status', paymentStatusFilter);
    }
    if (search) {
      query = query.or([
        `order_number.ilike.%${search}%`,
        `customer_name.ilike.%${search}%`,
        `customer_phone.ilike.%${search}%`,
        `customer_email.ilike.%${search}%`,
      ].join(','));
    }

    const { data, error: queryError } = await query;
    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 400 });
    }

    return NextResponse.json({
      orders: withSortedOrderNotifications(withSortedOrderEvents(data || [])),
    });
  } catch {
    return NextResponse.json({ error: 'Impossible de charger les commandes.' }, { status: 500 });
  }
}
