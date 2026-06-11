create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_number text not null,
  event_type text not null,
  title text not null,
  description text,
  actor_type text not null default 'system',
  actor_label text,
  from_status text,
  to_status text,
  from_payment_status text,
  to_payment_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_events_order_id_created_at_idx
  on public.order_events (order_id, created_at desc);

create index if not exists order_events_order_number_created_at_idx
  on public.order_events (order_number, created_at desc);

alter table public.order_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'order_events'
      and policyname = 'Users can view events for their orders'
  ) then
    create policy "Users can view events for their orders"
      on public.order_events
      for select
      using (
        exists (
          select 1
          from public.orders
          where orders.id = order_events.order_id
            and (
              auth.uid() = orders.user_id
              or orders.customer_phone = (auth.jwt() -> 'user_metadata' ->> 'telephone')
            )
        )
      );
  end if;
end $$;
