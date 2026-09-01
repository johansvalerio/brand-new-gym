-- Fix 20260901: tighten product_sales integrity + revoke anon RPC + recompute total
-- 1) Total must equal unit_price * quantity (replaces loose >=0 check)
alter table public.product_sales drop constraint if exists product_sales_total_check;
alter table public.product_sales add constraint product_sales_total_check
  check (total = unit_price * quantity);

-- 2) Defense-in-depth: siempre recalcular total en BD (cliente no puede spoofear)
create or replace function public.product_sales_set_total()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.total := new.unit_price * new.quantity;
  return new;
end;
$$;

drop trigger if exists product_sales_set_total on public.product_sales;
create trigger product_sales_set_total
  before insert or update on public.product_sales
  for each row execute function public.product_sales_set_total();

-- 3) Stock decrement como BEFORE INSERT (falla antes de escribir fila)
create or replace function public.decrement_product_stock()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  update public.products
    set product_stock = product_stock - new.quantity
    where product_id = new.product_id
      and product_stock >= new.quantity;

  if not found then
    raise exception 'Stock insuficiente para el producto %', new.product_id;
  end if;

  return new;
end;
$function$;

drop trigger if exists product_sales_decrement_stock on public.product_sales;
create trigger product_sales_decrement_stock
  before insert on public.product_sales
  for each row execute function public.decrement_product_stock();

-- 4) Seguridad: helpers no deben ser llamables vía PostgREST /rpc
revoke execute on function public.decrement_product_stock() from public, anon, authenticated;
revoke execute on function public.product_sales_set_total() from public, anon, authenticated;
revoke execute on function public.is_admin() from anon, public;
revoke execute on function public.is_coach() from anon, public;
