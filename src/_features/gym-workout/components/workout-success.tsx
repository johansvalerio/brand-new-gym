"use client"

import { useMemo } from "react"
import { Check, Dumbbell, Trophy, TrendingUp, CalendarDays, ArrowRight } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useWorkoutHistory } from "../hooks/useWorkoutHistory"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

export function WorkoutSuccess() {
  const { profile } = useAuthSession()
  const { data: workouts = [], isLoading } = useWorkoutHistory(profile?.id ?? null)
  const { navigate } = usePageTransition()

  const last = workouts[0] ?? null

  const stats = useMemo(() => {
    if (!last) return null
    const volume = last.set_logs.reduce((s, set) => s + set.weight * set.reps, 0)
    const sets = last.set_logs.length
    const exercises = new Set(last.set_logs.map((s) => s.exercise_id)).size
    return { volume, sets, exercises }
  }, [last])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground">Cargando resumen…</p>
      </div>
    )
  }

  if (!last || !stats) {
    return (
      <div className="rounded-lg border border-border bg-card px-6 py-10 text-center">
        <p className="font-sans text-lg font-black uppercase text-foreground">Sin entrenamientos aún</p>
        <button onClick={() => navigate("/workout")} className="mt-4 cursor-pointer rounded-md bg-primary px-4 py-2.5 text-sm font-bold uppercase text-primary-foreground">
          Entrenar
        </button>
      </div>
    )
  }

  const date = new Date(last.started_at)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      {/* glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="relative p-6 sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_24px_rgba(150,217,6,0.5)]">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>

        <h1 className="mt-4 text-center font-sans text-3xl font-black uppercase tracking-tighter text-foreground">
          ¡Entrenamiento <span className="text-primary">guardado!</span>
        </h1>
        <p className="mt-2 text-center font-mono text-sm text-muted-foreground">
          {date.toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" })} · {date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        {last.routines?.name ? (
          <p className="mt-1 text-center font-sans text-sm font-bold text-foreground">{last.routines.name} {last.routine_days?.focus ? `· ${last.routine_days.focus}` : ""}</p>
        ) : (
          <p className="mt-1 text-center font-sans text-sm font-bold text-foreground">Sesión libre</p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-4 text-center">
            <TrendingUp className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-1 font-sans text-xl font-black tabular-nums text-primary">{Math.round(stats.volume)}<span className="ml-1 text-xs font-bold uppercase">kg</span></p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-primary/70">Volumen</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 px-3 py-4 text-center">
            <Dumbbell className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1 font-sans text-xl font-black tabular-nums text-foreground">{stats.sets}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Series</p>
          </div>
          <div className="rounded-lg border border-border bg-background/60 px-3 py-4 text-center">
            <Trophy className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-1 font-sans text-xl font-black tabular-nums text-foreground">{stats.exercises}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ejercicios</p>
          </div>
        </div>

        {last.notes ? (
          <div className="mt-6 rounded-md border border-border bg-secondary/20 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Notas</p>
            <p className="mt-1 text-sm text-foreground">{last.notes}</p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/workout/history")}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-sans text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <CalendarDays className="h-4 w-4" /> Ver histórico <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-3 font-sans text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
          >
            Dashboard
          </button>
        </div>

        <button
          onClick={() => navigate("/workout")}
          className="mt-3 w-full cursor-pointer font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
        >
          + Nuevo entrenamiento
        </button>
      </div>
    </div>
  )
}
