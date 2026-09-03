-- Multi-tenant Fase 1: tabla gyms + gym_id + backfill + helpers + triggers + guards.
-- users.gym_id queda NULLABLE a propósito: handle_new_user() crea el perfil sin
-- gym (OAuth no trae slug) y la app lo asigna en el primer login (regla first-join
-- en la policy "Users can update own profile", migración Fase 2).

-- 1) Tabla gyms (branding público: nombre/logo/color van en landings por slug)
create table if not exists public.gyms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  primary_color text not null default '#96D906',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS de gyms (§4): va tras crear my_gym_id(), que a su vez exige users.gym_id (§2).

-- 2) Columna gym_id en tablas tenant (catálogos globales exercises/foods quedan fuera)
alter table public.users           add column if not exists gym_id uuid references public.gyms(id);
alter table public.plans           add column if not exists gym_id uuid references public.gyms(id);
alter table public.products        add column if not exists gym_id uuid references public.gyms(id);
alter table public.categories      add column if not exists gym_id uuid references public.gyms(id);
alter table public.routines        add column if not exists gym_id uuid references public.gyms(id);
alter table public.nutrition_plans add column if not exists gym_id uuid references public.gyms(id);
alter table public.payments        add column if not exists gym_id uuid references public.gyms(id);
alter table public.product_sales   add column if not exists gym_id uuid references public.gyms(id);
alter table public.check_ins       add column if not exists gym_id uuid references public.gyms(id);
alter table public.workout_logs    add column if not exists gym_id uuid references public.gyms(id);
alter table public.notifications   add column if not exists gym_id uuid references public.gyms(id);

create index if not exists users_gym_id_idx           on public.users (gym_id);
create index if not exists plans_gym_id_idx           on public.plans (gym_id);
create index if not exists products_gym_id_idx        on public.products (gym_id);
create index if not exists categories_gym_id_idx      on public.categories (gym_id);
create index if not exists routines_gym_id_idx        on public.routines (gym_id);
create index if not exists nutrition_plans_gym_id_idx on public.nutrition_plans (gym_id);
create index if not exists payments_gym_id_idx        on public.payments (gym_id);
create index if not exists product_sales_gym_id_idx   on public.product_sales (gym_id);
create index if not exists check_ins_gym_id_idx       on public.check_ins (gym_id);
create index if not exists workout_logs_gym_id_idx    on public.workout_logs (gym_id);
create index if not exists notifications_gym_id_idx   on public.notifications (gym_id);

-- 3) Gym inicial + backfill de datos existentes
insert into public.gyms (slug, name)
values ('principal', 'Mi Gimnasio')
on conflict (slug) do nothing;

update public.users           set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.plans           set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.products        set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.categories      set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.routines        set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.nutrition_plans set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.payments        set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.product_sales   set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.check_ins       set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.workout_logs    set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;
update public.notifications   set gym_id = (select id from public.gyms where slug = 'principal') where gym_id is null;

-- NOT NULL en todo menos users (ver encabezado: signup deja NULL transitorio)
alter table public.plans           alter column gym_id set not null;
alter table public.products        alter column gym_id set not null;
alter table public.categories      alter column gym_id set not null;
alter table public.routines        alter column gym_id set not null;
alter table public.nutrition_plans alter column gym_id set not null;
alter table public.payments        alter column gym_id set not null;
alter table public.product_sales   alter column gym_id set not null;
alter table public.check_ins       alter column gym_id set not null;
alter table public.workout_logs    alter column gym_id set not null;
alter table public.notifications   alter column gym_id set not null;

-- 4) Helper: gym del usuario autenticado (SECURITY DEFINER, patrón context7).
-- Tras §2 porque el cuerpo valida users.gym_id al crearse.
create or replace function public.my_gym_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select gym_id from public.users where auth_id = auth.uid();
$$;

-- 4b) RLS de gyms (branding público para landings por slug; edición solo su admin)
alter table public.gyms enable row level security;

drop policy if exists "Gyms visibles para todos" on public.gyms;
create policy "Gyms visibles para todos"
  on public.gyms for select to public using (true);

