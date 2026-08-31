"use client"

import { Dumbbell, TrendingUp, CalendarDays, Flame } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useWorkoutHistory, computeWorkoutStats } from "@/_features/gym-workout/hooks/useWorkoutHistory"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

function formatKg(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}t`
  return `${Math.round(n)}kg`
}

export function MyWorkoutStats() {
  const { profile } = useAuthSession()
  const { data: workouts = [], isLoading } = useWorkoutHistory(profile?.id ?? null)
  const { navigate } = usePageTransition()

  if (isLoading) {
    return (
      <section className="rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
        <div className="h-20 animate-pulse rounded-md bg-muted/50" />
      </section>
    )
  }

  if (workouts.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Dumbbell className="h-5 w-5" />
          </span>
          <div>
            <p className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">Aún sin entrenamientos</p>
            <p className="font-mono text-xs text-muted-foreground">Tu primer registro aparecerá aquí con volumen y racha.</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/workout")}
          className="mt-4 flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          <Dumbbell className="h-4 w-4" /> Entrenar hoy
        </button>
      </section>
    )
  }

  const stats = computeWorkoutStats(workouts)
  const lastDate = stats.lastWorkout
    ? new Date(stats.lastWorkout.started_at).toLocaleDateString("es-CR", {
        day: "numeric",
        month: "short",
      })
    : "—"
  const lastRoutine = stats.lastWorkout?.routines?.name ?? (stats.lastWorkout?.routine_id ? `Rutina #${stats.lastWorkout.routine_id}` : "Libre")

  const maxVol = Math.max(...stats.volumeByDay.map((d) => d.volume), 1)

  return (
    <section className="rounded-lg border border-border bg-card px-4 py-5 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <TrendingUp className="h-4 w-4" />
          </span>
          Tu progreso
        </h3>
        <button
          onClick={() => navigate("/workout/history")}
          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Ver histórico →
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-border/60 bg-background/40 px-3 py-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Esta semana</p>
          <p className="mt-1 font-sans text-xl font-black tabular-nums text-foreground">{stats.workoutsThisWeek}</p>
          <p className="font-mono text-[10px] text-muted-foreground">sesiones</p>
        </div>
        <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary/70">Volumen</p>
          <p className="mt-1 font-sans text-xl font-black tabular-nums text-primary">{formatKg(stats.volumeThisWeek)}</p>
          <p className="font-mono text-[10px] text-muted-foreground">esta semana</p>
        </div>
        <div className="rounded-md border border-border/60 bg-background/40 px-3 py-3 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Último</p>
          <p className="mt-1 truncate font-sans text-xs font-bold text-foreground">{lastDate}</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{lastRoutine}</p>
        </div>
      </div>

      {/* mini barras 7 días */}
      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" /> Volumen últimos 7 días
        </p>
        <div className="flex items-end gap-1.5">
          {stats.volumeByDay.map((d) => {
            const h = maxVol ? Math.max(4, Math.round((d.volume / maxVol) * 36)) : 4
            const isToday = d.date === new Date().toISOString().slice(0, 10)
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-sm transition-colors ${d.volume > 0 ? (isToday ? "bg-primary" : "bg-primary/60") : "bg-muted"}`}
                  style={{ height: h }}
                  title={`${d.date}: ${formatKg(d.volume)}`}
                />
                <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                  {new Date(d.date).toLocaleDateString("es-CR", { weekday: "narrow" })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate("/workout")}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          <Flame className="h-4 w-4" />
          Entrenar
        </button>
        <button
          onClick={() => navigate("/workout/history")}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
        >
          <CalendarDays className="h-4 w-4" />
          Histórico
        </button>
      </div>
    </section>
  )
}
