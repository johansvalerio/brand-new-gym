"use client"

import { useEffect, useMemo, useState } from "react"

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000
const MINUTE_MS = 60_000
const URGENT_THRESHOLD = 7 * DAY_MS

export type MembershipClockState =
  | "loading" // tick aún no monta (SSR / primera pasada)
  | "no-end" // sin membership_end
  | "expired" // end ya pasó
  | "urgent" // ≤7 días restantes
  | "ok" // >7 días restantes

export type MembershipClock = {
  state: MembershipClockState
  days: number
  hours: number
  minutes: number
  /** "12d 4h 3m" | "5h 12m" | "…" */
  timeLabel: string
  /** "Vencida hace 2 días" | "" */
  expiredLabel: string
  /** 0..1 del período consumido */
  consumedPct: number
}

function computeMembershipClock(
  start: string | null,
  end: string | null,
  now: number | null,
): MembershipClock {
  if (!end) {
    return {
      state: "no-end",
      days: 0,
      hours: 0,
      minutes: 0,
      timeLabel: "",
      expiredLabel: "",
      consumedPct: 0,
    }
  }

  const endMs = new Date(end).getTime()
  const remainingMs = endMs - (now ?? endMs)

  if (now !== null && remainingMs <= 0) {
    const daysAgo = Math.floor(-remainingMs / DAY_MS)
    return {
      state: "expired",
      days: daysAgo,
      hours: 0,
      minutes: 0,
      timeLabel: "",
      expiredLabel:
        daysAgo === 0
          ? "Vencida hoy"
          : `Vencida hace ${daysAgo} ${daysAgo === 1 ? "día" : "días"}`,
      consumedPct: 1,
    }
  }

  const days = Math.floor(remainingMs / DAY_MS)
  const hours = Math.floor((remainingMs % DAY_MS) / HOUR_MS)
  const minutes = Math.floor((remainingMs % HOUR_MS) / MINUTE_MS)

  const startMs = start ? new Date(start).getTime() : endMs - 30 * DAY_MS
  const total = Math.max(endMs - startMs, 1)
  const consumedPct = Math.min(Math.max(((now ?? startMs) - startMs) / total, 0), 1)

  return {
    state: remainingMs <= URGENT_THRESHOLD ? "urgent" : "ok",
    days,
    hours,
    minutes,
    timeLabel:
      now === null
        ? "…"
        : days > 0
          ? `${days}d ${hours}h ${minutes}m`
          : hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`,
    expiredLabel: "",
    consumedPct,
  }
}

/**
 * Reloj de membresía: tick local cada 30s (hydration-safe — now=null hasta el
 * mount) + cálculo puro del estado de vigencia. Único lugar con la lógica;
 * los render (MembershipCountdown rico / MembershipChip compacto) solo pintan.
 */
export function useMembershipClock(
  start: string | null,
  end: string | null,
): MembershipClock {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    // Primer tick diferido (no setState síncrono en el body del effect)
    const first = setTimeout(() => setNow(Date.now()), 0)
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => {
      clearTimeout(first)
      clearInterval(t)
    }
  }, [])

  return useMemo(() => computeMembershipClock(start, end, now), [start, end, now])
}
