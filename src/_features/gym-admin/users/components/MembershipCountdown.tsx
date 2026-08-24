"use client"

import { Clock3 } from "lucide-react"
import { useMembershipClock } from "../hooks/useMembershipClock"

/**
 * Contador rico para la DataCard "Membresía" del perfil: icono, timer grande,
 * barra de progreso del período consumido con glow y semáforo
 * (verde >7d / amarillo ≤7d / rojo vencida / neutral sin fecha).
 */
export function MembershipCountdown({
  start,
  end,
}: {
  start: string | null
  end: string | null
}) {
  const clock = useMembershipClock(start, end)

  if (clock.state === "no-end") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-dashed border-border/60 bg-secondary/30 px-3 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <Clock3 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Vigencia
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            Sin fecha de vencimiento
          </p>
        </div>
      </div>
    )
  }

  if (clock.state === "expired") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <Clock3 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-destructive">
            Vigencia
          </p>
          <p className="font-sans text-sm font-bold uppercase text-destructive">
            {clock.expiredLabel}
          </p>
        </div>
      </div>
    )
  }

  // ok / urgent / loading comparten el render verde-amarillo.
  const urgent = clock.state === "urgent"
  const accentText = urgent ? "text-yellow-500" : "text-primary"
  const barGlow = urgent
    ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.45)]"
    : "bg-primary shadow-[0_0_10px_rgba(150,217,6,0.45)]"

  return (
    <div
      className={`rounded-md border px-3 py-3 transition-colors duration-500 ${
        urgent ? "border-yellow-500/40 bg-yellow-500/5" : "border-primary/30 bg-primary/5"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Clock3 className={`h-4 w-4 shrink-0 ${accentText}`} />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Tiempo restante
          </p>
        </div>
        <p className={`font-mono text-lg font-black leading-none tabular-nums ${accentText}`}>
          {clock.timeLabel}
        </p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barGlow}`}
          style={{ width: `${clock.consumedPct * 100}%` }}
        />
      </div>

      {end ? (
        <p className="mt-1.5 text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Vence el{" "}
          {new Date(end).toLocaleDateString("es-CR", {
            day: "numeric",
            month: "long",
          })}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Chip compacto para listas (cards/tabla): tiempo restante coloreado.
 * No renderiza nada si no hay fecha de vencimiento.
 */
export function MembershipChip({
  start,
  end,
}: {
  start: string | null
  end: string | null
}) {
  const clock = useMembershipClock(start, end)

  if (clock.state === "loading" || clock.state === "no-end") return null

  if (clock.state === "expired") {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] tabular-nums text-destructive">
        <Clock3 className="h-3 w-3" />
        Vencida
      </span>
    )
  }

  const color = clock.state === "urgent" ? "text-yellow-500" : "text-primary"

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] tabular-nums ${color}`}
      title="Tiempo restante de membresía"
    >
      <Clock3 className="h-3 w-3" />
      {clock.timeLabel}
    </span>
  )
}
