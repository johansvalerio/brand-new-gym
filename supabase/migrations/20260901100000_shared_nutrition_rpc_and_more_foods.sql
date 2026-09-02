-- Nutrición compartida: RPC copy_shared_nutrition_plan (mirror de copy_shared_routine)
create or replace function public.copy_shared_nutrition_plan(source_plan_id bigint)
returns public.nutrition_plans
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_caller uuid;
  v_src record;
  v_new public.nutrition_plans;
  v_day record;
  v_meal record;
  v_new_day_id bigint;
begin
  select id into v_caller from public.users where auth_id = auth.uid();
  if v_caller is null then raise exception 'No se encontró tu perfil'; end if;
  select * into v_src from public.nutrition_plans where id = source_plan_id;
  if not found then raise exception 'Plan no encontrado'; end if;
  if v_src.is_shared is not true then raise exception 'Este plan no está compartido'; end if;
  if v_src.user_id = v_caller then raise exception 'Este plan ya es tuyo'; end if;
  insert into public.nutrition_plans (user_id, created_by, name, goal, kcal_target, protein_target, notes, is_active, is_shared)
  values (v_caller, v_caller, v_src.name, v_src.goal, v_src.kcal_target, v_src.protein_target, v_src.notes, false, false)
  returning * into v_new;
  for v_day in select * from public.nutrition_days where plan_id = source_plan_id order by day_index loop
    insert into public.nutrition_days (plan_id, day_index, focus) values (v_new.id, v_day.day_index, v_day.focus) returning id into v_new_day_id;
    for v_meal in select * from public.nutrition_meals where day_id = v_day.id order by order_index loop
      insert into public.nutrition_meals (day_id, food_id, grams, meal, order_index) values (v_new_day_id, v_meal.food_id, v_meal.grams, v_meal.meal, v_meal.order_index);
    end loop;
  end loop;
  return v_new;
end;
$function$;

grant execute on function public.copy_shared_nutrition_plan(bigint) to authenticated;

-- Más alimentos (macros USDA aproximados por 100g, dominio público)
insert into public.foods (name, kcal_100, protein_100, carbs_100, fat_100) values
  ('Salmón', 208, 20.4, 0, 13),
  ('Tilapia', 96, 20, 0, 1.7),
  ('Camarones', 99, 24, 0, 0.3),
  ('Lomo de cerdo', 242, 21, 0, 15),
  ('Bistec de res', 250, 26, 0, 15),
  ('Tortilla de maíz', 218, 5.7, 46, 2.5),
  ('Pan integral', 247, 13, 41, 3.4),
  ('Queso fresco', 264, 18, 3, 20),
  ('Leche entera', 61, 3.2, 4.8, 3.3),
  ('Claras de huevo', 52, 11, 0.7, 0.2),
  ('Quinoa cocida', 120, 4.4, 21.3, 1.9),
  ('Frijoles negros', 132, 8.9, 24, 0.5),
  ('Garbanzos cocidos', 164, 8.9, 27, 2.6),
  ('Batata', 86, 1.6, 20, 0.1),
  ('Espinaca', 23, 2.9, 3.6, 0.4),
  ('Manzana', 52, 0.3, 14, 0.2),
  ('Naranja', 47, 0.9, 12, 0.1),
  ('Fresas', 32, 0.7, 7.7, 0.3),
  ('Maní sin sal', 567, 25.8, 16, 49.2),
  ('Aceite de oliva', 884, 0, 0, 100),
  ('Nueces', 607, 15, 7.3, 63),
  ('Proteína whey', 400, 80, 8, 5)
on conflict (name) do nothing;