drop policy if exists "Gyms editables por su admin" on public.gyms;
create policy "Gyms editables por su admin"
  on public.gyms for update to public
  using (is_admin() and id = public.my_gym_id())
  with check (is_admin() and id = public.my_gym_id());

-- 5) Trigger: el cliente nunca manda gym_id; se hereda del autor.
-- Si viene seteado (admin creando para su gym) se respeta; si el autor no
-- tiene gym (signup vía handle_new_user) queda NULL y la app lo asigna luego.
create or replace function public.set_gym_id_from_auth()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_gym uuid;
begin
  if new.gym_id is not null then
    return new;
  end if;
  select gym_id into v_gym from public.users where auth_id = auth.uid();
  if v_gym is not null then
    new.gym_id := v_gym;
  end if;
  return new;
end;
$$;

drop trigger if exists set_gym_id on public.users;
create trigger set_gym_id before insert on public.users
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.plans;
create trigger set_gym_id before insert on public.plans
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.products;
create trigger set_gym_id before insert on public.products
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.categories;
create trigger set_gym_id before insert on public.categories
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.routines;
create trigger set_gym_id before insert on public.routines
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.nutrition_plans;
create trigger set_gym_id before insert on public.nutrition_plans
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.payments;
create trigger set_gym_id before insert on public.payments
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.product_sales;
create trigger set_gym_id before insert on public.product_sales
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.check_ins;
create trigger set_gym_id before insert on public.check_ins
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.workout_logs;
create trigger set_gym_id before insert on public.workout_logs
  for each row execute function public.set_gym_id_from_auth();
drop trigger if exists set_gym_id on public.notifications;
create trigger set_gym_id before insert on public.notifications
  for each row execute function public.set_gym_id_from_auth();

-- 6) Guard tenant en activate_membership (acepta IDs ajenos por parámetro)
create or replace function public.activate_membership(target_user_id uuid, target_plan_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_duration int;
  v_current_end timestamptz;
  v_current_start timestamptz;
  v_base timestamptz;
  v_my_gym uuid;
begin
  select gym_id into v_my_gym from public.users where auth_id = auth.uid();

  if exists (
    select 1 from public.users u
    where u.id = target_user_id and u.gym_id is distinct from v_my_gym
  ) then
    raise exception 'El miembro no pertenece a tu gym';
  end if;

  if exists (
    select 1 from public.plans p
    where p.id = target_plan_id and p.gym_id is distinct from v_my_gym
  ) then
    raise exception 'El plan no pertenece a tu gym';
  end if;

  select duration_days into v_duration from public.plans where id = target_plan_id;
  if v_duration is null then
    raise exception 'Plan no encontrado';
  end if;

  select membership_end, membership_start
    into v_current_end, v_current_start
  from public.users where id = target_user_id;

  -- Acumula: si sigue vigente, el nuevo período parte del fin actual.
  v_base := greatest(coalesce(v_current_end, now()), now());

  perform set_config('app.skip_plan_duration', 'true', true);

  update public.users
  set plan_id = target_plan_id,
      membership_start = case
        when v_current_end is not null and v_current_end > now()
          then coalesce(v_current_start, now())
        else now()
      end,
      membership_end = v_base + make_interval(days => v_duration),
      membership_status = 'active',
      updated_at = now()
  where id = target_user_id;
end;
$$;

-- 7) validate_coach_role: el coach debe ser del mismo gym (cuando ambos tienen gym)
create or replace function public.validate_coach_role()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_coach_gym uuid;
  v_coach_role text;
begin
  if new.coach_id is not null then
    select role, gym_id into v_coach_role, v_coach_gym
    from public.users u where u.id = new.coach_id;

    if v_coach_role is null or v_coach_role <> 'coach' then
      raise exception 'coach_id debe referenciar un usuario con role = coach';
    end if;

    if new.gym_id is not null and v_coach_gym is not null
       and v_coach_gym is distinct from new.gym_id then
      raise exception 'El coach debe pertenecer al mismo gym';
    end if;
  end if;
  return new;
end;
$$;
