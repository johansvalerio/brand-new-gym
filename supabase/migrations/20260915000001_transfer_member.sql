-- Transferencia de miembros entre gyms (2026-09-15).
-- El admin del gym DESTINO absorbe un miembro de otro gym (o sin gym) por email.
-- Debe ser RPC SECURITY DEFINER: el caller no puede UPDATE filas de otro gym por
-- RLS ("Admins can update all users" exige gym_id = my_gym_id()), así que el
-- UPDATE corre como owner y bypasea RLS. La protección real es el chequeo
-- is_admin() + my_gym_id() dentro de la función.
-- El historial (routines, payments, check_ins, workout_logs) lleva su propio
-- gym_id del gym viejo y queda invisible en el gym nuevo ("datos desde 0");
-- solo se resetean los campos de membresía de la fila users.

create or replace function public.transfer_member_to_my_gym(p_email text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_gym uuid;
  v_target record;
begin
  -- 1. El caller debe ser admin de un gym (el rol no alcanza: se valida gym).
  select gym_id into v_gym from public.users where auth_id = auth.uid();
  if v_gym is null then
    raise exception 'No se encontró tu gym';
  end if;
  if not public.is_admin() then
    raise exception 'Solo un admin puede transferir miembros';
  end if;

  -- 2. Buscar target por email (case-insensitive).
  if p_email is null or trim(p_email) = '' then
    raise exception 'Ingresa un email válido';
  end if;

  select id, gym_id into v_target
  from public.users
  where lower(email) = lower(trim(p_email));

  if not found then
    raise exception 'No existe un miembro con ese email';
  end if;

  -- 3. Ya pertenece a este gym (gym_id NULL = sin gym: sí se puede absorber).
  if v_target.gym_id is not distinct from v_gym then
    raise exception 'Ese miembro ya pertenece a este gym';
  end if;

  -- 4. Mover al gym del caller + resetear membresía (datos desde 0).
  update public.users
  set gym_id = v_gym,
      role = 'user',
      coach_id = null,
      plan_id = null,
      membership_status = 'pending',
      membership_start = null,
      membership_end = null,
      updated_at = now()
  where id = v_target.id;

  return v_target.id;
end;
$function$;

-- Patrón de los RPC copy_shared_*/save_workout: solo authenticated, nada a anon.
revoke all on function public.transfer_member_to_my_gym(text) from public, anon;
grant execute on function public.transfer_member_to_my_gym(text) to authenticated;
