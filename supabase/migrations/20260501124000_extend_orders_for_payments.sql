alter table public.orders
  add column if not exists order_number text,
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists subtotal numeric not null default 0,
  add column if not exists delivery_fee numeric not null default 0,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists payment_reference text;

update public.orders
set order_number = 'BX' || upper(substr(replace(id::text, '-', ''), 1, 12))
where order_number is null;

alter table public.orders
  alter column order_number set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_order_number_key'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_order_number_key unique (order_number);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (payment_status in ('pending', 'paid', 'failed', 'refunded'));
  end if;
end $$;

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

create index if not exists orders_payment_status_idx
  on public.orders (payment_status);

alter table public.orders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Users can view their own orders'
  ) then
    create policy "Users can view their own orders"
      on public.orders
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Users can view orders by their phone'
  ) then
    create policy "Users can view orders by their phone"
      on public.orders
      for select
      using (customer_phone = (auth.jwt() -> 'user_metadata' ->> 'telephone'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'Users can create their own orders'
  ) then
    create policy "Users can create their own orders"
      on public.orders
      for insert
      with check (user_id is null or auth.uid() = user_id);
  end if;
end $$;
