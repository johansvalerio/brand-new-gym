"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Dumbbell, ChevronDown, ChevronUp, Weight, Hash, StickyNote, Flame, Trophy, TrendingUp, Clock, Filter, Trash2, Pencil } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useWorkoutHistory, computeWorkoutStats, useDeleteWorkout, useUpdateWorkoutNote } from "../hooks/useWorkoutHistory"
import { ExerciseVisual } from "@/_features/gym-routines/components/exercise-picker"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import { WorkoutNoteDialog } from "./workout-note-dialog"
import { WorkoutDeleteDialog } from "./workout-delete-dialog"

function formatKg(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}t`
  return `${Math.round(n)}kg`
}

export function WorkoutHistory() {
  const { profile } = useAuthSession()
  const { data: workouts = [], isLoading } = useWorkoutHistory(profile?.id ?? null)
  const { navigate } = usePageTransition()
  const deleteWorkout = useDeleteWorkout()
  const updateNote = useUpdateWorkoutNote()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [filter, setFilter] = useState<"all" | "routine" | "free">("all")
  const [noteWorkout, setNoteWorkout] = useState<null | (typeof workouts)[number]>(null)
  const [deletingWorkout, setDeletingWorkout] = useState<null | (typeof workouts)[number]>(null)

  const filtered = useMemo(() => {
    if (filter === "all") return workouts
    if (filter === "routine") return workouts.filter((w) => w.routine_id !== null)
    return workouts.filter((w) => w.routine_id === null)
  }, [workouts, filter])

  const stats = useMemo(() => (workouts.length ? computeWorkoutStats(workouts) : null), [workouts])
  const totalVolume = useMemo(() => workouts.reduce((s, w) => s + w.set_logs.reduce((a, set) => a + set.weight * set.reps, 0), 0), [workouts])
  const avgVolume = workouts.length ? Math.round(totalVolume / workouts.length) : 0

  // agrupado por mes como Strava/Hevy
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const w of filtered) {
      const d = new Date(w.started_at)
      const key = d.toLocaleDateString("es-CR", { month: "long", year: "numeric" })
      const arr = map.get(key) ?? []
      arr.push(w)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [filtered])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card/50" />
        ))}
      </div>
    )
  }

  if (workouts.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="bg-gradient-to-br from-primary/10 via-transparent to-transparent px-6 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Dumbbell className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-sans text-lg font-black uppercase tracking-tight text-foreground">Aún no hay entrenamientos</h3>
          <p className="mx-auto mt-2 max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
            Cada sesión que registres aparecerá aquí como en <span className="text-primary">Strong / Hevy</span> — con volumen, series y fotos de ejercicios.
          </p>
          <button
            onClick={() => navigate("/workout")}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 font-sans text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_0_20px_rgba(150,217,6,0.3)] transition-all hover:-translate-y-0.5"
          >
            <Flame className="h-4 w-4" /> Entrenar hoy
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header stats — inspirado en Strava/Apple Fitness */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-center backdrop-blur">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">Sesiones</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 font-sans text-2xl font-black text-primary">
            <Hash className="h-4 w-4" /> {workouts.length}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">{stats?.workoutsThisWeek ?? 0} esta semana</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Volumen total</p>
          <p className="mt-1 flex items-center justify-center gap-1 font-sans text-2xl font-black text-foreground">
            <Weight className="h-4 w-4 text-primary" /> {formatKg(totalVolume)}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">avg {formatKg(avgVolume)}/sesión</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Racha</p>
          <p className="mt-1 flex items-center justify-center gap-1 font-sans text-2xl font-black text-foreground">
            <Trophy className="h-4 w-4 text-primary" /> {stats?.volumeByDay.filter((d) => d.volume > 0).length ?? 0}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">días con volumen</p>
        </div>
      </div>

      {/* Mini barras 7 días + filtros — como Hevy */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" /> Últimos 7 días
          </p>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 p-1">
            <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Filter className="h-3.5 w-3.5" />
            </span>
            {[
              { id: "all", label: "Todo" },
              { id: "routine", label: "Rutina" },
              { id: "free", label: "Libre" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-all ${filter === tab.id ? "border-primary bg-primary text-black shadow-[0_0_10px_rgba(150,217,6,0.4)]" : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {stats ? (
          <div className="mt-4 flex items-end gap-1.5">
            {stats.volumeByDay.map((d) => {
              const max = Math.max(...stats.volumeByDay.map((x) => x.volume), 1)
              // Días sin volumen = marquita gris en la base, no pastilla verde
              const isZero = d.volume <= 0
              const h = isZero ? 2 : Math.max(8, Math.round((d.volume / max) * 40))
              const isToday = d.date === new Date().toISOString().slice(0, 10)
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-sm transition-all ${isZero ? "bg-border/60" : (isToday ? "bg-primary shadow-[0_0_8px_rgba(150,217,6,0.6)]" : "bg-primary/70")}`}
                    style={{ height: h }}
                    title={`${d.date}: ${formatKg(d.volume)}`}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    {new Date(d.date).toLocaleDateString("es-CR", { weekday: "narrow" })}
                  </span>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>

      {/* Timeline agrupado por mes */}
      {grouped.map(([month, items]) => (
        <div key={month} className="relative">
          <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center gap-2 bg-background/80 px-1 py-2 backdrop-blur">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary" /> {month}
            </span>
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[11px] text-muted-foreground">{items.length} sesiones</span>
          </div>

          <div className="relative pl-6">
            {/* línea vertical timeline */}
            <div className="absolute bottom-2 left-[11px] top-2 w-px bg-border" />
            <div className="flex flex-col gap-4">
              {items.map((w) => {
                const date = new Date(w.started_at)
                const volume = w.set_logs.reduce((s, set) => s + set.weight * set.reps, 0)
                const setsCount = w.set_logs.length
                const exercisesCount = new Set(w.set_logs.map((s) => s.exercise_id)).size
                const isOpen = expanded === w.id
                const routineLabel = w.routines?.name ?? (w.routine_id ? `Rutina #${w.routine_id}` : "Libre")
                const byExercise = new Map<number, typeof w.set_logs>()
                for (const s of w.set_logs) {
                  const arr = byExercise.get(s.exercise_id) ?? []
                  arr.push(s)
                  byExercise.set(s.exercise_id, arr)
                }
                const preview = Array.from(byExercise.values()).slice(0, 3)

                return (
                  <div key={w.id} className="relative">
                    {/* dot */}
                    <span className={`absolute -left-6 top-6 flex h-3 w-3 items-center justify-center rounded-full border-2 bg-background ${isOpen ? "border-primary bg-primary shadow-[0_0_10px_rgba(150,217,6,0.6)]" : "border-border"}`}>
                      {isOpen ? <span className="h-1.5 w-1.5 rounded-full bg-black" /> : null}
                    </span>

                    <div className={`overflow-hidden rounded-xl border bg-card transition-all ${isOpen ? "border-primary/40 shadow-[0_8px_24px_rgba(0,0,0,0.3)]" : "border-border hover:border-primary/30"}`}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setExpanded(isOpen ? null : w.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setExpanded(isOpen ? null : w.id)
                          }
                        }}
                        className="flex w-full cursor-pointer flex-col gap-3 px-4 py-4 text-left sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-black">
                              <Clock className="h-3 w-3" /> {date.toLocaleDateString("es-CR", { day: "2-digit", month: "short" })} · {date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="truncate font-sans text-sm font-black uppercase tracking-tight text-foreground">{routineLabel}</span>
                            {w.routine_days?.focus ? <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{w.routine_days.focus}</span> : null}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {preview.map((sets, idx) => {
                              const ex = sets[0].exercises
                              return (
                                <span key={idx} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 px-2 py-1">
                                  <ExerciseVisual exercise={ex as never} className="h-5 w-5" />
                                  <span className="font-mono text-[10px] font-bold text-foreground">{ex?.name ?? `#${sets[0].exercise_id}`}</span>
                                  <span className="font-mono text-[10px] text-muted-foreground">×{sets.length}</span>
                                </span>
                              )
                            })}
                            {byExercise.size > 3 ? <span className="font-mono text-[11px] text-muted-foreground">+{byExercise.size - 3} más</span> : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <div className="hidden grid-cols-3 gap-2 text-center sm:grid">
                            <div className="rounded-lg border border-border bg-background px-3 py-2">
                              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Volumen</p>
                              <p className="font-sans text-sm font-black text-primary">{formatKg(volume)}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-3 py-2">
                              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Series</p>
                              <p className="font-sans text-sm font-black text-foreground">{setsCount}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-3 py-2">
                              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Ejercicios</p>
                              <p className="font-sans text-sm font-black text-foreground">{exercisesCount}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setNoteWorkout(w)}
                              aria-label="Editar nota"
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingWorkout(w)}
                              aria-label="Borrar entrenamiento"
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </span>
                        </div>
                      </div>

                      {/* stats mobile */}
                      <div className="grid grid-cols-3 gap-2 border-y border-border bg-secondary/20 px-4 py-2 sm:hidden">
                        <span className="text-center font-mono text-[11px]"><span className="text-muted-foreground">Vol</span> <span className="font-bold text-primary">{formatKg(volume)}</span></span>
                        <span className="text-center font-mono text-[11px]"><span className="text-muted-foreground">Sets</span> <span className="font-bold">{setsCount}</span></span>
                        <span className="text-center font-mono text-[11px]"><span className="text-muted-foreground">Ex</span> <span className="font-bold">{exercisesCount}</span></span>
                      </div>

                      {isOpen ? (
                        <div className="border-t border-border bg-secondary/10 p-4">
                          {w.notes ? (
                            <div className="mb-4 flex gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                              <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <p className="flex-1 text-sm text-foreground">{w.notes}</p>
                              <button
                                onClick={() => setNoteWorkout(w)}
                                className="shrink-0 font-mono text-xs text-primary hover:underline"
                              >
                                Editar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setNoteWorkout(w)}
                              className="mb-4 flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-3 py-2 font-mono text-xs text-muted-foreground hover:border-primary hover:text-primary"
                            >
                              <Pencil className="h-3 w-3" /> Agregar nota
                            </button>
                          )}
                          <div className="flex flex-col gap-3">
                            {Array.from(byExercise.entries()).map(([exId, sets]) => {
                              const ex = sets[0].exercises
                              return (
                                <div key={exId} className="rounded-xl border border-border bg-card p-3">
                                  <div className="mb-3 flex items-center gap-3">
                                    <ExerciseVisual exercise={ex as never} className="h-10 w-10" />
                                    <div className="min-w-0">
                                      <p className="truncate font-sans text-sm font-bold text-foreground">{ex?.name ?? `Ejercicio #${exId}`}</p>
                                      {ex ? (
                                        <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                                          {ex.muscle_group}
                                          {ex.equipment ? ` · ${ex.equipment}` : ""}
                                        </p>
                                      ) : null}
                                    </div>
                                    <span className="ml-auto rounded-full border border-border bg-secondary px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                      {sets.length} series
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                    {sets.map((s) => (
                                      <div key={s.id} className="rounded-lg border border-border bg-background px-2 py-2 text-center">
                                        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Set {s.set_number}</p>
                                        <p className="mt-1 font-sans text-sm font-black tabular-nums">
                                          <span className="text-primary">{s.weight}kg</span>
                                          <span className="text-muted-foreground"> × </span>
                                          <span className="text-foreground">{s.reps}</span>
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center">
        <button
          onClick={() => navigate("/workout")}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-black"
        >
          <Dumbbell className="h-4 w-4" /> Nuevo entrenamiento
        </button>
      </div>

      <WorkoutNoteDialog
        open={!!noteWorkout}
        workout={noteWorkout}
        onClose={() => setNoteWorkout(null)}
        onSubmit={async (notes) => {
          if (!noteWorkout) return
          await updateNote.mutateAsync({ id: noteWorkout.id, notes })
          setNoteWorkout(null)
        }}
      />
      <WorkoutDeleteDialog
        workout={deletingWorkout}
        onCancel={() => setDeletingWorkout(null)}
        onConfirm={async () => {
          if (!deletingWorkout) return
          await deleteWorkout.mutateAsync(deletingWorkout.id)
          setDeletingWorkout(null)
        }}
      />
    </div>
  )
}
