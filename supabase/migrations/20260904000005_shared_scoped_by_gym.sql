-- Multi-tenant Fase 1b: compartidos (rutinas/nutrición/votos/rankings) aislados POR GYM.
-- Regla del dueño (2026-09-04): rankings y contenido compartido son por gym.
-- Solo foods/exercises (catálogos globales + imágenes) quedan compartidos.
--
-- anon mantiene SELECT de compartidos/votos: la landing pública /[slug] filtra por
-- gym en frontend y el contenido compartido es público por diseño. Sin esta rama,
-- my_gym_id() = NULL dejaría la landing vacía.
-- authenticated solo ve compartidos/votos de SU gym (gym_id = my_gym_id()).

-- ============ 1) can_vote_routine: solo compartidas del propio gym ============
create or replace function public.can_vote_routine(target_routine_id bigint, target_user_id uuid)
returns boolean
language sql stable security definer set search_path to 'public'
as $function$
  select target_user_id = (
    select u.id from public.users u where u.auth_id = auth.uid()
  )
  and exists (
    select 1
    from public.routines r
    join public.users author on author.id = r.created_by
    where r.id = target_routine_id
      and r.is_shared = true
      and r.gym_id = public.my_gym_id()
      and author.auth_id <> auth.uid()
  );
$function$;

-- ============ 2) copy_shared_routine: bloquea copia cross-gym ============
create or replace function public.copy_shared_routine(source_routine_id bigint)
returns routines
language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_caller uuid;
  v_caller_gym uuid;
  v_src record;
  v_new public.routines;
  v_day record;
  v_ex record;
  v_new_day_id bigint;
begin
  select id, gym_id into v_caller, v_caller_gym from public.users where auth_id = auth.uid();
  if v_caller is null then
    raise exception 'No se encontró tu perfil';
  end if;

  select * into v_src from public.routines where id = source_routine_id;
  if not found then
    raise exception 'Rutina no encontrada';
  end if;
  if v_src.is_shared is not true then
    raise exception 'Esta rutina no está compartida';
  end if;
  if v_src.user_id = v_caller then
    raise exception 'Esta rutina ya es tuya';
  end if;
  if v_src.gym_id is distinct from v_caller_gym then
    raise exception 'Esta rutina es de otro gym';
  end if;

  insert into public.routines (name, goal, days_per_week, notes, is_active, is_shared, user_id, created_by)
  values (v_src.name, v_src.goal, v_src.days_per_week, v_src.notes, false, false, v_caller, v_caller)
  returning * into v_new;

  for v_day in select * from public.routine_days where routine_id = source_routine_id order by day_index loop
    insert into public.routine_days (routine_id, day_index, focus)
    values (v_new.id, v_day.day_index, v_day.focus)
    returning id into v_new_day_id;

    for v_ex in select * from public.routine_exercises where day_id = v_day.id order by order_index loop
      insert into public.routine_exercises (day_id, exercise_id, order_index, sets, reps, rest_seconds, notes)
      values (v_new_day_id, v_ex.exercise_id, v_ex.order_index, v_ex.sets, v_ex.reps, v_ex.rest_seconds, v_ex.notes);
    end loop;
  end loop;

  return v_new;
end;
$function$;

-- ============ 3) copy_shared_nutrition_plan: bloquea copia cross-gym ============
create or replace function public.copy_shared_nutrition_plan(source_plan_id bigint)
returns nutrition_plans
language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_caller uuid;
  v_caller_gym uuid;
  v_src record;
  v_new public.nutrition_plans;
  v_day record;
  v_meal record;
  v_new_day_id bigint;
begin
  select id, gym_id into v_caller, v_caller_gym from public.users where auth_id = auth.uid();
  if v_caller is null then
    raise exception 'No se encontró tu perfil';
  end if;

  select * into v_src from public.nutrition_plans where id = source_plan_id;
  if not found then
    raise exception 'Plan no encontrado';
  end if;
  if v_src.is_shared is not true then
    raise exception 'Este plan no está compartido';
  end if;
  if v_src.user_id = v_caller then
    raise exception 'Este plan ya es tuyo';
  end if;
  if v_src.gym_id is distinct from v_caller_gym then
    raise exception 'Este plan es de otro gym';
  end if;

  insert into public.nutrition_plans (user_id, created_by, name, goal, kcal_target, protein_target, notes, is_active, is_shared)
  values (v_caller, v_caller, v_src.name, v_src.goal, v_src.kcal_target, v_src.protein_target, v_src.notes, false, false)
  returning * into v_new;

  for v_day in select * from public.nutrition_days where plan_id = source_plan_id order by day_index loop
    insert into public.nutrition_days (plan_id, day_index, focus)
    values (v_new.id, v_day.day_index, v_day.focus)
    returning id into v_new_day_id;

    for v_meal in select * from public.nutrition_meals where day_id = v_day.id order by order_index loop
      insert into public.nutrition_meals (day_id, food_id, grams, meal, order_index)
      values (v_new_day_id, v_meal.food_id, v_meal.grams, v_meal.meal, v_meal.order_index);
    end loop;
  end loop;

  return v_new;
end;
$function$;

