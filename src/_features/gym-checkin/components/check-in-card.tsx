"use client"

import { CalendarCheck, Flame, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useCheckIns,
  useCreateCheckIn,
  computeStreak,
  computeBestStreak,
  buildWeek,
} from "../hooks/useCheckIns"
import { useNow } from "@/_features/shared/hooks/useNow"

function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function CheckInCard({ userId }: { userId: string }) {
  const { data: checkIns = [], isLoading } = useCheckIns(userId)
  const createCheckIn = useCreateCheckIn()
  const now = useNow()

  const today = now ? new Date(now) : null
  const todayKey = today ? toKey(today) : null

  const todayRow = checkIns.find(
    (r) => r.check_in_date.slice(0, 10) === todayKey,
  )
  const hasCheckedInToday = Boolean(todayRow)
  const { count: streak } = computeStreak(checkIns, today ?? new Date())
  const best = computeBestStreak(checkIns)
  const week = buildWeek(checkIns, today ?? new Date())

  if (isLoading) {
    return (
      <section className="rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando tu entrada…
        </div>
      </section>
    )
  }

  return (
    <section
      className={`rounded-lg border px-4 py-5 sm:px-6 ${
        hasCheckedInToday
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            {hasCheckedInToday ? (
              <>
                <p className="font-sans text-sm font-bold uppercase tracking-wider text-primary">
                  Entrenaste hoy
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Registrado a las{" "}
                  {todayRow
                    ? new Date(todayRow.checked_in_at).toLocaleTimeString(
                        "es-CR",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : ""}
                </p>
              </>
            ) : (
              <>
                <p className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
                  ¿Entrenaste hoy?
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Registrá tu entrada para no romper la racha.
                </p>
              </>
            )}
          </div>
        </div>

        {!hasCheckedInToday && (
          <button
            onClick={() => void createCheckIn.mutateAsync(userId)}
            disabled={createCheckIn.isPending}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createCheckIn.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarCheck className="h-4 w-4" />
            )}
            Registrar
          </button>
        )}
      </div>

      {/* Racha siempre visible + semanita */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border/40 pt-3">
        {/* Racha + récord */}
        <div className="flex items-center gap-2.5">
          <Flame
            className={cn(
              "h-6 w-6",
              hasCheckedInToday
                ? "fill-primary text-primary"
                : streak > 0
                  ? "text-primary"
                  : "text-muted-foreground",
            )}
          />
          <div className="leading-tight">
            <p className="font-sans text-sm font-black tabular-nums text-foreground">
              {streak}{" "}
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {streak === 1 ? "día" : "días"}
              </span>
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {!hasCheckedInToday && streak > 0
                ? "Hoy falta — no la rompás"
                : streak === 0
                  ? "Empezá hoy tu racha"
                  : streak >= best
                    ? "¡Récord personal!"
                    : `Récord: ${best}`}
            </p>
          </div>
        </div>

        {/* Últimos 7 días */}
        <div className="flex items-end gap-1.5" aria-label="Últimos 7 días">
          {week.map((d) => (
            <div key={d.key} className="flex w-5 flex-col items-center gap-1">
              <span
                className={cn(
                  "h-3.5 w-3.5 rounded-full",
                  d.trained
                    ? "bg-primary"
                    : d.isToday
                      ? "border border-dashed border-primary/60"
                      : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "font-mono text-[9px] leading-none",
                  d.isToday
                    ? "font-bold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {d.letter}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
