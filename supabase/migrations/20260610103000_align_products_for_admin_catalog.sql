do $$
begin
  if to_regclass('public.products') is not null then
    alter table public.products
      add column if not exists category text,
      add column if not exists price numeric default 0,
      add column if not exists old_price numeric,
      add column if not exists rating numeric default 4.5,
      add column if not exists reviews integer default 0,
      add column if not exists img text,
      add column if not exists badge text,
      add column if not exists stock integer default 0,
      add column if not exists available boolean default true,
      add column if not exists description text,
      add column if not exists created_at timestamptz default now();
  end if;
end $$;
