"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useQuery } from "@tanstack/react-query"
import type { Tables } from "@/types/database.types"
import {
  ROUTINE_GOALS,
  dayLabel,
  goalLabel,
  type RoutineRow,
} from "../hooks/routine-helpers"

type RoutineDayRow = Tables<"routine_days">
type RoutineExerciseRow = Tables<"routine_exercises">
type ExerciseRow = Tables<"exercises">

export type DayDraft = {
  id: number
  routine_id: number | null
  day_index: number
  focus: string
  _status: "kept" | "new"
  exercises: ExerciseDraft[]
}

type ExerciseDraft = {
  id: number
  day_id: number | null
  exercise_id: number
  order_index: number
  sets: number
  reps: string
  rest_seconds: number
  notes: string | null
  _status: "kept" | "new"
}

export type RoutineFormPayload = {
  name: string
  goal: RoutineRow["goal"]
  days_per_week: number
  notes: string | null
  is_active: boolean
}

type Tab = "metadata" | "structure"

interface RoutineFormDialogProps {
  open: boolean
  /** Routine being edited. Null = create mode. */
  routine?: RoutineRow | null
  /** Owner of the routine. Required in create mode. */
  targetUserId: string
  onClose: () => void
  /**
   * Returns the metadata payload + the days to persist.
   * The parent decides how to wire it to useCreateRoutine / useUpdateRoutine
   * and to useRoutines (or future day/exercise mutations).
   */
  onSubmit: (payload: {
    metadata: RoutineFormPayload
    days: DayDraft[]
  }) => Promise<void>
}

const emptyDay = (dayIndex: number): DayDraft => ({
  id: -dayIndex, // negative id for drafts
  routine_id: null,
  day_index: dayIndex,
  focus: "",
  _status: "new",
  exercises: [],
})

const emptyExercise = (orderIndex: number): ExerciseDraft => ({
  id: -orderIndex,
  day_id: null,
  exercise_id: 0,
  order_index: orderIndex,
  sets: 3,
  reps: "8-12",
  rest_seconds: 90,
  notes: null,
  _status: "new",
})

