-- Multi-tenant seeds: gym propio + 2 prospectos + slugs únicos por gym.
-- plans_slug_key / categories_slug_key eran UNIQUE globales: dos gyms no podían
-- tener el slug "mensual". Pasan a UNIQUE(gym_id, slug).

-- 1) Gym propio
update public.gyms
set slug = 'gym-ulate', name = 'Gym-Ulate'
where slug = 'principal';

-- 2) Prospectos
insert into public.gyms (slug, name)
values ('zona-fit', 'Zona Fit'),
       ('isaac-castro', 'Isaac Castro')
on conflict (slug) do nothing;

-- 3) Slugs únicos por gym (no globales)
alter table public.plans drop constraint if exists plans_slug_key;
alter table public.plans add constraint plans_gym_slug_key unique (gym_id, slug);

alter table public.categories drop constraint if exists categories_slug_key;
alter table public.categories add constraint categories_gym_slug_key unique (gym_id, slug);

-- 4) Starter kit: clonar catálogo de gym-ulate a cada prospecto.
-- Categorías (mismo slug, distinto gym)
insert into public.categories (gym_id, slug, name)
select g.id, c.slug, c.name
from public.categories c
cross join (select id from public.gyms where slug in ('zona-fit', 'isaac-castro')) g
where c.gym_id = (select id from public.gyms where slug = 'gym-ulate')
on conflict (gym_id, slug) do nothing;

-- Planes
insert into public.plans (gym_id, slug, name, duration_days, price, is_active)
select g.id, p.slug, p.name, p.duration_days, p.price, p.is_active
from public.plans p
cross join (select id from public.gyms where slug in ('zona-fit', 'isaac-castro')) g
where p.gym_id = (select id from public.gyms where slug = 'gym-ulate')
on conflict (gym_id, slug) do nothing;

-- Productos (remapeando categoría por slug dentro del gym destino)
insert into public.products (gym_id, category_id, product_name, product_price, product_stock, product_image, product_description)
select g.id, tc.id, p.product_name, p.product_price, p.product_stock, p.product_image, p.product_description
from public.products p
cross join (select id from public.gyms where slug in ('zona-fit', 'isaac-castro')) g
left join public.categories sc on sc.id = p.category_id
left join public.categories tc on tc.gym_id = g.id and tc.slug = sc.slug
where p.gym_id = (select id from public.gyms where slug = 'gym-ulate')
on conflict do nothing;
