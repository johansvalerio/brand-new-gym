import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3";

// Registro de gimnasio (onboarding SaaS): solo staff/dueño.
// Crea el auth user (Supabase hashea la contraseña) — el trigger
// `handle_new_user` inserta el profile en public.users.
// gymSlug indica a qué landing/se vindica el usuario (página muestra
// "Logueáte con tu cuenta" en /auth/login?gym=<slug> con este email registrado).

// Rate limit (memoria efímera del Edge): 5 req / 10 min por IP.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const existing = buckets.get(ip);
  if (!existing || now > existing.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (existing.count >= RATE_LIMIT_MAX) return { ok: false, remaining: 0 };
  existing.count++;
  return { ok: true, remaining: RATE_LIMIT_MAX - existing.count };
}

const registerSchema = z.object({
  firstName: z.string().trim().min(2, "El nombre es obligatorio").max(60),
  lastName: z.string().trim().min(2, "El apellido es obligatorio").max(60),
  email: z.string().email("Email inválido").max(120).toLowerCase(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  phone: z.string().max(30).optional(),
  gymSlug: z.string().regex(/^[a-z0-9-]+$/, "Slug inválido"),
});

export default async function handler(req: Request) {
  // CORS lo maneja Supabase (Access-Control-Allow-Origin: * por default);
  // verify_jwt:false para el signup (no hay sesión aún).
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "Demasiados intentos. Intenta en unos minutos." }), { status: 429, headers: { "Content-Type": "application/json" } });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const { firstName, lastName, email, password, phone, gymSlug } = parsed.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // Verificar slug (no creamos gyms aquí; el landing/SaaS ya lo debe tener preregistered)
  const { data: gym, error: gymErr } = await supabase
    .from("gyms")
    .select("id")
    .eq("slug", gymSlug)
    .eq("is_active", true)
    .maybeSingle();
  if (gymErr || !gym) {
    return new Response(JSON.stringify({ error: "Gym no encontrado o inactivo" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }

  // Crea el auth user (el service_role bypasea email confirmation
  // y deja contraseña marcada como verificada; la contraseña la hashea
  // Supabase Auth server-side, nunca toca JavaScript plano).
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { first_name: firstName, last_name: lastName, gym_slug: gymSlug },
    email_confirm: true,
  });
  if (authErr) {
    const msg = authErr.message.includes("User already registered") ? "Ya existe una cuenta con este email" : authErr.message;
    return new Response(JSON.stringify({ error: msg }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  // Actualiza el profile para pinearlo al gym (trigger already creó la fila).
  const authId = authUser.user.id;
  const { data: profile } = await supabase
    .from("users")
    .update({ gym_id: gym.id, phone: phone ?? null })
    .eq("auth_id", authId)
    .select("id")
    .single();

  return new Response(
    JSON.stringify({ ok: true, authId, userId: profile?.id }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
}
