"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Dumbbell, Loader2, Plus, Zap } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useUserRoutines } from "@/_features/gym-routines/hooks/useUserRoutines"
import { dayLabel } from "@/_features/gym-routines/hooks/routine-helpers"
import {
  useExerciseCatalog,
  useSaveWorkout,
  type ExerciseRow,
} from "../hooks/useWorkoutSession"
import {
  SetLogInputs,
  entriesToSetDrafts,
  type ExerciseEntry,
} from "./set-log-inputs"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

type Mode = "routine" | "free"

let keyCounter = 0
const nextKey = () => `entry-${Date.now()}-${keyCounter++}`

export function WorkoutSession() {
  const { profile, loading: authLoading } = useAuthSession()
  const { navigate } = usePageTransition()
  const { data: routines = [] } = useUserRoutines(profile?.id ?? null)
  const { data: catalog = [] } = useExerciseCatalog()
  const saveWorkout = useSaveWorkout()

  const [mode, setMode] = useState<Mode>("routine")
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null)
  const [entries, setEntries] = useState<ExerciseEntry[]>([])
  const [notes, setNotes] = useState("")

  // Rutina activa (o la primera disponible).
  const activeRoutine = useMemo(
    () => routines.find((r) => r.is_active) ?? routines[0] ?? null,
    [routines],
  )
  const selectedDay = useMemo(
    () =>
      activeRoutine?.routine_days.find((d) => d.id === selectedDayId) ?? null,
    [activeRoutine, selectedDayId],
  )

  const isFree = mode === "free"

  const chooseDay = (dayId: number | null) => {
    setSelectedDayId(dayId)
    mergeRoutineDay(dayId)
  }

  const enterRoutineMode = () => {
    setMode("routine")
    // Preselecciona el primer día si no hay uno.
    const firstDayId =
      activeRoutine?.routine_days.length
        ? activeRoutine.routine_days[0].id
        : null
    if (selectedDayId === null && firstDayId) {
      setSelectedDayId(firstDayId)
    }
    mergeRoutineDay(selectedDayId ?? firstDayId ?? null)
  }

  const enterFreeMode = () => {
    setMode("free")
    setSelectedDayId(null)
    setEntries([])
  }

  const mergeRoutineDay = (dayId: number | null) => {
    if (!activeRoutine || !dayId) return
    const day = activeRoutine.routine_days.find((d) => d.id === dayId)
    if (!day) return
    setEntries(
      day.routine_exercises.map((ex) => ({
        key: nextKey(),
        exercise_id: ex.exercise.id,
        name: ex.exercise.name,
        sets: Array.from({ length: ex.sets }).map(() => ({
          weight: "",
          reps: ex.reps,
          is_warmup: false,
        })),
      })),
    )
  }

  const addFreeExercise = (exercise: ExerciseRow) => {
    const already = entries.find((e) => e.exercise_id === exercise.id)
    if (already) return
    setEntries((prev) => [
      ...prev,
      {
        key: nextKey(),
        exercise_id: exercise.id,
        name: exercise.name,
        sets: [{ weight: "", reps: "", is_warmup: false }],
      },
    ])
  }

  const onChangeEntry = (
    key: string,
    updater: (e: ExerciseEntry) => ExerciseEntry,
  ) => {
    setEntries((prev) => prev.map((e) => (e.key === key ? updater(e) : e)))
  }

  const removeEntry = (key: string) => {
    setEntries((prev) => prev.filter((e) => e.key !== key))
  }

  const handleSave = async () => {
    if (!profile) return
    const sets = entriesToSetDrafts(entries)
    if (sets.length === 0) return

    await saveWorkout.mutateAsync({
      userId: profile.id,
      routineId: isFree ? null : (activeRoutine?.id ?? null),
      routineDayId: isFree ? null : selectedDayId,
      notes: notes.trim() || null,
      sets,
    })
    navigate("/dashboard")
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando...
      </div>
    )
  }

  const availableCatalog = catalog.filter(
    (e) => !entries.some((entry) => entry.exercise_id === e.id),
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <header className="mb-6 mt-4">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Sesión
        </span>
        <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-5xl">
          Entrenar <span className="text-primary">hoy</span>
        </h1>
      </header>

      {/* Selector de modo */}
      <div className="mb-6 grid grid-cols-2 gap-2">
        <button
          onClick={enterRoutineMode}
          aria-pressed={!isFree}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-3 font-sans text-sm font-bold uppercase tracking-wider transition-colors ${
            !isFree
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          Mi rutina
        </button>
        <button
          onClick={enterFreeMode}
          aria-pressed={isFree}
          className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-3 font-sans text-sm font-bold uppercase tracking-wider transition-colors ${
            isFree
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="h-4 w-4" />
          Libre
        </button>
      </div>

      {/* Selector de día (solo modo rutina) */}
      {!isFree && activeRoutine ? (
        <div className="mb-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Día de tu rutina
          </p>
          <div className="flex flex-wrap gap-2">
            {activeRoutine.routine_days.map((d) => (
              <button
                key={d.id}
                onClick={() => chooseDay(d.id)}
                aria-pressed={selectedDayId === d.id}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors ${
                  selectedDayId === d.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {dayLabel(d.day_index)} · {d.focus}
              </button>
            ))}
          </div>
        </div>
      ) : !isFree && !activeRoutine ? (
        <div className="mb-6 rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Aún no tenés una rutina. Cambiá a modo <span className="text-primary">Libre</span>{" "}
          para registrar tu sesión.
        </div>
      ) : null}

      {/* Agregar ejercicio (solo libre) */}
      {isFree ? (
        <div className="mb-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Agregar ejercicio
          </p>
          <select
            value=""
            onChange={(e) => {
              const ex = catalog.find((c) => c.id === Number(e.target.value))
              if (ex) addFreeExercise(ex)
            }}
            className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Seleccionar ejercicio…</option>
            {availableCatalog.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
                {ex.muscle_group ? ` · ${ex.muscle_group}` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <SetLogInputs
              key={entry.key}
              entry={entry}
              onChange={onChangeEntry}
              onRemove={removeEntry}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-card/50 px-4 py-10 text-center">
          <Plus className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 font-sans text-sm font-bold text-foreground">
            {isFree
              ? "Agregá ejercicios para registrar tus series"
              : "Elegí un día para cargar sus ejercicios"}
          </p>
        </div>
      )}

      {/* Nota general */}
      <div className="mt-6">
        <label htmlFor="workout-notes" className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          ¿Cómo te fue? (opcional)
        </label>
        <textarea
          id="workout-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Me sentí fuerte hoy…"
          className="w-full resize-none rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => void handleSave()}
          disabled={saveWorkout.isPending || entries.length === 0}
          className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveWorkout.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Dumbbell className="h-4 w-4" />
          )}
          Terminar entrenamiento
        </button>
      </div>
    </div>
  )
}