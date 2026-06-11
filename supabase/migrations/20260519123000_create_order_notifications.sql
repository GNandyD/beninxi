create table if not exists public.order_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_event_id uuid not null references public.order_events(id) on delete cascade,
  order_number text not null,
  channel text not null check (channel in ('sms', 'email')),
  provider text not null default 'webhook',
  recipient text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  subject text,
  message_text text,
  payload jsonb not null default '{}'::jsonb,
  provider_response jsonb not null default '{}'::jsonb,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists order_notifications_event_channel_idx
  on public.order_notifications(order_event_id, channel);

create index if not exists order_notifications_order_id_created_at_idx
  on public.order_notifications(order_id, created_at desc);

create index if not exists order_notifications_status_created_at_idx
  on public.order_notifications(status, created_at desc);

alter table public.order_notifications enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'order_notifications'
      and policyname = 'Users can view notifications for their orders'
  ) then
    create policy "Users can view notifications for their orders"
      on public.order_notifications
      for select
      using (
        exists (
          select 1
          from public.orders
          where orders.id = order_notifications.order_id
            and (
              auth.uid() = orders.user_id
              or (
                coalesce(auth.jwt() ->> 'telephone', '') <> ''
                and coalesce(orders.customer_phone, '') = auth.jwt() ->> 'telephone'
              )
            )
        )
      );
  end if;
end $$;
