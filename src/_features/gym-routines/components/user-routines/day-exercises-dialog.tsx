"use client"

import { useEffect } from "react"
import { X, Timer } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import { dayLabel } from "../../hooks/routine-helpers"
import type { RoutineDayRow } from "../../hooks/useUserRoutines"

/** Foto real del ejercicio o fallback por grupo muscular. */
function ExerciseThumb({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className="h-11 w-11 shrink-0 rounded-md border border-border bg-secondary object-cover" />
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-primary/10 font-mono text-xs font-black uppercase text-primary">
      {name.slice(0, 2)}
    </span>
  )
}

/**
 * Vista de lectura: al dar click a una celda del calendario muestra los
 * ejercicios del día. NO edita — editar es por los botones bajo el calendario.
 */
export function DayExercisesDialog({
  day,
  routineName,
  onClose,
}: {
  day: RoutineDayRow | null
  routineName: string
  onClose: () => void
}) {
  useBodyScrollLock(Boolean(day))

  useEffect(() => {
    if (!day) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [day, onClose])

  if (!day) return null

  const exercises = [...day.routine_exercises].sort((a, b) => a.order_index - b.order_index)
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="day-exercises-title">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{dayLabel(day.day_index)}</p>
            <h2 id="day-exercises-title" className="mt-0.5 font-sans text-lg font-black uppercase tracking-tight text-foreground">
              {day.focus || dayLabel(day.day_index)}
            </h2>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{routineName}</p>
            <p className="mt-1 font-mono text-xs text-primary">
              {exercises.length} ejercicios · {totalSets} series
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {exercises.length === 0 ? (
            <p className="py-8 text-center font-mono text-xs text-muted-foreground">Sin ejercicios este día.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {exercises.map((ex) => (
                <li key={ex.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2.5">
                  <ExerciseThumb imageUrl={ex.exercise?.image_url ?? null} name={ex.exercise?.name ?? "?"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-bold text-foreground">{ex.exercise?.name ?? "Ejercicio"}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {ex.exercise?.muscle_group}{ex.exercise?.equipment ? ` · ${ex.exercise.equipment}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                    <span className="block text-xs font-bold text-foreground">{ex.sets} × {ex.reps}</span>
                    <span className="flex items-center justify-end gap-1">
                      <Timer className="h-3 w-3" /> {ex.rest_seconds}s
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
