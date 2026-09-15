-- Rol recepcionista + staff + picker salarios + auditoría (2026-09-15).
-- Enum 'recepcionista' se agregó vía execute_sql aparte (ADD VALUE no va en transacción).
-- Orden: helpers → policies (mismo gym-scope) → columna salarios → audit_log + triggers.
-- transfer_member_to_my_gym sigue is_admin() puro (no se toca).
-- routines/nutrition NO se tocan (recepcionista no asigna rutinas).

-- ============ 1) Helpers is_receptionist() + is_staff() (mirror is_admin) ============
create or replace function public.is_receptionist()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users
    where auth_id = auth.uid() and role = 'recepcionista'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.is_receptionist();
$$;

revoke all on function public.is_receptionist() from public, anon, authenticated;
grant execute on function public.is_receptionist() to anon, authenticated, service_role;
revoke all on function public.is_staff() from public, anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated, service_role;

-- ============ 2) Catálogo editable por staff (antes solo admin) ============
drop policy if exists "Products editable by admin" on public.products;
create policy "Products editable by admin"
  on public.products for all to public
  using (public.is_staff() and gym_id = public.my_gym_id())
  with check (public.is_staff() and gym_id = public.my_gym_id());

drop policy if exists "Plans editable by admin" on public.plans;
create policy "Plans editable by admin"
  on public.plans for all to public
  using (public.is_staff() and gym_id = public.my_gym_id())
  with check (public.is_staff() and gym_id = public.my_gym_id());

drop policy if exists "Categories editable by admin" on public.categories;
create policy "Categories editable by admin"
  on public.categories for all to public
  using (public.is_staff() and gym_id = public.my_gym_id())
  with check (public.is_staff() and gym_id = public.my_gym_id());

-- ============ 3) Payments: staff donde hoy es admin ============
drop policy if exists "Admins can decide payment requests" on public.payments;
create policy "Admins can decide payment requests"
  on public.payments for update to public
  using (public.is_staff() and gym_id = public.my_gym_id());

drop policy if exists "Payments insertable por dueño o admin" on public.payments;
create policy "Payments insertable por dueño o admin"
  on public.payments for insert to public
  with check (
    (public.is_staff() or user_id = (select users.id from public.users where users.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  );

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments"
  on public.payments for select to public
  using (
    (public.is_staff() or user_id = (select users.id from public.users where users.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  );
-- "Users can cancel own pending requests" (DELETE propio-pending) se deja intacto:
-- ni admin ni staff borran pagos ajenos por RLS.

-- ============ 4) product_sales: staff full ============
drop policy if exists "product_sales_admin_write" on public.product_sales;
create policy "product_sales_admin_write"
  on public.product_sales for all to authenticated
  using (public.is_staff() and gym_id = public.my_gym_id())
  with check (public.is_staff() and gym_id = public.my_gym_id());

drop policy if exists "product_sales_select_self_or_staff" on public.product_sales;
create policy "product_sales_select_self_or_staff"
  on public.product_sales for select to authenticated
  using (
    buyer_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((public.is_staff() or public.is_coach()) and gym_id = public.my_gym_id())
  );
-- "product_sales_self_insert" (member self-purchase pending) se deja intacto.

-- ============ 5) Finanzas: expenses + recurring_incomes staff ============
drop policy if exists "expenses_admin_own_gym" on public.expenses;
create policy "expenses_admin_own_gym"
  on public.expenses for all to authenticated
  using (public.is_staff() and gym_id = public.my_gym_id())
  with check (public.is_staff() and gym_id = public.my_gym_id());

drop policy if exists "recurring_incomes_admin_own_gym" on public.recurring_incomes;
create policy "recurring_incomes_admin_own_gym"
  on public.recurring_incomes for all to authenticated
  using (public.is_staff() and gym_id = public.my_gym_id())
  with check (public.is_staff() and gym_id = public.my_gym_id());

-- ============ 6) users: staff ve (rama como coach); escribe EXCEPTO rol/filas admin ============
drop policy if exists "Receptionists can view users" on public.users;
create policy "Receptionists can view users"
  on public.users for select to public
  using (public.is_receptionist() and gym_id = public.my_gym_id());

-- INSERT staff: nunca setear role='admin' sin ser admin.
drop policy if exists "Admins can insert users" on public.users;
create policy "Admins can insert users"
  on public.users for insert to public
  with check (
    public.is_staff()
    and gym_id = public.my_gym_id()
    and ((role is distinct from 'admin'::public.user_role) or public.is_admin())
  );

-- UPDATE staff: nunca tocar fila cuyo role anterior sea 'admin' (USING ve OLD)
-- ni dejar role='admin' en la fila nueva (WITH CHECK ve NEW) sin ser admin.
drop policy if exists "Admins can update all users" on public.users;
create policy "Admins can update all users"
  on public.users for update to public
  using (
    public.is_staff()
    and gym_id = public.my_gym_id()
    and ((role is distinct from 'admin'::public.user_role) or public.is_admin())
  )
  with check (
    public.is_staff()
    and gym_id = public.my_gym_id()
    and ((role is distinct from 'admin'::public.user_role) or public.is_admin())
  );

-- DELETE staff: nunca borrar fila admin sin ser admin.
drop policy if exists "Admins can delete users" on public.users;
create policy "Admins can delete users"
  on public.users for delete to public
  using (
    public.is_staff()
    and gym_id = public.my_gym_id()
    and ((role is distinct from 'admin'::public.user_role) or public.is_admin())
  );

-- ============ 7) Picker de salarios: beneficiario del egreso ============
alter table public.expenses
  add column if not exists paid_to_user_id uuid references public.users(id) on delete set null;
