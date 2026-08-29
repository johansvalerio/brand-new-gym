"use client"

import { Plus, Trash2 } from "lucide-react"
import type { SetDraft } from "../hooks/useWorkoutSession"

export type ExerciseEntry = {
  key: string
  exercise_id: number
  name: string
  sets: { weight: string; reps: string; is_warmup: boolean }[]
}

/**
 * Editor de series de UN ejercicio dentro de la sesión.
 * Cada fila = una serie con peso (kg) y reps; el número de serie se deriva
 * del índice. Los valores son strings para permitir campos vacíos while typing.
 */
export function SetLogInputs({
  entry,
  onChange,
  onRemove,
}: {
  entry: ExerciseEntry
  onChange: (key: string, updater: (e: ExerciseEntry) => ExerciseEntry) => void
  onRemove: (key: string) => void
}) {
  const updateSet = (i: number, field: "weight" | "reps" | "is_warmup", value: string | boolean) => {
    onChange(entry.key, (e) => ({
      ...e,
      sets: e.sets.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }))
  }

  const addSet = () => {
    onChange(entry.key, (e) => ({
      ...e,
      sets: [...e.sets, { weight: "", reps: "", is_warmup: false }],
    }))
  }

  const removeSet = (i: number) => {
    onChange(entry.key, (e) => ({
      ...e,
      sets: e.sets.filter((_, idx) => idx !== i),
    }))
  }

  return (
    <div className="rounded-md border border-border/60 bg-secondary/20 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-sans text-sm font-bold text-foreground">{entry.name}</p>
        <button
          type="button"
          onClick={() => onRemove(entry.key)}
          aria-label={`Quitar ${entry.name}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {/* Cabecera de columnas (≥sm) */}
        <div className="hidden grid-cols-[2.5rem_1fr_1fr_2rem] gap-2 px-1 sm:grid">
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Set</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Peso (kg)</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Reps</span>
          <span />
        </div>

        {entry.sets.map((s, i) => (
          <div
            key={i}
            className="grid grid-cols-[2.5rem_1fr_1fr_2rem] items-center gap-2"
          >
            <span className="text-center font-mono text-sm font-bold text-muted-foreground">
              {i + 1}
            </span>
            <input
              inputMode="decimal"
              value={s.weight}
              onChange={(e) => updateSet(i, "weight", e.target.value)}
              placeholder="0"
              aria-label={`Peso serie ${i + 1}`}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <input
              inputMode="numeric"
              value={s.reps}
              onChange={(e) => updateSet(i, "reps", e.target.value)}
              placeholder="0"
              aria-label={`Reps serie ${i + 1}`}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => removeSet(i)}
              aria-label={`Quitar serie ${i + 1}`}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addSet}
          className="flex cursor-pointer items-center gap-1.5 self-start rounded-md border border-border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Serie
        </button>
      </div>
    </div>
  )
}

/** Convierte los entries a los set_drafts definitivos (filtra filas vacías). */
export function entriesToSetDrafts(entries: ExerciseEntry[]): SetDraft[] {
  return entries.flatMap((entry) =>
    entry.sets
      .map((s, i) => ({
        exercise_id: entry.exercise_id,
        set_number: i + 1,
        weight: s.weight.trim() === "" ? 0 : Number(s.weight),
        reps: s.reps.trim() === "" ? 0 : Number(s.reps),
        is_warmup: s.is_warmup,
      }))
      .filter((s) => s.weight > 0 || s.reps > 0),
  )
}