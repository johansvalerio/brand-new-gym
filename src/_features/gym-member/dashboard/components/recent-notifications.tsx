"use client"

import { ArrowRight, Bell, Loader2, ShieldAlert } from "lucide-react"
import {
  useMarkNotificationRead,
  useNotifications,
  type NotificationRow,
} from "@/_features/shared/hooks/useNotifications"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "ahora"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export function RecentNotifications() {
  const { navigate } = usePageTransition()
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useNotifications(true)
  const markRead = useMarkNotificationRead()

  const recent = notifications.slice(0, 5)

  const handleClick = (notification: NotificationRow) => {
    if (!notification.read) markRead.mutate(notification.id)
    if (notification.link) navigate(notification.link)
  }

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Bell className="h-4 w-4 text-primary" />
          Actividad reciente
        </h3>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando...
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" />
          {error instanceof Error ? error.message : "Error inesperado"}
        </p>
      ) : recent.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 font-sans text-sm font-bold text-foreground">
            Sin actividad por ahora
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tus pagos, rutinas y membresía te avisarán aquí.
          </p>
        </div>
      ) : (
        <ul>
          {recent.map((notification) => (
            <li
              key={notification.id}
              className="border-b border-border/40 last:border-0"
            >
              <button
                onClick={() => handleClick(notification)}
                aria-label={notification.title}
                className={`flex w-full cursor-pointer items-start gap-2.5 px-4 py-3 text-left transition-colors ${
                  notification.read
                    ? "opacity-60 hover:bg-secondary/30"
                    : "bg-primary/5 hover:bg-primary/15"
                }`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    notification.read
                      ? "bg-transparent"
                      : "bg-primary shadow-[0_0_6px_rgba(150,217,6,0.8)]"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-sans text-sm font-semibold text-foreground">
                      {notification.title}
                    </span>
                    <span className="shrink-0 font-mono text-[9px] uppercase text-muted-foreground">
                      {timeAgo(notification.created_at)}
                    </span>
                  </span>
                  {notification.body ? (
                    <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
                      {notification.body}
                    </span>
                  ) : null}
                </span>
                {notification.link ? (
                  <ArrowRight className="mt-1 h-3 w-3 shrink-0 text-muted-foreground/50" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
