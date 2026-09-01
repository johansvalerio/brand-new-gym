"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Plus, Trash2, Timer, Play } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SetDraft } from "../hooks/useWorkoutSession"
import { useExerciseCatalog } from "@/_features/gym-routines/hooks/useExercises"
import { ExerciseChooser } from "@/_features/gym-routines/components/exercise-chooser"
import { ExerciseVisual } from "@/_features/gym-routines/components/exercise-picker"

export type ExerciseEntry = {
  key: string
  exercise_id: number
  name: string
  sets: { weight: string; reps: string; is_warmup: boolean }[]
}

/**
 * Editor de series de UN ejercicio dentro de la sesión.
 * Cada serie = peso (kg) + reps, con micro-label SIEMPRE visible (igual al
 * ExerciseEditor de rutinas): en móvil se apilan, en desktop es una tabla.
 */
export function SetLogInputs({
  entry,
  onChange,
  onRemove,
  restSeconds = 60,
  onStartRest,
  onSetCommitted,
}: {
  entry: ExerciseEntry
  onChange: (key: string, updater: (e: ExerciseEntry) => ExerciseEntry) => void
  onRemove: (key: string) => void
  restSeconds?: number
  onStartRest?: (seconds: number) => void
  onSetCommitted?: (entryKey: string, setIndex: number, draft: { exercise_id: number; weight: number; reps: number; is_warmup: boolean }) => void
}) {
  const { data: catalog = [] } = useExerciseCatalog()
  const exercise = catalog.find((e) => e.id === entry.exercise_id) ?? null
  const [pickerOpen, setPickerOpen] = useState(false)
  const [restChoice, setRestChoice] = useState(restSeconds)

  useEffect(() => {
    setRestChoice(restSeconds)
  }, [restSeconds])

  const updateSet = (i: number, field: "weight" | "reps" | "is_warmup", value: string | boolean) => {
    onChange(entry.key, (e) => {
      const nextSets = e.sets.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
      // Si la serie quedó "completa" (peso y reps reales, no warmup),
      // notifica al padre para que dispare el guardado incremental.
      if (onSetCommitted) {
        const updated = nextSets[i]
        const w = typeof updated.weight === "string" ? parseFloat(updated.weight) : updated.weight
        const r = typeof updated.reps === "string" ? parseInt(updated.reps, 10) : updated.reps
        if (!updated.is_warmup && (w ?? 0) > 0 && (r ?? 0) > 0) {
          onSetCommitted(entry.key, i, {
            exercise_id: e.exercise_id,
            weight:      w,
            reps:        r,
            is_warmup:   updated.is_warmup,
          })
        }
      }
      return { ...e, sets: nextSets }
    })
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
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md border border-border bg-background px-2 py-1.5 text-left transition-colors hover:border-primary/50"
        >
          <ExerciseVisual exercise={exercise} className="h-9 w-9" />
          <span className="min-w-0 flex-1 truncate">
            <span className="block truncate font-sans text-xs font-bold text-foreground">{exercise?.name ?? entry.name}</span>
            <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {exercise ? `${exercise.muscle_group}${exercise.equipment ? ` · ${exercise.equipment}` : ""}` : "—"}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(entry.key)}
          aria-label={`Quitar ${entry.name}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <ExerciseChooser
        open={pickerOpen}
        catalog={catalog}
        value={entry.exercise_id}
        onSelect={(id) => {
          const ex = catalog.find((c) => c.id === id)
          if (!ex) return
          onChange(entry.key, (e) => ({ ...e, exercise_id: ex.id, name: ex.name }))
        }}
        onClose={() => setPickerOpen(false)}
      />

      <div className="flex flex-col gap-2">
        {/* Cabecera de columnas (solo desktop: el header ya da contexto) */}
        <div className="hidden grid-cols-[2.5rem_1fr_1fr_2rem] gap-2 px-1 sm:grid">
          <span className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Set
          </span>
          <span className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Peso (kg)
          </span>
          <span className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Reps
          </span>
          <span />
        </div>

        {entry.sets.map((s, i) => (
          <div key={i}>
            {/* Móvil: cada serie con su número y labels arriba de cada campo */}
            <div className="rounded-md border border-border/50 bg-background/40 p-2 sm:hidden">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Serie {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  aria-label={`Quitar serie ${i + 1}`}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`weight-${entry.key}-${i}`}
                    className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                  >
                    Peso (kg)
                  </label>
                  <input
                    id={`weight-${entry.key}-${i}`}
                    inputMode="decimal"
                    value={s.weight}
                    onChange={(e) => updateSet(i, "weight", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-md border border-border bg-background px-2 py-2 text-center font-sans text-xs font-bold text-primary outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`reps-${entry.key}-${i}`}
                    className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
                  >
                    Reps
                  </label>
                  <input
                    id={`reps-${entry.key}-${i}`}
                    inputMode="numeric"
                    value={s.reps}
                    onChange={(e) => updateSet(i, "reps", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-md border border-border bg-background px-2 py-2 text-center font-sans text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Desktop: fila en tabla */}
            <div className="hidden grid-cols-[2.5rem_1fr_1fr_2rem] items-center gap-2 sm:grid">
              <span className="text-center font-mono text-sm font-bold text-muted-foreground">
                {i + 1}
              </span>
              <input
                inputMode="decimal"
                value={s.weight}
                onChange={(e) => updateSet(i, "weight", e.target.value)}
                placeholder="0"
                aria-label={`Peso serie ${i + 1}`}
                className="w-full rounded-md border border-border bg-background px-2 py-2 text-center font-sans text-sm font-bold text-primary outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <input
                inputMode="numeric"
                value={s.reps}
                onChange={(e) => updateSet(i, "reps", e.target.value)}
                placeholder="0"
                aria-label={`Reps serie ${i + 1}`}
                className="w-full rounded-md border border-border bg-background px-2 py-2 text-center font-sans text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
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
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addSet}
            className="flex cursor-pointer items-center gap-1.5 self-start rounded-md border border-border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Serie
          </button>
          {onStartRest ? (
            <div className="ml-auto flex items-center gap-1.5">
              <Select value={String(restChoice)} onValueChange={(v) => setRestChoice(Number(v))}>
                <SelectTrigger
                  size="sm"
                  className="h-7 gap-1 rounded-full border-white/20 bg-black px-2.5 py-1 font-mono text-[11px] font-bold text-white hover:bg-black focus:border-primary focus:ring-primary/30 data-[state=open]:bg-black data-[state=open]:text-white [&_svg]:text-white"
                >
                  <Timer className="h-3.5 w-3.5 text-primary" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-black text-white">
                  <SelectItem value="30" className="text-white focus:bg-primary focus:text-black data-[state=checked]:bg-primary data-[state=checked]:text-black">
                    30s
                  </SelectItem>
                  <SelectItem value="45" className="text-white focus:bg-primary focus:text-black">
                    45s
                  </SelectItem>
                  <SelectItem value="60" className="text-white focus:bg-primary focus:text-black">
                    60s
                  </SelectItem>
                  <SelectItem value={String(90)} className="text-white focus:bg-primary focus:text-black">
                    90s
                  </SelectItem>
                  <SelectItem value="120" className="text-white focus:bg-primary focus:text-black">
                    2m
                  </SelectItem>
                  <SelectItem value="150" className="text-white focus:bg-primary focus:text-black">
                    2:30
                  </SelectItem>
                  <SelectItem value="180" className="text-white focus:bg-primary focus:text-black">
                    3m
                  </SelectItem>
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => onStartRest(restChoice)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-sans text-xs font-black uppercase tracking-wider text-black shadow-[0_0_12px_rgba(150,217,6,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(150,217,6,0.6)]"
              >
                <Play className="h-3.5 w-3.5 fill-black" /> Descanso
              </button>
            </div>
          ) : null}
        </div>
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