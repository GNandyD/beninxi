create extension if not exists pgcrypto;

alter table public.orders
  add column if not exists stock_adjusted_at timestamptz;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  order_number text,
  provider text not null default 'kkiapay',
  transaction_id text,
  amount numeric not null default 0,
  currency text not null default 'XOF',
  status text not null default 'pending',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_provider_check check (provider in ('kkiapay')),
  constraint payments_status_check check (status in ('pending', 'paid', 'failed', 'refunded'))
);

create unique index if not exists payments_provider_transaction_id_key
  on public.payments (provider, transaction_id)
  where transaction_id is not null and transaction_id <> '';

create index if not exists payments_order_id_idx
  on public.payments (order_id);

create index if not exists payments_order_number_idx
  on public.payments (order_number);

alter table public.payments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'payments'
      and policyname = 'Users can view payments for their orders'
  ) then
    create policy "Users can view payments for their orders"
      on public.payments
      for select
      using (
        exists (
          select 1
          from public.orders
          where orders.id = payments.order_id
            and (
              auth.uid() = orders.user_id
              or orders.customer_phone = (auth.jwt() -> 'user_metadata' ->> 'telephone')
            )
        )
      );
  end if;
end $$;

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  address text not null,
  ville text not null,
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_id_idx
  on public.customer_addresses (user_id, created_at desc);

create unique index if not exists customer_addresses_one_default_per_user_idx
  on public.customer_addresses (user_id)
  where is_default;

alter table public.customer_addresses enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_addresses'
      and policyname = 'Users can manage their addresses'
  ) then
    create policy "Users can manage their addresses"
      on public.customer_addresses
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at
  before update on public.payments
  for each row
  execute function public.touch_updated_at();

drop trigger if exists customer_addresses_touch_updated_at on public.customer_addresses;
create trigger customer_addresses_touch_updated_at
  before update on public.customer_addresses
  for each row
  execute function public.touch_updated_at();

create or replace function public.decrement_stock_for_paid_order(target_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  order_record public.orders%rowtype;
  item jsonb;
  product_uuid uuid;
  item_qty integer;
begin
  select *
  into order_record
  from public.orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'order_not_found';
  end if;

  if order_record.payment_status <> 'paid' then
    return;
  end if;

  if order_record.stock_adjusted_at is not null then
    return;
  end if;

  for item in
    select value
    from jsonb_array_elements(coalesce(order_record.items::jsonb, '[]'::jsonb))
  loop
    begin
      product_uuid := (item ->> 'id')::uuid;
      item_qty := greatest(coalesce((item ->> 'qty')::integer, 0), 0);
    exception
      when invalid_text_representation then
        product_uuid := null;
        item_qty := 0;
    end;

    if product_uuid is not null and item_qty > 0 then
      update public.products
      set stock = greatest(coalesce(stock, 0) - item_qty, 0)
      where id = product_uuid;
    end if;
  end loop;

  update public.orders
  set stock_adjusted_at = now()
  where id = target_order_id;
end;
$$;
