-- Flujo mostrador: la venta no descuenta stock al solicitar, solo al aprobar/entregar
alter table public.product_sales
  add column if not exists status text not null default 'pending'
  check (status in ('pending','approved','rejected'));

drop trigger if exists product_sales_decrement_stock on public.product_sales;

create or replace function public.handle_product_sale_stock()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if tg_op = 'INSERT' and new.status = 'approved' then
    update public.products
      set product_stock = product_stock - new.quantity
      where product_id = new.product_id
        and product_stock >= new.quantity;
    if not found then
      raise exception 'Stock insuficiente para el producto %', new.product_id;
    end if;
    return new;
  end if;
  if tg_op = 'UPDATE' and new.status = 'approved' and old.status != 'approved' then
    update public.products
      set product_stock = product_stock - new.quantity
      where product_id = new.product_id
        and product_stock >= new.quantity;
    if not found then
      raise exception 'Stock insuficiente para el producto %', new.product_id;
    end if;
    return new;
  end if;
  return new;
end;
$function$;

drop trigger if exists product_sales_handle_stock on public.product_sales;
create trigger product_sales_handle_stock
  before insert or update on public.product_sales
  for each row execute function public.handle_product_sale_stock();

revoke execute on function public.handle_product_sale_stock() from public, anon, authenticated;
