-- Platform admin (2026-09-15): flag en users + lectura cross-gym SOLO vía RPC.
-- Reglas:
--  * gym admin NO puede tocar is_platform_admin (ni a sí mismo, ni a otros):
--    el check va ANTES del bypass de admin en prevent_sensitive_changes y solo
--    pasa si no hay sesión (auth.uid() is null → SQL directo / service role).
--  * Lectura cross-gym NUNCA vía RLS ampliada: solo RPC SECURITY DEFINER que
--    verifica is_platform_admin() dentro. Escribir en otro gym sigue prohibido.
--  * is_platform_admin no aparece en ningún form de la app.

-- 1) Columna
alter table public.users
  add column if not exists is_platform_admin boolean not null default false;

-- 2) Guard absoluto: ni siquiera el admin del gym toca este flag desde la app.
create or replace function public.prevent_sensitive_changes()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  -- is_platform_admin solo se cambia sin sesión (SQL directo/MCP/service_role).
  if (OLD.is_platform_admin is distinct from NEW.is_platform_admin)
     and auth.uid() is not null then
    raise exception 'is_platform_admin solo se cambia directo en la base';
  end if;

  -- Los admins pueden cambiar rol/email de cualquier usuario de su gym.
  if public.is_admin() then
    return NEW;
  end if;

  if NEW.role <> OLD.role then
    raise exception 'No puedes cambiar tu rol';
  end if;
  if NEW.email <> OLD.email then
    raise exception 'No puedes cambiar tu email';
  end if;
  return NEW;
end;
$function$;

-- 3) Helper platform admin (mismo patrón que is_admin: anon+authenticated para
--    poder usarlo en policies si hiciera falta; el JC lo admite).
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.users
    where auth_id = auth.uid() and is_platform_admin
  );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to anon, authenticated, service_role;

-- 4) RPC de lectura cross-gym. Conteo + dinero del mes (cortes UTC) por gym.
--    Solo plataforma; service_role/simple authenticated con el flag.
create or replace function public.platform_gyms_overview()
returns table (
  gym_id uuid,
  name text,
  slug text,
  primary_color text,
  is_active boolean,
  members_total bigint,
  members_active bigint,
  signups_month bigint,
  income_month numeric,
  expenses_month numeric,
  net_month numeric,
  income_all_time numeric,
  last_checkin timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_platform_admin() then
    raise exception 'Acceso restringido a la plataforma';
  end if;

  return query
  with
  m as (
    select gym_id,
           count(*) as members_total,
           count(*) filter (where membership_status = 'active') as members_active,
           count(*) filter (where join_date >= date_trunc('month', now())) as signups_month
    from public.users
    group by gym_id
  ),
  p as (
    select gym_id,
           sum(amount) filter (where decided_at >= date_trunc('month', now())) as m_income,
           sum(amount) as total_income
    from public.payments
    where status = 'approved'
    group by gym_id
  ),
  s as (
    select gym_id,
           sum(total) filter (where sold_at >= date_trunc('month', now())) as m_sales,
           sum(total) as total_sales
    from public.product_sales
    where status = 'approved'
    group by gym_id
  ),
  e as (
    select gym_id,
           sum(amount) filter (where expense_date >= (date_trunc('month', now()))::date) as m_exp
    from public.expenses
    group by gym_id
  ),
  r as (
    select gym_id, sum(amount) as rents
    from public.recurring_incomes
    where is_active
    group by gym_id
  ),
  c as (
    select gym_id, max(checked_in_at) as last_ci
    from public.check_ins
    group by gym_id
  )
  select g.id,
         g.name,
         g.slug,
         g.primary_color,
         g.is_active,
         coalesce(m.members_total, 0),
         coalesce(m.members_active, 0),
         coalesce(m.signups_month, 0),
         coalesce(p.m_income, 0) + coalesce(s.m_sales, 0) + coalesce(r.rents, 0),
         coalesce(e.m_exp, 0),
         coalesce(p.m_income, 0) + coalesce(s.m_sales, 0) + coalesce(r.rents, 0) - coalesce(e.m_exp, 0),
         coalesce(p.total_income, 0) + coalesce(s.total_sales, 0),
         c.last_ci
  from public.gyms g
  left join m on m.gym_id = g.id
  left join p on p.gym_id = g.id
  left join s on s.gym_id = g.id
  left join e on e.gym_id = g.id
  left join r on r.gym_id = g.id
  left join c on c.gym_id = g.id
  order by g.created_at;
end;
$function$;

revoke all on function public.platform_gyms_overview() from public, anon;
grant execute on function public.platform_gyms_overview() to authenticated, service_role;