create index if not exists expenses_paid_to_idx on public.expenses (paid_to_user_id);

-- ============ 8) Auditoría inmutable admin-only ============
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null check (action in ('insert','update','delete')),
  table_name text not null,
  row_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_gym_created_idx on public.audit_log (gym_id, created_at desc);

alter table public.audit_log enable row level security;
drop policy if exists "audit_log_select_admin_own_gym" on public.audit_log;
create policy "audit_log_select_admin_own_gym"
  on public.audit_log for select to authenticated
  using (public.is_admin() and gym_id = public.my_gym_id());
-- SIN insert/update/delete para el cliente: solo el trigger (SECURITY DEFINER) escribe.

create or replace function public.audit_staff_changes()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_actor uuid;
  v_gym uuid;
  v_row_id text;
  v_old jsonb;
  v_new jsonb;
begin
  select id into v_actor from public.users where auth_id = auth.uid();

  if TG_OP = 'INSERT' then
    v_old := null;
    v_new := to_jsonb(NEW);
    v_gym := coalesce((to_jsonb(NEW)->>'gym_id')::uuid, public.my_gym_id());
    v_row_id := coalesce(to_jsonb(NEW)->>'id', to_jsonb(NEW)->>'product_id');
  elsif TG_OP = 'UPDATE' then
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_gym := coalesce((to_jsonb(NEW)->>'gym_id')::uuid, (to_jsonb(OLD)->>'gym_id')::uuid, public.my_gym_id());
    v_row_id := coalesce(to_jsonb(NEW)->>'id', to_jsonb(NEW)->>'product_id', to_jsonb(OLD)->>'id', to_jsonb(OLD)->>'product_id');
  else -- DELETE
    v_old := to_jsonb(OLD);
    v_new := null;
    v_gym := coalesce((to_jsonb(OLD)->>'gym_id')::uuid, public.my_gym_id());
    v_row_id := coalesce(to_jsonb(OLD)->>'id', to_jsonb(OLD)->>'product_id');
  end if;

  -- Fila sin gym (ej. signup con gym NULL y sin gym propio): no auditar antes que romper el write.
  if v_gym is null then
    if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
  end if;

  insert into public.audit_log (gym_id, actor_user_id, action, table_name, row_id, old_data, new_data)
  values (v_gym, v_actor, lower(TG_OP), TG_TABLE_NAME, v_row_id, v_old, v_new);

  if TG_OP = 'DELETE' then return OLD; else return NEW; end if;
end;
$function$;

drop trigger if exists audit_changes on public.users;
create trigger audit_changes after insert or update or delete on public.users
  for each row execute function public.audit_staff_changes();
drop trigger if exists audit_changes on public.plans;
create trigger audit_changes after insert or update or delete on public.plans
  for each row execute function public.audit_staff_changes();
drop trigger if exists audit_changes on public.products;
create trigger audit_changes after insert or update or delete on public.products
  for each row execute function public.audit_staff_changes();
drop trigger if exists audit_changes on public.categories;
create trigger audit_changes after insert or update or delete on public.categories
  for each row execute function public.audit_staff_changes();
drop trigger if exists audit_changes on public.payments;
create trigger audit_changes after insert or update or delete on public.payments
  for each row execute function public.audit_staff_changes();
drop trigger if exists audit_changes on public.product_sales;
create trigger audit_changes after insert or update or delete on public.product_sales
  for each row execute function public.audit_staff_changes();
drop trigger if exists audit_changes on public.expenses;
create trigger audit_changes after insert or update or delete on public.expenses
  for each row execute function public.audit_staff_changes();
drop trigger if exists audit_changes on public.recurring_incomes;
create trigger audit_changes after insert or update or delete on public.recurring_incomes
  for each row execute function public.audit_staff_changes();
