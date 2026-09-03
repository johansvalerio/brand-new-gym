-- Multi-tenant Fase 2: scoping por tenant en las policies con ramas staff.
-- Reglas aplicadas:
--   * Ramas is_admin()/is_coach() exigen gym_id = my_gym_id() (directo o vía padre).
--   * Ramas de ownership propio no cambian (el dueño siempre es de su gym).
--   * SELECT públicos por diseño (is_shared=true, catálogos, votos) NO cambian:
--     el frontend siempre filtra por gym y ese contenido es público igual que
--     una landing. Anon con my_gym_id()=NULL los seguiría viendo; con gym
--     romperíamos el anon. Decisión documentada, no oversight.
--   * users.gym_id: NULL transitorio hasta el primer login (handle_new_user).
--     El admin ve filas NULL para asignarlas; el first-join lo permite el pin.

-- Helper: gym ANTERIOR de un usuario (para el pin first-join). SECURITY DEFINER
-- para leer la fila sin recursión de RLS; en WITH CHECK las columnas van
-- peladas (NEW/OLD solo existen en triggers, no en policies).
create or replace function public.gym_before_update(target_id uuid)
returns uuid
language sql stable security definer set search_path = public as $$
  select gym_id from public.users where id = target_id;
$$;

-- ============ users ============
drop policy if exists "Admins can view all users" on public.users;
create policy "Admins can view all users"
  on public.users for select to public
  using (is_admin() and (gym_id = public.my_gym_id() or gym_id is null));

drop policy if exists "Coaches can view users" on public.users;
create policy "Coaches can view users"
  on public.users for select to public
  using (is_coach() and gym_id = public.my_gym_id());

drop policy if exists "Admins can insert users" on public.users;
create policy "Admins can insert users"
  on public.users for insert to public
  with check (is_admin() and gym_id = public.my_gym_id());

drop policy if exists "Admins can update all users" on public.users;
create policy "Admins can update all users"
  on public.users for update to public
  using (is_admin() and gym_id = public.my_gym_id())
  with check (is_admin() and gym_id = public.my_gym_id());

drop policy if exists "Admins can delete users" on public.users;
create policy "Admins can delete users"
  on public.users for delete to public
  using (is_admin() and gym_id = public.my_gym_id());

-- Own UPDATE: mismo pin de campos sensibles + pin de gym.
-- Ni USING ve NEW ni WITH CHECK ve OLD en Postgres: el first-join se expresa
-- leyendo la fila comitada con subconsulta (la fila aún no se actualizó al
-- evaluar el check, así que el SELECT ve el gym ANTERIOR).
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update to public
  using (auth.uid() = auth_id)
  with check (
    (auth.uid() = auth_id)
    and not (role is distinct from (select u.role from public.users u where u.auth_id = auth.uid()))
    and not (coach_id is distinct from (select u.coach_id from public.users u where u.auth_id = auth.uid()))
    and not (membership_status is distinct from (select u.membership_status from public.users u where u.auth_id = auth.uid()))
    and not (membership_start is distinct from (select u.membership_start from public.users u where u.auth_id = auth.uid()))
    and not (membership_end is distinct from (select u.membership_end from public.users u where u.auth_id = auth.uid()))
    and not (plan_id is distinct from (select u.plan_id from public.users u where u.auth_id = auth.uid()))
    and gym_id is not null
    and (
      public.gym_before_update(id) is null
      or public.gym_before_update(id) = gym_id
    )
  );

-- ============ check_ins ============
drop policy if exists "Admins can delete check-ins" on public.check_ins;
create policy "Admins can delete check-ins"
  on public.check_ins for delete to public
  using (is_admin() and gym_id = public.my_gym_id());

