"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const base64url = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64url)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/**
 * Hook de notificaciones push (Web Push + VAPID).
 * Llama a `/api/push/subscribe` (guarda el endpoint en `push_subscriptions`)
 * y respeta `permission` del device (granted/denied).
 */
export function usePushNotifications() {
  const { profile } = useAuthSession()
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setPermission("unsupported")
      return false
    }

    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!key) return false

    try {
      const reg = await navigator.serviceWorker.register("/sw.js")
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== "granted") return false

      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key),
        })
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      })
      return true
    } catch {
      return false
    }
  }, [])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {})
      }
      setPermission(Notification.permission)
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    if (!profile) return
    // Leer el permiso lo hace react al montar; no necesitamos sincronizarlo en efecto.
    // La lógica específica vive en subscribe()/unsubscribe() (acción del usuario).
  }, [profile])

  return { permission, subscribe, unsubscribe }
}
