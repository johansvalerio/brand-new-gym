"use client"

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"
import { dayLabel } from "../hooks/routine-helpers"
import { ExerciseEditor } from "./exercise-editor"
import { emptyExercise, type DayDraft } from "./routine-form-types"

/** Un día de entrenamiento: header (foco + reordenar/borrar) + lista de ejercicios. */
export function DayEditor({
  day,
  isFirst,
  isLast,
  error,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  day: DayDraft
  isFirst: boolean
  isLast: boolean
  error?: string
  onUpdate: (patch: Partial<DayDraft>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  const addExercise = () => {
    const nextOrder = day.exercises.length + 1
    onUpdate({ exercises: [...day.exercises, emptyExercise(nextOrder)] })
  }

  const updateExercise = (i: number, patch: Parameters<typeof onUpdate>[0]) => {
    const next = day.exercises.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex))
    onUpdate({ exercises: next })
  }

  const removeExercise = (i: number) => {
    onUpdate({ exercises: day.exercises.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-secondary/30">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/60 bg-secondary/60 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-auto">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {dayLabel(day.day_index)}
          </span>
          <input
            type="text"
            value={day.focus}
            onChange={(e) => onUpdate({ focus: e.target.value })}
            placeholder="Push · Pull · Pierna · etc."
            className={`w-full min-w-0 rounded-md border bg-background px-3 py-1.5 font-sans text-sm font-semibold uppercase tracking-tight text-foreground outline-none transition-colors focus:border-primary sm:w-48 ${
              error ? "border-destructive" : "border-border"
            }`}
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Mover arriba"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 sm:h-7 sm:w-7"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Mover abajo"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 sm:h-7 sm:w-7"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Eliminar día"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive sm:h-7 sm:w-7"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {error ? (
        <p className="border-b border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 p-4">
        {day.exercises.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">
            Sin ejercicios. Agrega el primero abajo.
          </p>
        ) : (
          day.exercises.map((ex, i) => (
            <ExerciseEditor
              key={ex.id}
              exercise={ex}
              onUpdate={(patch) => updateExercise(i, patch)}
              onRemove={() => removeExercise(i)}
            />
          ))
        )}

        <button
          type="button"
          onClick={addExercise}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background/30 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-3 w-3" />
          Agregar ejercicio
        </button>
      </div>
    </div>
  )
}