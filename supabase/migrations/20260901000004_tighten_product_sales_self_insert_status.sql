drop policy if exists product_sales_self_insert on public.product_sales;
create policy product_sales_self_insert
  on public.product_sales for insert
  to authenticated
  with check (
    buyer_id = (select id from public.users where auth_id = auth.uid())
    and coalesce(status, 'pending') = 'pending'
  );
