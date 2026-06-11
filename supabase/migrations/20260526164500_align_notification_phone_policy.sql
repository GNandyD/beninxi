do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'order_notifications'
      and policyname = 'Users can view notifications for their orders'
  ) then
    drop policy "Users can view notifications for their orders"
      on public.order_notifications;
  end if;

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
            or orders.customer_phone = (auth.jwt() -> 'user_metadata' ->> 'telephone')
          )
      )
    );
end $$;
