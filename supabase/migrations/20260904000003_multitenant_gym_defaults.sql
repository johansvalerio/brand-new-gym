-- Multi-tenant Fase 1b: default my_gym_id() en gym_id.
-- Sin default, el NOT NULL obligaría a mandar gym_id en cada insert del
-- frontend y rompería los tipos Insert generados. Con default, los hooks
-- siguen omitiéndolo (el trigger lo respeta/rellena igual) y TS lo ve opcional.
-- En signup (sin sesión) el default evalúa NULL y users.gym_id lo permite:
-- la app lo asigna en el primer login vía slug (regla first-join).

alter table public.plans           alter column gym_id set default public.my_gym_id();
alter table public.products        alter column gym_id set default public.my_gym_id();
alter table public.categories      alter column gym_id set default public.my_gym_id();
alter table public.routines        alter column gym_id set default public.my_gym_id();
alter table public.nutrition_plans alter column gym_id set default public.my_gym_id();
alter table public.payments        alter column gym_id set default public.my_gym_id();
alter table public.product_sales   alter column gym_id set default public.my_gym_id();
alter table public.check_ins       alter column gym_id set default public.my_gym_id();
alter table public.workout_logs    alter column gym_id set default public.my_gym_id();
alter table public.notifications   alter column gym_id set default public.my_gym_id();
alter table public.users           alter column gym_id set default public.my_gym_id();
