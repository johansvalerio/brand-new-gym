-- Finanzas (2026-09-15): Egresos CRUD + Rentas fijas mensuales.
-- Ingresos = agregación read-only (payments approved vía decided_at +
-- product_sales approved vía sold_at + recurring activas). Egresos = tabla
-- CRUD. Finanzas globales solo isAdmin (coach/member SIN acceso).
-- Orden: columnas → policies. El cliente nunca manda gym_id (default +
-- trigger set_gym_id_from_auth lo hereda del autor).

-- 1) Tabla expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null default public.my_gym_id() references public.gyms(id) on delete cascade,
  category text not null check (category in ('alquiler','salarios','servicios','mantenimiento','limpieza','marketing','otros')),
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  expense_date date not null default CURRENT_DATE,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists expenses_gym_id_idx on public.expenses (gym_id);
create index if not exists expenses_date_idx on public.expenses (expense_date);

-- 2) Tabla recurring_incomes (rentas fijas: concepto en description, cuenta en CADA mes)
create table if not exists public.recurring_incomes (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null default public.my_gym_id() references public.gyms(id) on delete cascade,
  category text not null check (category in ('alquiler','salarios','servicios','mantenimiento','limpieza','marketing','otros')),
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists recurring_incomes_gym_id_idx on public.recurring_incomes (gym_id);

-- 3) Trigger: el cliente nunca manda gym_id; se hereda del autor.
drop trigger if exists set_gym_id on public.expenses;
create trigger set_gym_id before insert on public.expenses
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.recurring_incomes;
create trigger set_gym_id before insert on public.recurring_incomes
  for each row execute function public.set_gym_id_from_auth();

-- 4) RLS: admin-only scopeado a su gym. Sin ramas coach/member/anon.
alter table public.expenses enable row level security;
drop policy if exists "expenses_admin_own_gym" on public.expenses;
create policy "expenses_admin_own_gym"
  on public.expenses for all to authenticated
  using (public.is_admin() and gym_id = public.my_gym_id())
  with check (public.is_admin() and gym_id = public.my_gym_id());

alter table public.recurring_incomes enable row level security;
drop policy if exists "recurring_incomes_admin_own_gym" on public.recurring_incomes;
create policy "recurring_incomes_admin_own_gym"
  on public.recurring_incomes for all to authenticated
  using (public.is_admin() and gym_id = public.my_gym_id())
  with check (public.is_admin() and gym_id = public.my_gym_id());
