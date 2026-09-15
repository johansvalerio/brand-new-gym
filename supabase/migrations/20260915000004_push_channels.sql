-- Push notifications + canales (2026-09-15).
-- Espejo del patrón de Mecanico/beauty-space, con los nombres del Jaula:
--   - `push_subscriptions` por gym (más cerca del RLS existente que un tenant_id global).
--   - No tocamos notifications.user_id/user_id CASCADE (la RLS existente lo hace).
--   - La función get_push_subscriptions_for_notification es definer SOLO para
--     que el webhook del router (sin cookie de browser) pueda leer endpoints.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  keys jsonb NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Owner: solo su gym y su propio device.
CREATE POLICY push_subscriptions_select_own
  ON public.push_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()) AND gym_id = public.my_gym_id());

CREATE POLICY push_subscriptions_insert_own
  ON public.push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()) AND gym_id = public.my_gym_id());

CREATE POLICY push_subscriptions_update_own
  ON public.push_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY push_subscriptions_delete_own
  ON public.push_subscriptions FOR DELETE
  TO authenticated
  USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- Canales por notificación (in_app siempre + push/email condicionales).
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS channels jsonb NOT NULL DEFAULT '[
    "in_app"
  ]'::jsonb,
  ADD COLUMN IF NOT EXISTS sent_push_at timestamptz,
  ADD COLUMN IF NOT EXISTS sent_email_at timestamptz;

-- RPC que usa el webhook (service_role / sin JWT de usuario): devuelve
-- las suscripciones del destinatario de la notificación. El gateway la cuadra.
CREATE OR REPLACE FUNCTION public.get_push_subscriptions_for_notification(
  p_notification_id bigint
)
RETURNS TABLE (
  user_id uuid,
  endpoint text,
  keys jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT DISTINCT ps.user_id, ps.endpoint, ps.keys
  FROM public.push_subscriptions ps
  JOIN public.notifications n ON n.id = p_notification_id
   AND ps.gym_id = n.gym_id
   AND ps.user_id = n.user_id;
$$;

REVOKE ALL ON FUNCTION public.get_push_subscriptions_for_notification(bigint) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_push_subscriptions_for_notification(bigint) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_push_subscriptions_for_notification(bigint) TO service_role;
