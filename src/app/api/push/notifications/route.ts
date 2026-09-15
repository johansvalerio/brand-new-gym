import { createHmac, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import webpush from "web-push"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

// Webhook de Supabase (tabla `notifications`, INSERT) → push al device.
// Firmado con x-webhook-secret; MECANICO usa el mismo patrón.
// El service_role accede a /rest (sin cookie de sesión) con API key.

const ALLOWED_PUSH_HOSTS = [
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "web.push.apple.com",
  "wns2-par02p.notify.windows.com",
]

function isValidPushEndpoint(raw: string): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  return url.protocol === "https:" && ALLOWED_PUSH_HOSTS.includes(url.hostname)
}

function verifySecret(request: Request): boolean {
  const secret = process.env.NOTIFICATIONS_WEBHOOK_SECRET
  if (!secret) return false
  const got = request.headers.get("x-webhook-secret") ?? ""
  return !!got && timingSafeEqual(Buffer.from(got), Buffer.from(secret))
}

const WebhookPayloadSchema = z.object({
  type: z.literal("INSERT"),
  table: z.literal("notifications"),
  record: z.object({
    id: z.number(),
    gym_id: z.string().uuid(),
    user_id: z.number(),
    type: z.string().min(1),
    title: z.string().min(1).max(200),
    body: z.string().max(1000).nullable().optional(),
    link: z.string().nullable().optional(),
    channels: z.array(z.string()).nullable().optional(),
  }),
})

export async function POST(request: Request) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 })
  }

  const parsed = WebhookPayloadSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 })
  }

  const notification = parsed.data.record
  const channels = new Set(notification.channels ?? ["in_app"])
  if (!channels.has("push")) {
    return NextResponse.json({ ok: true, skipped: "solo in_app" })
  }

  // Lee destinatarios del webhook via service_role (bypass RLS CONSCIENTEMENTE
  // porque el Webhook viene firmado y no tiene cookie de usuario).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    )
  }

  const svcHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/rpc/get_push_subscriptions_for_notification`,
    {
      method: "POST",
      headers: svcHeaders,
      body: JSON.stringify({ p_notification_id: notification.id }),
    },
  )
  const subs: Array<{ user_id: string; endpoint: string; keys: { p256dh: string; auth: string } }> =
    res.ok ? ((await res.json().catch(() => [])) as Array<{ user_id: string; endpoint: string; keys: { p256dh: string; auth: string } }>) : []

  if (subs.length === 0) {
    return NextResponse.json({ ok: true, push: 0, skipped: "sin suscripciones" })
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? `https://jaula.vercel.app`
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: "Faltan claves VAPID" }, { status: 500 })
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)

  const payload = JSON.stringify({
    title: notification.title,
    body: notification.body ?? "",
    url: notification.link ?? "/",
    tag: `jaula-${notification.id}`,
  })

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } },
        payload,
      ),
    ),
  )

  const sent = results.filter((r) => r.status === "fulfilled").length
  if (sent > 0) {
    // Marcar como despachada (idempotencia) via service_role.
    await fetch(`${supabaseUrl}/rest/v1/notifications?id=eq.${notification.id}`, {
      method: "PATCH",
      headers: { ...svcHeaders, Prefer: "return=minimal" },
      body: JSON.stringify({ sent_push_at: new Date().toISOString() }),
    })
  }

  return NextResponse.json({ ok: true, push: sent, total: subs.length })
}
