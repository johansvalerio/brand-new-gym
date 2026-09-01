"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, Dumbbell, Loader2, Plus, RefreshCw, Wifi, WifiOff, X, Zap } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useUserRoutines } from "@/_features/gym-routines/hooks/useUserRoutines"
import { dayLabel } from "@/_features/gym-routines/hooks/routine-helpers"
import {
  useAbortWorkout,
  useActiveWorkout,
  useExerciseCatalog,
  useFinishWorkout,
  useSaveSet,
  useStartWorkout,
  type ExerciseRow,
  type SetSyncStatus,
} from "../hooks/useWorkoutSession"
import {
  SetLogInputs,
  entriesToSetDrafts,
  type ExerciseEntry,
} from "./set-log-inputs"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import { ExerciseChooser } from "@/_features/gym-routines/components/exercise-chooser"
import { RestTimerBar } from "./rest-timer"

type Mode = "routine" | "free"

let keyCounter = 0
const nextKey = () => `entry-${Date.now()}-${keyCounter++}`

export function WorkoutSession() {
  const { profile, loading: authLoading } = useAuthSession()
  const { navigate } = usePageTransition()
  const { data: routines = [] } = useUserRoutines(profile?.id ?? null)
  const { data: catalog = [] } = useExerciseCatalog()

  // Mutaciones incrementales (B + red A en paso posterior).
  const startWorkout = useStartWorkout()
  const saveSet = useSaveSet()
  const finishWorkout = useFinishWorkout()
  const abortWorkout = useAbortWorkout()
  const { data: orphanWorkout, isLoading: orphanLoading } = useActiveWorkout(profile?.id ?? null)

  const [mode, setMode] = useState<Mode>("routine")
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null)
  const [entries, setEntries] = useState<ExerciseEntry[]>([])
  const [notes, setNotes] = useState("")
  const [chooserOpen, setChooserOpen] = useState(false)
  const [restSeconds, setRestSeconds] = useState<number | null>(null)
  const [workoutLogId, setWorkoutLogId] = useState<number | null>(null)
  const [syncMap, setSyncMap] = useState<Record<string, SetSyncStatus>>({})
  const [syncingCount, setSyncingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  // Detectar online/offline (para el indicador de la cabecera)
  useEffect(() => {
    if (typeof window === "undefined") return
    const updateOnline  = () => setIsOnline(navigator.onLine)
    updateOnline()
    window.addEventListener("online",  updateOnline)
    window.addEventListener("offline", updateOnline)
    return () => {
      window.removeEventListener("online",  updateOnline)
      window.removeEventListener("offline", updateOnline)
    }
  }, [])

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
  // Al menos una serie con peso o reps reales (habilita "Terminar").
  const hasRealSet = entriesToSetDrafts(entries).length > 0

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

  /**
   * Abre la sesión (si no hay una ya abierta). Devuelve el workout_log_id
   * para que saveSet pueda persistir cada serie contra la sesión.
   */
  const ensureSession = async (): Promise<number | null> => {
    if (!profile) return null
    if (workoutLogId) return workoutLogId
    const log = await startWorkout.mutateAsync({
      routineId:    isFree ? null : (activeRoutine?.id ?? null),
      routineDayId: isFree ? null : selectedDayId,
    })
    setWorkoutLogId(log.id)
    return log.id
  }

  /**
   * Persiste cada serie que el usuario completa de forma incremental
   * (estilo Hevy/Strong). El trigger es: la serie tiene weight y reps
   * reales, distintos del valor previo (no spameamos RPCs).
   */
  const syncSet = async (
    entryKey: string,
    setIndex: number,
    draft: { exercise_id: number; weight: number; reps: number; is_warmup: boolean },
  ) => {
    const syncKey = `${entryKey}-${setIndex}`
    if (!isOnline) {
      setSyncMap((m) => ({ ...m, [syncKey]: "offline" }))
      return
    }
    setSyncMap((m) => ({ ...m, [syncKey]: "pending" }))
    setSyncingCount((n) => n + 1)
    try {
      const logId = await ensureSession()
      if (!logId) throw new Error("No se pudo abrir la sesión")
      await saveSet.mutateAsync({
        workoutLogId: logId,
        exerciseId:   draft.exercise_id,
        setNumber:    setIndex + 1,
        weight:       draft.weight,
        reps:         draft.reps,
        isWarmup:     draft.is_warmup,
      })
      setSyncMap((m) => ({ ...m, [syncKey]: "saved" }))
    } catch {
      setSyncMap((m) => ({ ...m, [syncKey]: "offline" }))
    } finally {
      setSyncingCount((n) => Math.max(0, n - 1))
    }
  }

  const handleSave = async () => {
    if (!profile) return
    const sets = entriesToSetDrafts(entries)
    if (sets.length === 0) return

    // Garantiza que la sesión esté abierta antes de sellarla
    const logId = workoutLogId ?? await ensureSession()
    if (!logId) return

    // Sella (completed_at + nota). finishWorkout calcula PRs en onSuccess.
    await finishWorkout.mutateAsync({
      userId:       profile.id,
      workoutLogId: logId,
      notes:        notes.trim() || null,
      sets,
    })
    navigate("/workout/success")
  }

  /** Modal: continuar con la sesión huérfana o cancelarla y empezar nueva. */
  const handleResumeOrphan = async () => {
    if (!orphanWorkout || !profile) return
    setWorkoutLogId(orphanWorkout.id)
  }
  const handleAbandonOrphan = async () => {
    if (!orphanWorkout || !profile) return
    await abortWorkout.mutateAsync({
      userId: profile.id,
      workoutLogId: orphanWorkout.id,
    })
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

  const restMap = useMemo(() => {
    const m = new Map<number, number>()
    if (!isFree && activeRoutine) {
      for (const day of activeRoutine.routine_days) {
        for (const ex of day.routine_exercises) {
          if (!m.has(ex.exercise.id)) m.set(ex.exercise.id, ex.rest_seconds ?? 60)
        }
      }
    }
    return m
  }, [activeRoutine, isFree])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:max-w-4xl">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Sesión
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-5xl">
            Entrenar <span className="text-primary">hoy</span>
          </h1>
        </div>

        {/* Indicador de sync (online + series pendientes) */}
        <div className="mt-1 flex shrink-0 flex-col items-end gap-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
              isOnline
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
            title={isOnline ? "Conectado" : "Sin conexión — guardando en local"}
          >
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? "Online" : "Offline"}
          </span>
          {(syncingCount > 0 || Object.values(syncMap).some((s) => s === "offline")) && (
            <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              {syncingCount > 0 ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Sincronizando {syncingCount}
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" /> Reintentar al volver online
                </>
              )}
            </span>
          )}
        </div>
      </header>

      {/* Modal de sesión huérfana detectada */}
      {orphanLoading ? null : orphanWorkout ? (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-black uppercase tracking-wider text-foreground">
                Sesión sin terminar
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                Empezaste el{" "}
                {new Date(orphanWorkout.started_at).toLocaleString("es-CR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                . ¿Querés continuarla o empezar una nueva?
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleResumeOrphan}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
                >
                  <Check className="h-4 w-4" /> Continuar
                </button>
                <button
                  type="button"
                  onClick={handleAbandonOrphan}
                  disabled={abortWorkout.isPending}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
                >
                  {abortWorkout.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Empezar nueva
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
      {!isFree && activeRoutine && activeRoutine.routine_days.length > 0 ? (
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
      ) : !isFree && activeRoutine ? (
        <div className="mb-6 rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Esta rutina no tiene días configurados. Cambiá a modo{" "}
          <span className="text-primary">Libre</span> para registrar tu sesión.
        </div>
      ) : !isFree ? (
        <div className="mb-6 rounded-lg border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Aún no tenés una rutina. Cambiá a modo <span className="text-primary">Libre</span>{" "}
          para registrar tu sesión.
        </div>
      ) : null}

      {/* Agregar ejercicio (solo libre) — mismo diseño que mis rutinas: ExerciseChooser con grid de fotos */}
      {isFree ? (
        <div className="mb-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Agregar ejercicio
          </p>
          <button
            type="button"
            onClick={() => setChooserOpen(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 px-4 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Agregar ejercicio
          </button>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            {availableCatalog.length} disponibles · {entries.length} agregados
          </p>
          <ExerciseChooser
            open={chooserOpen}
            catalog={availableCatalog}
            value={0}
            onSelect={(id) => {
              const ex = catalog.find((c) => c.id === id)
              if (ex) addFreeExercise(ex)
            }}
            onClose={() => setChooserOpen(false)}
          />
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
              restSeconds={restMap.get(entry.exercise_id) ?? 60}
              onStartRest={(sec) => setRestSeconds(sec)}
              onSetCommitted={syncSet}
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
          {isFree ? (
            <button
              type="button"
              onClick={() => setChooserOpen(true)}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary bg-primary/10 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" />
              Elegir ejercicio
            </button>
          ) : null}
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

      <div className="mt-6 flex justify-end pb-16">
        <button
          onClick={() => void handleSave()}
          disabled={finishWorkout.isPending || !hasRealSet}
          className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {finishWorkout.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Dumbbell className="h-4 w-4" />
          )}
          Terminar entrenamiento
        </button>
      </div>
      <RestTimerBar seconds={restSeconds} onClose={() => setRestSeconds(null)} onDone={() => setRestSeconds(null)} />
    </div>
  )
}