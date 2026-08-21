-- Migración: Crear tabla public.users y trigger para sincronizar usuarios OAuth
-- Fecha: 2024-08-20 (corregida)
-- Descripción: Esta migración crea la tabla de usuarios públicos y configura triggers automáticos
-- Correcciones aplicadas:
--   1. Tipos ENUM idempotentes (no fallan si ya existen)
--   2. UUID como PK (consistente con auth.users.id)
--   3. Nombres de columnas simplificados (sin prefijo user_)
--   4. Funciones SECURITY DEFINER para políticas admin/coach (evita recursión RLS)
--   5. Trigger prevent_sensitive_changes (bloquea cambios de rol/email para no-admins)
--   6. DROP TRIGGER IF EXISTS (idempotente)
--   7. Trigger automático para updated_at
--   8. Corrección de provider_id (no guarda tokens OAuth)
--   9. SECURITY DEFINER en funciones de trigger
--   10. Política de INSERT para el propio usuario

-- =============================================
-- 1. TIPOS ENUM (idempotentes)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'user', 'coach');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status') THEN
    CREATE TYPE membership_status AS ENUM ('active', 'inactive', 'pending', 'expired');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_plan') THEN
    CREATE TYPE membership_plan AS ENUM ('basic', 'premium', 'elite', 'day-pass');
  END IF;
END $$;

-- =============================================
-- 2. TABLA public.users
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT,
  provider TEXT DEFAULT 'google',
  provider_id TEXT,
  role user_role DEFAULT 'user',
  membership_status membership_status DEFAULT 'pending',
  membership_plan membership_plan DEFAULT 'day-pass',
  membership_start TIMESTAMPTZ,
  membership_end TIMESTAMPTZ,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW(),
  address TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_membership_status ON public.users(membership_status);
CREATE INDEX IF NOT EXISTS idx_users_provider ON public.users(provider);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- =============================================
-- 4. FUNCIONES AUXILIARES PARA RLS (SECURITY DEFINER)
--    Evitan recursión infinita en las políticas
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND role = 'coach'
  );
$$;

-- =============================================
-- 5. ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Usuario puede ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

-- Usuario puede insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Usuario puede actualizar su propio perfil
-- (los cambios de rol/email se bloquean con el trigger prevent_sensitive_changes)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Admins pueden insertar usuarios
CREATE POLICY "Admins can insert all users" ON public.users
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins pueden actualizar todos los usuarios
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins pueden eliminar todos los usuarios
CREATE POLICY "Admins can delete all users" ON public.users
  FOR DELETE USING (public.is_admin());

-- Admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (public.is_admin());

-- Coaches pueden ver todos los usuarios
CREATE POLICY "Coaches can view users" ON public.users
  FOR SELECT USING (public.is_coach());

-- =============================================
-- 6. TRIGGER: CREAR USUARIO EN public.users AL REGISTRARSE
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_provider TEXT;
  v_provider_id TEXT;
BEGIN
  -- Verificar si el usuario ya existe para evitar duplicados
  IF EXISTS (SELECT 1 FROM public.users WHERE auth_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Extraer datos del metadata de OAuth
  v_provider := COALESCE(NEW.raw_user_meta_data->>'provider', 'google');
  -- Solo guardar el ID del proveedor (sub), NUNCA el token de acceso
  v_provider_id := NEW.raw_user_meta_data->>'sub';

  -- Intentar extraer nombre completo de diferentes campos
  v_first_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'given_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  v_last_name := COALESCE(
    NEW.raw_user_meta_data->>'family_name',
    ''
  );

  -- Insertar usuario en public.users
  INSERT INTO public.users (
    auth_id,
    email,
    first_name,
    last_name,
    provider,
    provider_id,
    role,
    join_date,
    membership_status,
    membership_plan,
    email_verified,
    phone_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_first_name,
    v_last_name,
    v_provider,
    v_provider_id,
    'user', -- Por defecto nuevos usuarios son 'user'
    NOW(),
    'pending',
    'day-pass',
    NEW.email_confirmed_at IS NOT NULL,
    false
  );

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si hay violación de unicidad (email duplicado), no fallar el login
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log del error para debugging
    RAISE LOG 'Error en handle_new_user: %', SQLERRM;
    -- No fallar el login por error en trigger
    RETURN NEW;
END;
$$;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 7. TRIGGER: ACTUALIZAR last_visit AL HACER LOGIN
-- =============================================
CREATE OR REPLACE FUNCTION public.update_user_last_visit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET last_visit = NOW(),
      updated_at = NOW()
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Trigger para actualizar última visita al hacer login
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at)
  EXECUTE FUNCTION public.update_user_last_visit();

-- =============================================
-- 8. TRIGGER: PREVENIR CAMBIOS SENSIBLES (rol/email)
-- =============================================
CREATE OR REPLACE FUNCTION public.prevent_sensitive_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Los admins pueden cambiar rol/email de cualquier usuario
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role <> OLD.role THEN
    RAISE EXCEPTION 'No puedes cambiar tu rol';
  END IF;
  IF NEW.email <> OLD.email THEN
    RAISE EXCEPTION 'No puedes cambiar tu email';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_sensitive_changes ON public.users;
CREATE TRIGGER prevent_sensitive_changes
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_sensitive_changes();

-- =============================================
-- 9. TRIGGER: ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
