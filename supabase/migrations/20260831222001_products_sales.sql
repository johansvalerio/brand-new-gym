-- Migración: historial de ventas de productos + decremento automático de stock.
-- Diseñada para que el botón "Comprar" del ProductDetailModal quede funcional
-- sin acoplar al flujo de pagos (eso queda para carrito SINPE).

-- ─────────────────────────────────────────────────────────────
-- Tabla product_sales
-- ─────────────────────────────────────────────────────────────
create table if not exists public.product_sales (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(product_id) on delete restrict,
  buyer_id    uuid   not null references public.users(id)        on delete restrict,
  quantity    int    not null check (quantity > 0),
  unit_price  numeric not null check (unit_price >= 0),
  total       numeric not null check (total >= 0),
  sold_by     uuid   references public.users(id),
  -- Opcional: si la venta nace de un pago SINPE aprobado (futuro carrito).
  -- payments.id es uuid en este proyecto, así que la FK respeta el tipo.
  payment_id  uuid   references public.payments(id) on delete set null,
  sold_at     timestamptz not null default now(),
  notes       text
);

create index if not exists product_sales_buyer_idx
  on public.product_sales (buyer_id, sold_at desc);
create index if not exists product_sales_product_idx
  on public.product_sales (product_id, sold_at desc);
create index if not exists product_sales_sold_at_idx
  on public.product_sales (sold_at desc);

-- ─────────────────────────────────────────────────────────────
-- Trigger: decrementa stock al insertar venta.
-- Rechaza la venta si no hay stock suficiente.
-- ─────────────────────────────────────────────────────────────
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
  after insert on public.product_sales
  for each row execute function public.decrement_product_stock();

-- ─────────────────────────────────────────────────────────────
-- RLS: members ven sus propias compras; admin/coach ven todas.
-- ─────────────────────────────────────────────────────────────
alter table public.product_sales enable row level security;

drop policy if exists product_sales_select_self_or_staff on public.product_sales;
create policy product_sales_select_self_or_staff
  on public.product_sales for select
  to authenticated
  using (
    buyer_id = (select id from public.users where auth_id = auth.uid())
    or public.is_admin()
    or public.is_coach()
  );

-- INSERT / UPDATE / DELETE: solo admin.
drop policy if exists product_sales_admin_write on public.product_sales;
create policy product_sales_admin_write
  on public.product_sales for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
