-- Nutrición: catálogo alimentos + planes 7 días con comidas, sharing como rutinas
create table if not exists public.foods (
  id bigint generated always as identity primary key,
  name text not null unique,
  kcal_100 numeric not null check (kcal_100 >= 0),
  protein_100 numeric not null check (protein_100 >= 0),
  carbs_100 numeric not null check (carbs_100 >= 0),
  fat_100 numeric not null check (fat_100 >= 0),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_plans (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  name text not null,
  goal text not null check (goal in ('volumen','definicion','mantenimiento')),
  kcal_target int,
  protein_target int,
  notes text,
  is_active boolean not null default true,
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_days (
  id bigint generated always as identity primary key,
  plan_id bigint not null references public.nutrition_plans(id) on delete cascade,
  day_index int not null check (day_index between 1 and 7),
  focus text not null,
  unique(plan_id, day_index)
);

create table if not exists public.nutrition_meals (
  id bigint generated always as identity primary key,
  day_id bigint not null references public.nutrition_days(id) on delete cascade,
  food_id bigint not null references public.foods(id) on delete restrict,
  grams int not null check (grams > 0),
  meal text not null check (meal in ('desayuno','almuerzo','cena','snack')),
  order_index int not null default 0
);

create table if not exists public.nutrition_votes (
  id bigint generated always as identity primary key,
  plan_id bigint not null references public.nutrition_plans(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(plan_id, user_id)
);

-- Índices
create index if not exists nutrition_plans_user_idx on public.nutrition_plans(user_id);
create index if not exists nutrition_days_plan_idx on public.nutrition_days(plan_id);
create index if not exists nutrition_meals_day_idx on public.nutrition_meals(day_id);
create index if not exists nutrition_votes_plan_idx on public.nutrition_votes(plan_id);

-- Seed 12 alimentos base (USDA-style, dominio público)
insert into public.foods (name, kcal_100, protein_100, carbs_100, fat_100) values
  ('Pollo pechuga', 165, 31, 0, 3.6),
  ('Arroz blanco cocido', 130, 2.7, 28, 0.3),
  ('Huevo', 143, 12.6, 0.7, 9.5),
  ('Avena', 389, 16.9, 66, 6.9),
  ('Brocoli', 34, 2.8, 7, 0.4),
  ('Papa', 77, 2, 17, 0.1),
  ('Carne molida 90%', 176, 26, 0, 8),
  ('Atún en agua', 116, 25.5, 0, 0.8),
  ('Yogur natural', 59, 3.5, 5, 3.3),
  ('Aguacate', 160, 2, 8.5, 14.7),
  ('Lentejas cocidas', 116, 9, 20, 0.4),
  ('Banano', 89, 1.1, 23, 0.3)
on conflict (name) do nothing;

-- RLS
alter table public.foods enable row level security;
alter table public.nutrition_plans enable row level security;
alter table public.nutrition_days enable row level security;
alter table public.nutrition_meals enable row level security;
alter table public.nutrition_votes enable row level security;

drop policy if exists "foods_select_all" on public.foods;
create policy "foods_select_all" on public.foods for select using (true);

drop policy if exists "nutrition_plans_select" on public.nutrition_plans;
create policy "nutrition_plans_select" on public.nutrition_plans for select using (
  is_shared = true or user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach()
);
drop policy if exists "nutrition_plans_insert" on public.nutrition_plans;
create policy "nutrition_plans_insert" on public.nutrition_plans for insert with check (
  user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach()
);
drop policy if exists "nutrition_plans_update" on public.nutrition_plans;
create policy "nutrition_plans_update" on public.nutrition_plans for update using (
  user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach() or created_by = (select id from public.users where auth_id = auth.uid())
) with check (
  user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach() or created_by = (select id from public.users where auth_id = auth.uid())
);
drop policy if exists "nutrition_plans_delete" on public.nutrition_plans;
create policy "nutrition_plans_delete" on public.nutrition_plans for delete using (
  user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach() or created_by = (select id from public.users where auth_id = auth.uid())
);

-- days/meals heredan via plan: si puedes ver el plan, ves sus días/comidas
drop policy if exists "nutrition_days_select" on public.nutrition_days;
create policy "nutrition_days_select" on public.nutrition_days for select using (
  exists (select 1 from public.nutrition_plans p where p.id = plan_id and (p.is_shared = true or p.user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach()))
);
drop policy if exists "nutrition_days_all" on public.nutrition_days;
create policy "nutrition_days_all" on public.nutrition_days for all using (
  exists (select 1 from public.nutrition_plans p where p.id = plan_id and (p.user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach() or p.created_by = (select id from public.users where auth_id = auth.uid())))
) with check (
  exists (select 1 from public.nutrition_plans p where p.id = plan_id and (p.user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach() or p.created_by = (select id from public.users where auth_id = auth.uid())))
);

drop policy if exists "nutrition_meals_select" on public.nutrition_meals;
create policy "nutrition_meals_select" on public.nutrition_meals for select using (
  exists (select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id where d.id = day_id and (p.is_shared = true or p.user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach()))
);
drop policy if exists "nutrition_meals_all" on public.nutrition_meals;
create policy "nutrition_meals_all" on public.nutrition_meals for all using (
  exists (select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id where d.id = day_id and (p.user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach() or p.created_by = (select id from public.users where auth_id = auth.uid())))
) with check (
  exists (select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id where d.id = day_id and (p.user_id = (select id from public.users where auth_id = auth.uid()) or public.is_admin() or public.is_coach() or p.created_by = (select id from public.users where auth_id = auth.uid())))
);

-- votes: todos ven, votan si no son dueños/creadores
drop policy if exists "nutrition_votes_select" on public.nutrition_votes;
create policy "nutrition_votes_select" on public.nutrition_votes for select using (true);
drop policy if exists "nutrition_votes_insert" on public.nutrition_votes;
create policy "nutrition_votes_insert" on public.nutrition_votes for insert with check (
  user_id = (select id from public.users where auth_id = auth.uid())
  and not exists (select 1 from public.nutrition_plans p where p.id = plan_id and p.created_by = (select id from public.users where auth_id = auth.uid()))
);
drop policy if exists "nutrition_votes_delete" on public.nutrition_votes;
create policy "nutrition_votes_delete" on public.nutrition_votes for delete using (user_id = (select id from public.users where auth_id = auth.uid()));

-- trigger updated_at
create or replace function public.set_nutrition_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists nutrition_plans_updated_at on public.nutrition_plans;
create trigger nutrition_plans_updated_at before update on public.nutrition_plans for each row execute function public.set_nutrition_updated_at();

-- trigger prevent_unauthorized_share (solo autor/admin)
create or replace function public.prevent_nutrition_unauthorized_share() returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if new.is_shared and not (public.is_admin() or new.created_by = (select id from public.users where auth_id = auth.uid())) then
    raise exception 'Solo el autor o admin puede compartir';
  end if;
  return new;
end; $$;
drop trigger if exists nutrition_prevent_share on public.nutrition_plans;
create trigger nutrition_prevent_share before update on public.nutrition_plans for each row execute function public.prevent_nutrition_unauthorized_share();