-- ============ 4) routines header: split anon / authenticated ============
drop policy if exists "Shared routines viewable by everyone" on public.routines;
drop policy if exists "Routines viewable by owner, admin and coach" on public.routines;
create policy "Shared routines viewable anon"
  on public.routines for select to anon
  using (is_shared = true);
create policy "Routines viewable authenticated"
  on public.routines for select to authenticated
  using (
    (is_shared = true and gym_id = public.my_gym_id())
    or exists (select 1 from public.users u where u.id = routines.user_id and u.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

-- ============ 5) routine_days: split anon / authenticated ============
drop policy if exists "Routine days viewable" on public.routine_days;
create policy "Routine days viewable anon"
  on public.routine_days for select to anon
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_days.routine_id and r.is_shared = true
    )
  );
create policy "Routine days viewable authenticated"
  on public.routine_days for select to authenticated
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_days.routine_id
        and (
          (r.is_shared = true and r.gym_id = public.my_gym_id())
          or exists (select 1 from public.users u where u.id = r.user_id and u.auth_id = auth.uid())
          or ((is_admin() or is_coach()) and r.gym_id = public.my_gym_id())
        )
    )
  );

-- ============ 6) routine_exercises: split anon / authenticated ============
drop policy if exists "Routine exercises viewable" on public.routine_exercises;
create policy "Routine exercises viewable anon"
  on public.routine_exercises for select to anon
  using (
    exists (
      select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
      where d.id = routine_exercises.day_id and r.is_shared = true
    )
  );
create policy "Routine exercises viewable authenticated"
  on public.routine_exercises for select to authenticated
  using (
    exists (
      select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
      where d.id = routine_exercises.day_id
        and (
          (r.is_shared = true and r.gym_id = public.my_gym_id())
          or exists (select 1 from public.users u where u.id = r.user_id and u.auth_id = auth.uid())
          or ((is_admin() or is_coach()) and r.gym_id = public.my_gym_id())
        )
    )
  );

-- ============ 7) nutrition_plans header: split anon / authenticated ============
drop policy if exists "nutrition_plans_select" on public.nutrition_plans;
create policy "nutrition_plans_select_anon"
  on public.nutrition_plans for select to anon
  using (is_shared = true);
create policy "nutrition_plans_select_authenticated"
  on public.nutrition_plans for select to authenticated
  using (
    (is_shared = true and gym_id = public.my_gym_id())
    or user_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

-- ============ 8) nutrition_days: split anon / authenticated ============
drop policy if exists "nutrition_days_select" on public.nutrition_days;
create policy "nutrition_days_select_anon"
  on public.nutrition_days for select to anon
  using (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = nutrition_days.plan_id and p.is_shared = true
    )
  );
create policy "nutrition_days_select_authenticated"
  on public.nutrition_days for select to authenticated
  using (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = nutrition_days.plan_id
        and (
          (p.is_shared = true and p.gym_id = public.my_gym_id())
          or p.user_id = (select users.id from public.users where users.auth_id = auth.uid())
          or ((is_admin() or is_coach()) and p.gym_id = public.my_gym_id())
        )
    )
  );

-- ============ 9) nutrition_meals: split anon / authenticated ============
drop policy if exists "nutrition_meals_select" on public.nutrition_meals;
create policy "nutrition_meals_select_anon"
  on public.nutrition_meals for select to anon
  using (
    exists (
      select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id
      where d.id = nutrition_meals.day_id and p.is_shared = true
    )
  );
create policy "nutrition_meals_select_authenticated"
  on public.nutrition_meals for select to authenticated
  using (
    exists (
      select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id
      where d.id = nutrition_meals.day_id
        and (
          (p.is_shared = true and p.gym_id = public.my_gym_id())
          or p.user_id = (select users.id from public.users where users.auth_id = auth.uid())
          or ((is_admin() or is_coach()) and p.gym_id = public.my_gym_id())
        )
    )
  );

-- ============ 10) votes: anon abierto, authenticated por gym del padre ============
drop policy if exists "Votes viewable by everyone" on public.routine_votes;
create policy "Routine votes viewable anon"
  on public.routine_votes for select to anon
  using (true);
create policy "Routine votes viewable authenticated"
  on public.routine_votes for select to authenticated
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_votes.routine_id and r.gym_id = public.my_gym_id()
    )
  );

drop policy if exists "nutrition_votes_select" on public.nutrition_votes;
create policy "nutrition_votes_select_anon"
  on public.nutrition_votes for select to anon
  using (true);
create policy "nutrition_votes_select_authenticated"
  on public.nutrition_votes for select to authenticated
  using (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = nutrition_votes.plan_id and p.gym_id = public.my_gym_id()
    )
  );

-- voto nutrición: además de anti-self-vote, el plan debe ser del propio gym
drop policy if exists "nutrition_votes_insert" on public.nutrition_votes;
create policy "nutrition_votes_insert"
  on public.nutrition_votes for insert
  with check (
    user_id = (select id from public.users where auth_id = auth.uid())
    and not exists (select 1 from public.nutrition_plans p where p.id = plan_id and p.created_by = (select id from public.users where auth_id = auth.uid()))
    and exists (select 1 from public.nutrition_plans p where p.id = plan_id and p.gym_id = public.my_gym_id())
  );
-- routine_votes_insert ya pasa por can_vote_routine() (§1, con gym). Sin cambios.