drop policy if exists "Users can view own check-ins" on public.check_ins;
create policy "Users can view own check-ins"
  on public.check_ins for select to public
  using (
    user_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

-- ============ workout_logs ============
drop policy if exists "Admins can delete workout logs" on public.workout_logs;
create policy "Admins can delete workout logs"
  on public.workout_logs for delete to public
  using (is_admin() and gym_id = public.my_gym_id());

drop policy if exists "Users can view own workout logs" on public.workout_logs;
create policy "Users can view own workout logs"
  on public.workout_logs for select to public
  using (
    user_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

drop policy if exists "Users can update own workout logs" on public.workout_logs;
create policy "Users can update own workout logs"
  on public.workout_logs for update to public
  using (
    user_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  )
  with check (
    user_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

drop policy if exists "Users can delete own workout logs" on public.workout_logs;
create policy "Users can delete own workout logs"
  on public.workout_logs for delete to public
  using (
    user_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

-- ============ set_logs (gym vía workout_logs padre) ============
drop policy if exists "Admins can delete set logs" on public.set_logs;
create policy "Admins can delete set logs"
  on public.set_logs for delete to public
  using (
    is_admin()
    and exists (select 1 from public.workout_logs wl where wl.id = set_logs.workout_log_id and wl.gym_id = public.my_gym_id())
  );

drop policy if exists "Users can view own set logs" on public.set_logs;
create policy "Users can view own set logs"
  on public.set_logs for select to public
  using (
    exists (
      select 1 from public.workout_logs wl
      where wl.id = set_logs.workout_log_id
        and (wl.user_id = (select users.id from public.users where users.auth_id = auth.uid()) or is_admin() or is_coach())
    )
    and exists (select 1 from public.workout_logs wl where wl.id = set_logs.workout_log_id and wl.gym_id = public.my_gym_id())
  );

drop policy if exists "Users can update own set logs" on public.set_logs;
create policy "Users can update own set logs"
  on public.set_logs for update to public
  using (
    exists (
      select 1 from public.workout_logs wl
      where wl.id = set_logs.workout_log_id
        and (wl.user_id = (select users.id from public.users where users.auth_id = auth.uid()) or is_admin() or is_coach())
    )
    and exists (select 1 from public.workout_logs wl where wl.id = set_logs.workout_log_id and wl.gym_id = public.my_gym_id())
  );

drop policy if exists "Users can delete own set logs" on public.set_logs;
create policy "Users can delete own set logs"
  on public.set_logs for delete to public
  using (
    exists (
      select 1 from public.workout_logs wl
      where wl.id = set_logs.workout_log_id
        and (wl.user_id = (select users.id from public.users where users.auth_id = auth.uid()) or is_admin() or is_coach())
    )
    and exists (select 1 from public.workout_logs wl where wl.id = set_logs.workout_log_id and wl.gym_id = public.my_gym_id())
  );

-- ============ payments ============
drop policy if exists "Admins can decide payment requests" on public.payments;
create policy "Admins can decide payment requests"
  on public.payments for update to public
  using (is_admin() and gym_id = public.my_gym_id());

drop policy if exists "Payments insertable por dueño o admin" on public.payments;
create policy "Payments insertable por dueño o admin"
  on public.payments for insert to public
  with check (
    (is_admin() or user_id = (select users.id from public.users where users.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  );

drop policy if exists "Users can cancel own pending requests" on public.payments;
create policy "Users can cancel own pending requests"
  on public.payments for delete to public
  using (
    status = 'pending'
    and user_id = (select users.id from public.users where users.auth_id = auth.uid())
    and gym_id = public.my_gym_id()
  );

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments"
  on public.payments for select to public
  using (
    (is_admin() or user_id = (select users.id from public.users where users.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  );

-- ============ product_sales ============
drop policy if exists "product_sales_admin_write" on public.product_sales;
create policy "product_sales_admin_write"
  on public.product_sales for all to authenticated
  using (is_admin() and gym_id = public.my_gym_id())
  with check (is_admin() and gym_id = public.my_gym_id());

drop policy if exists "product_sales_select_self_or_staff" on public.product_sales;
create policy "product_sales_select_self_or_staff"
  on public.product_sales for select to authenticated
  using (
    buyer_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

drop policy if exists "product_sales_self_insert" on public.product_sales;
create policy "product_sales_self_insert"
  on public.product_sales for insert to authenticated
  with check (
    buyer_id = (select users.id from public.users where users.auth_id = auth.uid())
    and coalesce(status, 'pending') = 'pending'
    and gym_id = public.my_gym_id()
  );

-- ============ routines ============
drop policy if exists "Routines viewable by owner, admin and coach" on public.routines;
create policy "Routines viewable by owner, admin and coach"
  on public.routines for select to public
  using (
    exists (select 1 from public.users u where u.id = routines.user_id and u.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

drop policy if exists "Routines writable by admin, coach or self" on public.routines;
create policy "Routines writable by admin, coach or self"
  on public.routines for all to public
  using (
    (is_admin() or is_coach()
     or exists (select 1 from public.users u where u.id = routines.user_id and u.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  )
  with check (
    (is_admin() or is_coach()
     or exists (select 1 from public.users u where u.id = routines.user_id and u.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  );

-- ============ routine_days ============
drop policy if exists "Routine days viewable" on public.routine_days;
create policy "Routine days viewable"
  on public.routine_days for select to public
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_days.routine_id
        and (
          r.is_shared = true
          or exists (select 1 from public.users u where u.id = r.user_id and u.auth_id = auth.uid())
          or ((is_admin() or is_coach()) and r.gym_id = public.my_gym_id())
        )
    )
  );

drop policy if exists "Routine days writable" on public.routine_days;
create policy "Routine days writable"
  on public.routine_days for all to public
  using (
    (is_admin() or is_coach()
     or exists (
       select 1 from public.routines r join public.users u on u.id = r.user_id
       where r.id = routine_days.routine_id and u.auth_id = auth.uid()
     ))
    and exists (select 1 from public.routines r where r.id = routine_days.routine_id and r.gym_id = public.my_gym_id())
  )
  with check (
    (is_admin() or is_coach()
     or exists (
       select 1 from public.routines r join public.users u on u.id = r.user_id
       where r.id = routine_days.routine_id and u.auth_id = auth.uid()
     ))
    and exists (select 1 from public.routines r where r.id = routine_days.routine_id and r.gym_id = public.my_gym_id())
  );

-- ============ routine_exercises ============
drop policy if exists "Routine exercises viewable" on public.routine_exercises;
create policy "Routine exercises viewable"
  on public.routine_exercises for select to public
  using (
    exists (
      select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
      where d.id = routine_exercises.day_id
        and (
          r.is_shared = true
          or exists (select 1 from public.users u where u.id = r.user_id and u.auth_id = auth.uid())
          or ((is_admin() or is_coach()) and r.gym_id = public.my_gym_id())
        )
    )
  );

drop policy if exists "Routine exercises writable" on public.routine_exercises;
create policy "Routine exercises writable"
  on public.routine_exercises for all to public
  using (
    (is_admin() or is_coach()
     or exists (
       select 1 from public.routine_days d
       join public.routines r on r.id = d.routine_id
       join public.users u on u.id = r.user_id
       where d.id = routine_exercises.day_id and u.auth_id = auth.uid()
     ))
    and exists (
      select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
      where d.id = routine_exercises.day_id and r.gym_id = public.my_gym_id()
    )
  )
  with check (
    (is_admin() or is_coach()
     or exists (
       select 1 from public.routine_days d
       join public.routines r on r.id = d.routine_id
       join public.users u on u.id = r.user_id
       where d.id = routine_exercises.day_id and u.auth_id = auth.uid()
     ))
    and exists (
      select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
      where d.id = routine_exercises.day_id and r.gym_id = public.my_gym_id()
    )
  );

-- ============ nutrition_plans ============
drop policy if exists "nutrition_plans_select" on public.nutrition_plans;
create policy "nutrition_plans_select"
  on public.nutrition_plans for select to public
  using (
    is_shared = true
    or user_id = (select users.id from public.users where users.auth_id = auth.uid())
    or ((is_admin() or is_coach()) and gym_id = public.my_gym_id())
  );

drop policy if exists "nutrition_plans_insert" on public.nutrition_plans;
create policy "nutrition_plans_insert"
  on public.nutrition_plans for insert to public
  with check (
    (user_id = (select users.id from public.users where users.auth_id = auth.uid()) or is_admin() or is_coach())
    and gym_id = public.my_gym_id()
  );

drop policy if exists "nutrition_plans_update" on public.nutrition_plans;
create policy "nutrition_plans_update"
  on public.nutrition_plans for update to public
  using (
    (user_id = (select users.id from public.users where users.auth_id = auth.uid()) or is_admin() or is_coach()
     or created_by = (select users.id from public.users where users.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  )
  with check (
    (user_id = (select users.id from public.users where users.auth_id = auth.uid()) or is_admin() or is_coach()
     or created_by = (select users.id from public.users where users.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  );

drop policy if exists "nutrition_plans_delete" on public.nutrition_plans;
create policy "nutrition_plans_delete"
  on public.nutrition_plans for delete to public
  using (
    (user_id = (select users.id from public.users where users.auth_id = auth.uid()) or is_admin() or is_coach()
     or created_by = (select users.id from public.users where users.auth_id = auth.uid()))
    and gym_id = public.my_gym_id()
  );

-- ============ nutrition_days ============
drop policy if exists "nutrition_days_select" on public.nutrition_days;
create policy "nutrition_days_select"
  on public.nutrition_days for select to public
  using (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = nutrition_days.plan_id
        and (
          p.is_shared = true
          or p.user_id = (select users.id from public.users where users.auth_id = auth.uid())
          or ((is_admin() or is_coach()) and p.gym_id = public.my_gym_id())
        )
    )
  );

drop policy if exists "nutrition_days_all" on public.nutrition_days;
create policy "nutrition_days_all"
  on public.nutrition_days for all to public
  using (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = nutrition_days.plan_id
        and (
          p.user_id = (select users.id from public.users where users.auth_id = auth.uid())
          or is_admin() or is_coach()
          or p.created_by = (select users.id from public.users where users.auth_id = auth.uid())
        )
    )
    and exists (select 1 from public.nutrition_plans p where p.id = nutrition_days.plan_id and p.gym_id = public.my_gym_id())
  )
  with check (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = nutrition_days.plan_id
        and (
          p.user_id = (select users.id from public.users where users.auth_id = auth.uid())
          or is_admin() or is_coach()
          or p.created_by = (select users.id from public.users where users.auth_id = auth.uid())
        )
    )
    and exists (select 1 from public.nutrition_plans p where p.id = nutrition_days.plan_id and p.gym_id = public.my_gym_id())
  );

-- ============ nutrition_meals ============
drop policy if exists "nutrition_meals_select" on public.nutrition_meals;
create policy "nutrition_meals_select"
  on public.nutrition_meals for select to public
  using (
    exists (
      select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id
      where d.id = nutrition_meals.day_id
        and (
          p.is_shared = true
          or p.user_id = (select users.id from public.users where users.auth_id = auth.uid())
          or ((is_admin() or is_coach()) and p.gym_id = public.my_gym_id())
        )
    )
  );

drop policy if exists "nutrition_meals_all" on public.nutrition_meals;
create policy "nutrition_meals_all"
  on public.nutrition_meals for all to public
  using (
    exists (
      select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id
      where d.id = nutrition_meals.day_id
        and (
          p.user_id = (select users.id from public.users where users.auth_id = auth.uid())
          or is_admin() or is_coach()
          or p.created_by = (select users.id from public.users where users.auth_id = auth.uid())
        )
    )
    and exists (
      select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id
      where d.id = nutrition_meals.day_id and p.gym_id = public.my_gym_id()
    )
  )
  with check (
    exists (
      select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id
      where d.id = nutrition_meals.day_id
        and (
          p.user_id = (select users.id from public.users where users.auth_id = auth.uid())
          or is_admin() or is_coach()
          or p.created_by = (select users.id from public.users where users.auth_id = auth.uid())
        )
    )
    and exists (
      select 1 from public.nutrition_days d join public.nutrition_plans p on p.id = d.plan_id
      where d.id = nutrition_meals.day_id and p.gym_id = public.my_gym_id()
    )
  );

-- ============ catálogos por gym (lectura pública, escritura solo su admin) ============
drop policy if exists "Products editable by admin" on public.products;
create policy "Products editable by admin"
  on public.products for all to public
  using (is_admin() and gym_id = public.my_gym_id())
  with check (is_admin() and gym_id = public.my_gym_id());

drop policy if exists "Plans editable by admin" on public.plans;
create policy "Plans editable by admin"
  on public.plans for all to public
  using (is_admin() and gym_id = public.my_gym_id())
  with check (is_admin() and gym_id = public.my_gym_id());

drop policy if exists "Categories editable by admin" on public.categories;
create policy "Categories editable by admin"
  on public.categories for all to public
  using (is_admin() and gym_id = public.my_gym_id())
  with check (is_admin() and gym_id = public.my_gym_id());
