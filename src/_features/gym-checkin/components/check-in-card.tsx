"use client"

import { CalendarCheck, Flame, Loader2 } from "lucide-react"
import { useCheckIns, useCreateCheckIn, computeStreak } from "../hooks/useCheckIns"
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

  const hasCheckedInToday = Boolean(
    todayKey && checkIns.some((r) => r.check_in_date.slice(0, 10) === todayKey),
  )
  const { count: streak } = computeStreak(checkIns, today ?? new Date())

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
      {hasCheckedInToday ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-sans text-sm font-bold uppercase tracking-wider text-primary">
                Entrenaste hoy
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                Registrado a las{" "}
                {today
                  ? today.toLocaleTimeString("es-CR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5">
            <Flame className="h-4 w-4 fill-primary text-primary" />
            <span className="font-sans text-sm font-black tabular-nums text-primary">
              {streak}
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-primary/70">
                racha
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
                ¿Entrenaste hoy?
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                Registrá tu entrada para no romper la racha.
              </p>
            </div>
          </div>

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
        </div>
      )}
    </section>
  )
}