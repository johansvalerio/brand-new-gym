"use client"

import { ArrowRight, Dumbbell, Loader2, ShieldAlert } from "lucide-react"
import { useUserRoutines } from "@/_features/gym-routines/hooks/useUserRoutines"
import { goalLabel } from "@/_features/gym-routines/hooks/routine-helpers"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

export function MyRoutineCard({ userId }: { userId: string }) {
  const { navigate } = usePageTransition()
  const {
    data: routines = [],
    isLoading,
    error,
  } = useUserRoutines(userId)

  // useUserRoutines ordena activas primero
  const activeRoutine = routines.find((r) => r.is_active) ?? routines[0]
  const totalExercises = activeRoutine
    ? activeRoutine.routine_days.reduce(
        (sum, day) => sum + day.routine_exercises.length,
        0,
      )
    : 0

  return (
    <section className="relative flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Dumbbell className="h-4 w-4 text-primary" />
          Mi rutina
        </h3>
        <button
          onClick={() => navigate(`/users/profile/${userId}/routine`)}
          aria-label="Ver todas mis rutinas"
          className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Ver todas
          <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      <div className="flex flex-1 flex-col justify-center px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando...
          </div>
        ) : error ? (
          <p className="flex items-center gap-2 py-4 text-sm text-destructive">
            <ShieldAlert className="h-4 w-4" />
            {error instanceof Error ? error.message : "Error inesperado"}
          </p>
        ) : !activeRoutine ? (
          <div className="py-2 text-center">
            <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 font-sans text-sm font-bold text-foreground">
              Aún no tienes una rutina
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pídele una a tu coach o inspírate con el ranking.
            </p>
            <button
              onClick={() => navigate("/routines")}
              className="mt-4 cursor-pointer rounded-md border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Ver ranking
            </button>
          </div>
        ) : (
          <>
            <p className="truncate font-sans text-lg font-black uppercase tracking-tight text-foreground">
              {activeRoutine.name}
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {goalLabel(activeRoutine.goal)} · {activeRoutine.routine_days.length}{" "}
              día{activeRoutine.routine_days.length === 1 ? "" : "s"} ·{" "}
              {totalExercises} ejercicio{totalExercises === 1 ? "" : "s"}
            </p>

            <ul className="mt-4 space-y-2">
              {activeRoutine.routine_days.slice(0, 3).map((day) => (
                <li
                  key={day.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-secondary/30 px-3 py-2"
                >
                  <span className="min-w-0 truncate font-sans text-xs font-semibold text-foreground">
                    {day.focus}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {day.routine_exercises.length} ej.
                  </span>
                </li>
              ))}
              {activeRoutine.routine_days.length > 3 ? (
                <li className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  +{activeRoutine.routine_days.length - 3} días más
                </li>
              ) : null}
            </ul>

            <button
              onClick={() => navigate(`/users/profile/${userId}/routine`)}
              className="mt-5 w-full cursor-pointer rounded-md bg-primary py-3 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              Entrenar
            </button>
          </>
        )}
      </div>
    </section>
  )
}
