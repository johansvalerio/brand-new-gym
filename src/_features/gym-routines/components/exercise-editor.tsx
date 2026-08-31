"use client"

import { Trash2 } from "lucide-react"
import { ExercisePicker } from "./exercise-picker"
import { useExerciseCatalog } from "../hooks/useExercises"
import type { ExerciseDraft } from "./routine-form-types"

/** Fila de un ejercicio en el day editor: picker visual + series/reps/descanso. */
export function ExerciseEditor({
  exercise,
  onUpdate,
  onRemove,
}: {
  exercise: ExerciseDraft
  onUpdate: (patch: Partial<ExerciseDraft>) => void
  onRemove: () => void
}) {
  const { data: exercises = [] } = useExerciseCatalog()

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-background/40 p-2">
      <ExercisePicker
        catalog={exercises}
        value={exercise.exercise_id}
        onSelect={(id) => onUpdate({ exercise_id: id })}
      />

      <div className="grid grid-cols-4 items-center gap-2 sm:grid-cols-12">
        <div className="col-span-1 flex flex-col gap-1 sm:col-span-3">
          <label
            htmlFor={`sets-${exercise.id}`}
            className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
          >
            Series
          </label>
          <input
            id={`sets-${exercise.id}`}
            type="number"
            min={1}
            value={exercise.sets}
            onChange={(e) => onUpdate({ sets: Number(e.target.value) })}
            placeholder="3"
            className={microInputCls("text-primary")}
          />
        </div>

        <div className="col-span-1 flex flex-col gap-1 sm:col-span-3">
          <label
            htmlFor={`reps-${exercise.id}`}
            className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
          >
            Reps
          </label>
          <input
            id={`reps-${exercise.id}`}
            type="text"
            value={exercise.reps}
            onChange={(e) => onUpdate({ reps: e.target.value })}
            placeholder="8-12"
            className={microInputCls("text-foreground")}
          />
        </div>

        <div className="col-span-1 flex flex-col gap-1 sm:col-span-3">
          <label
            htmlFor={`rest-${exercise.id}`}
            className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
          >
            Descanso (s)
          </label>
          <input
            id={`rest-${exercise.id}`}
            type="number"
            min={0}
            value={exercise.rest_seconds}
            onChange={(e) => onUpdate({ rest_seconds: Number(e.target.value) })}
            placeholder="90"
            className={microInputCls("text-muted-foreground")}
          />
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="col-span-1 flex h-[38px] w-full cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:col-span-3 sm:h-7"
          aria-label="Quitar ejercicio"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function microInputCls(color: string) {
  return [
    "w-full min-w-0 rounded-md border border-border bg-background px-1 py-2 text-center font-mono text-xs",
    "outline-none transition-colors focus:border-primary",
    color,
  ].join(" ")
}