export function RoutineFormDialog({
  open,
  routine,
  targetUserId,
  onClose,
  onSubmit,
}: RoutineFormDialogProps) {
  const isEdit = Boolean(routine)
  const [tab, setTab] = useState<Tab>("metadata")
  const [metadata, setMetadata] = useState<RoutineFormPayload>({
    name: "",
    goal: "hipertrofia",
    days_per_week: 3,
    notes: null,
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [days, setDays] = useState<DayDraft[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Hidratación: cuando se abre el dialog o cambia la routine, sincroniza estado
  useEffect(() => {
    if (!open) return
    setErrors({})
    setTab("metadata")

    if (routine) {
      setMetadata({
        name: routine.name,
        goal: routine.goal,
        days_per_week: routine.days_per_week,
        notes: routine.notes,
        is_active: routine.is_active,
      })
      void hydrateDaysFromRoutine(routine.id).then(setDays)
    } else {
      setMetadata({
        name: "",
        goal: "hipertrofia",
        days_per_week: 3,
        notes: null,
        is_active: true,
      })
      setDays([
        emptyDay(1),
        emptyDay(2),
        emptyDay(3),
      ])
    }

    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open, routine])

  // Escape para cerrar
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const validate = () => {
    const next: Record<string, string> = {}
    if (!metadata.name.trim()) next.name = "El nombre es obligatorio."
    if (metadata.days_per_week < 1 || metadata.days_per_week > 7) {
      next.days_per_week = "Debe estar entre 1 y 7 días."
    }
    if (days.length === 0) next.days = "Agrega al menos un día de entrenamiento."
    days.forEach((day, i) => {
      if (!day.focus.trim()) next[`day_${i}_focus`] = "Foco requerido."
    })

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Hay errores en el formulario", {
        description: "Revisa los campos marcados.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        metadata: {
          name: metadata.name.trim(),
          goal: metadata.goal,
          days_per_week: metadata.days_per_week,
          notes: metadata.notes?.trim() || null,
          is_active: metadata.is_active,
        },
        days,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const set = <K extends keyof RoutineFormPayload>(
    key: K,
    value: RoutineFormPayload[K],
  ) => setMetadata((prev) => ({ ...prev, [key]: value }))

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="routine-form-title"
    >
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="routine-form-title"
                className="font-sans text-lg font-black uppercase tracking-tight text-foreground"
              >
                {isEdit ? "Editar rutina" : "Nueva rutina"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit ? `ID #${routine?.id}` : `Para miembro #${targetUserId.slice(0, 8)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex border-b border-border bg-secondary/30 px-6">
          <TabButton active={tab === "metadata"} onClick={() => setTab("metadata")}>
            Datos básicos
          </TabButton>
          <TabButton active={tab === "structure"} onClick={() => setTab("structure")}>
            Estructura ({days.length} {days.length === 1 ? "día" : "días"})
          </TabButton>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {tab === "metadata" ? (
              <MetadataTab
                metadata={metadata}
                set={set}
                errors={errors}
                firstFieldRef={firstFieldRef}
              />
            ) : (
              <StructureTab
                days={days}
                setDays={setDays}
                errors={errors}
              />
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-secondary/30 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : isEdit ? (
                "Guardar cambios"
              ) : (
                "Crear rutina"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative cursor-pointer border-b-2 px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider transition-colors ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function MetadataTab({
  metadata,
  set,
  errors,
  firstFieldRef,
}: {
  metadata: RoutineFormPayload
  set: <K extends keyof RoutineFormPayload>(
    key: K,
    value: RoutineFormPayload[K],
  ) => void
  errors: Record<string, string>
  firstFieldRef: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Nombre de la rutina" htmlFor="routine_name" error={errors.name}>
        <input
          ref={firstFieldRef}
          id="routine_name"
          value={metadata.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Fuerza Táctica Inicial"
          className={inputCls(errors.name)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Objetivo" htmlFor="goal">
          <select
            id="goal"
            value={metadata.goal}
            onChange={(e) => set("goal", e.target.value as RoutineRow["goal"])}
            className={inputCls()}
          >
            {ROUTINE_GOALS.map((g) => (
              <option key={g} value={g}>
                {goalLabel(g)}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Días por semana"
          htmlFor="days_per_week"
          error={errors.days_per_week}
        >
          <input
            id="days_per_week"
            type="number"
            min={1}
            max={7}
            value={metadata.days_per_week}
            onChange={(e) => set("days_per_week", Number(e.target.value))}
            className={inputCls(errors.days_per_week)}
          />
        </Field>
      </div>

      <Field label="Notas (opcional)" htmlFor="notes">
        <textarea
          id="notes"
          rows={3}
          value={metadata.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || null)}
          placeholder="Enfoque, recomendaciones, instrucciones especiales…"
          className={`${inputCls()} resize-none`}
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
        <input
          type="checkbox"
          checked={metadata.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-primary"
        />
        <div>
          <p className="font-sans text-sm font-semibold text-foreground">
            Rutina activa
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Aparece en el perfil del miembro
          </p>
        </div>
      </label>
    </div>
  )
}

function StructureTab({
  days,
  setDays,
  errors,
}: {
  days: DayDraft[]
  setDays: React.Dispatch<React.SetStateAction<DayDraft[]>>
  errors: Record<string, string>
}) {
  const addDay = () => {
    const nextDayIndex =
      days.length === 0 ? 1 : Math.max(...days.map((d) => d.day_index)) + 1
    if (nextDayIndex > 7) return
    setDays((prev) => [...prev, emptyDay(nextDayIndex)])
  }

  const removeDay = (dayIndex: number) => {
    setDays((prev) => prev.filter((d) => d.day_index !== dayIndex))
  }

  const moveDay = (dayIndex: number, direction: -1 | 1) => {
    setDays((prev) => {
      const sorted = [...prev].sort((a, b) => a.day_index - b.day_index)
      const i = sorted.findIndex((d) => d.day_index === dayIndex)
      const j = i + direction
      if (i < 0 || j < 0 || j >= sorted.length) return prev
      const a = sorted[i]
      const b = sorted[j]
      if (!a || !b) return prev
      sorted[i] = b
      sorted[j] = a
      return sorted
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {errors.days ? (
        <p className="font-mono text-xs text-destructive">{errors.days}</p>
      ) : null}

      {days.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 px-4 py-8 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-muted-foreground/60" />
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            No has agregado días todavía.
          </p>
        </div>
      ) : (
        days
          .sort((a, b) => a.day_index - b.day_index)
          .map((day, i) => (
            <DayEditor
              key={day.day_index}
              day={day}
              isFirst={i === 0}
              isLast={i === days.length - 1}
              error={errors[`day_${i}_focus`]}
              onUpdate={(updated) =>
                setDays((prev) =>
                  prev.map((d) =>
                    d.day_index === day.day_index ? updated : d,
                  ),
                )
              }
              onRemove={() => removeDay(day.day_index)}
              onMoveUp={() => moveDay(day.day_index, -1)}
              onMoveDown={() => moveDay(day.day_index, 1)}
            />
          ))
      )}

      <button
        type="button"
        onClick={addDay}
        disabled={days.length >= 7}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 px-4 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Agregar día
      </button>
    </div>
  )
}

function DayEditor({
  day,
  isFirst,
  isLast,
  error,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  day: DayDraft
  isFirst: boolean
  isLast: boolean
  error?: string
  onUpdate: (updated: DayDraft) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const addExercise = () => {
    const nextOrder =
      day.exercises.length === 0
        ? 1
        : Math.max(...day.exercises.map((e) => e.order_index)) + 1
    onUpdate({
      ...day,
      exercises: [...day.exercises, emptyExercise(nextOrder)],
    })
  }

  const updateExercise = (idx: number, patch: Partial<ExerciseDraft>) => {
    onUpdate({
      ...day,
      exercises: day.exercises.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    })
  }

  const removeExercise = (idx: number) => {
    onUpdate({
      ...day,
      exercises: day.exercises.filter((_, i) => i !== idx),
    })
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-secondary/30">
      <header className="flex items-center justify-between border-b border-border/60 bg-secondary/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {dayLabel(day.day_index)}
          </span>
          <input
            type="text"
            value={day.focus}
            onChange={(e) => onUpdate({ ...day, focus: e.target.value })}
            placeholder="Push · Pull · Pierna · etc."
            className={`w-48 rounded-md border bg-background px-3 py-1.5 font-sans text-sm font-semibold uppercase tracking-tight text-foreground outline-none transition-colors ${
              error
                ? "border-destructive focus:border-destructive"
                : "border-border focus:border-primary"
            }`}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Mover arriba"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Mover abajo"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            aria-label="Eliminar día"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

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

function ExerciseEditor({
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
    <div className="grid grid-cols-12 items-center gap-2 rounded-md border border-border/60 bg-background/40 p-2">
      <select
        value={exercise.exercise_id}
        onChange={(e) => onUpdate({ exercise_id: Number(e.target.value) })}
        className="col-span-5 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
      >
        <option value={0}>Selecciona ejercicio…</option>
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name} · {ex.muscle_group}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={1}
        value={exercise.sets}
        onChange={(e) => onUpdate({ sets: Number(e.target.value) })}
        placeholder="Sets"
        className="col-span-2 rounded-md border border-border bg-background px-2 py-1.5 text-center font-sans text-xs font-bold text-primary outline-none focus:border-primary"
      />

      <input
        type="text"
        value={exercise.reps}
        onChange={(e) => onUpdate({ reps: e.target.value })}
        placeholder="Reps"
        className="col-span-2 rounded-md border border-border bg-background px-2 py-1.5 text-center font-mono text-xs text-foreground outline-none focus:border-primary"
      />

      <input
        type="number"
        min={0}
        value={exercise.rest_seconds}
        onChange={(e) => onUpdate({ rest_seconds: Number(e.target.value) })}
        placeholder="Descanso (s)"
        className="col-span-2 rounded-md border border-border bg-background px-2 py-1.5 text-center font-mono text-xs text-muted-foreground outline-none focus:border-primary"
      />

      <button
        type="button"
        onClick={onRemove}
        className="col-span-1 flex h-7 w-full cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label="Quitar ejercicio"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

async function hydrateDaysFromRoutine(routineId: number): Promise<DayDraft[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("routine_days")
    .select(
      `
      id, routine_id, day_index, focus,
      routine_exercises (
        id, day_id, exercise_id, order_index, sets, reps, rest_seconds, notes
      )
    `,
    )
    .eq("routine_id", routineId)
    .order("day_index", { ascending: true })

  if (error) throw error

  return (data ?? []).map((day) => ({
    id: day.id,
    routine_id: day.routine_id,
    day_index: day.day_index,
    focus: day.focus ?? "",
    _status: "kept",
    exercises: (day.routine_exercises ?? [])
      .sort((a, b) => a.order_index - b.order_index)
      .map((ex) => ({
        id: ex.id,
        day_id: ex.day_id,
        exercise_id: ex.exercise_id,
        order_index: ex.order_index,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes,
        _status: "kept",
      })),
  }))
}

function useExerciseCatalog() {
  return useQuery({
    queryKey: ["exercises", "catalog"],
    queryFn: async (): Promise<ExerciseRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, muscle_group, equipment, created_at")
        .order("muscle_group", { ascending: true })
        .order("name", { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 5 * 60_000,
  })
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-2 text-sm text-foreground">
      <span className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  )
}

function inputCls(error?: string) {
  return [
    "w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60",
    error
      ? "border-destructive focus:border-destructive"
      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/30",
  ].join(" ")
}
