import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Anti-SSRF: solo proveedores push reales (nunca host arbitrario).
const ALLOWED_PUSH_HOSTS = [
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "web.push.apple.com",
  "wns2-par02p.notify.windows.com",
]

function isValidPushEndpoint(raw: string): boolean {
  try {
    const url = new URL(raw)
    return url.protocol === "https:" && ALLOWED_PUSH_HOSTS.includes(url.hostname)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    endpoint?: string
    keys?: { p256dh?: string; auth?: string }
    userAgent?: string
  } | null

  if (!body?.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 })
  }
  if (!isValidPushEndpoint(body.endpoint)) {
    return NextResponse.json({ error: "Endpoint inválido" }, { status: 400 })
  }

  // gym_id lo resuelve el server desde el profile del usuario (no del cliente,
  // eso violaría RLS multi-tenant si alguien lo envía manipulado).
  const { data: me } = await supabase
    .from("users")
    .select("gym_id")
    .eq("auth_id", user.id)
    .maybeSingle()
  const gymId = me?.gym_id ?? null
  if (!gymId) {
    return NextResponse.json({ error: "Sin gym asignado" }, { status: 403 })
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        gym_id: gymId,
        user_id: user.id,
        endpoint: body.endpoint,
        keys: body.keys,
        user_agent: body.userAgent ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sin sesión" }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { endpoint?: string } | null
  if (!body?.endpoint) {
    return NextResponse.json({ error: "Falta endpoint" }, { status: 400 })
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", body.endpoint)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
