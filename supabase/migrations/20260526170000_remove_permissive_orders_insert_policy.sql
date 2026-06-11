do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'orders'
      and policyname = 'insertion commandes'
  ) then
    drop policy "insertion commandes" on public.orders;
  end if;
end $$;
