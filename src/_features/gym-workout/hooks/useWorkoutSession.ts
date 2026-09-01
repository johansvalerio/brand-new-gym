"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"
import { useExerciseCatalog, type ExerciseRow } from "@/_features/gym-routines/hooks/useExercises"
import { computePRs, type PR } from "./computePRs"
import type { WorkoutWithSets } from "./useWorkoutHistory"

export type { ExerciseRow }
export { useExerciseCatalog }

export type WorkoutLogRow = Tables<"workout_logs">
export type SetLogRow = Tables<"set_logs">

export type SetDraft = {
  exercise_id: number
  set_number: number
  weight: number
  reps: number
  is_warmup: boolean
}

export type SaveWorkoutInput = {
  userId: string
  routineId: number | null
  routineDayId: number | null
  notes: string | null
  sets: SetDraft[]
}

export type SaveWorkoutResult = {
  log: WorkoutLogRow
  prs: PR[]
}

/**
 * Estado de sincronización de UNA serie dentro de la sesión actual.
 * Permite mostrar indicadores "✓ sincronizado" / "⏳ guardando" / "❌ offline".
 */
export type SetSyncStatus = "saved" | "pending" | "offline"

export const workoutKeys = {
  all: (userId: string) => ["workouts", userId] as const,
}

/** Inicia (o reanuda) una sesión para el usuario autenticado. */
export function useStartWorkout() {
  return useMutation<
    WorkoutLogRow,
    Error,
    { routineId: number | null; routineDayId: number | null }
  >({
    mutationFn: async ({ routineId, routineDayId }) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("get_or_create_active_workout", {
        p_routine_id: routineId,
        p_routine_day_id: routineDayId,
      })
      if (error) throw new Error(error.message)
      return data as WorkoutLogRow
    },
  })
}

/** Guarda 1 serie (idempotente: edita si ya existe). */
export function useSaveSet() {
  return useMutation<
    SetLogRow,
    Error,
    {
      workoutLogId: number
      exerciseId: number
      setNumber: number
      weight: number
      reps: number
      isWarmup: boolean
    }
  >({
    mutationFn: async (input) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("save_set", {
        p_workout_log_id: input.workoutLogId,
        p_exercise_id:    input.exerciseId,
        p_set_number:     input.setNumber,
        p_weight:         input.weight,
        p_reps:           input.reps,
        p_is_warmup:      input.isWarmup,
      })
      if (error) throw new Error(error.message)
      return data as SetLogRow
    },
  })
}

/** Sella la sesión (setea completed_at + nota). Calcula PRs. */
export function useFinishWorkout() {
  const queryClient = useQueryClient()

  return useMutation<
    SaveWorkoutResult,
    Error,
    {
      userId: string
      workoutLogId: number
      notes: string | null
      sets: SetDraft[]
    }
  >({
    mutationFn: async (input) => {
      const supabase = createClient()
      // Snapshot ANTES de invalidar: lo necesitamos para calcular PRs contra
      // el histórico previo.
      const previous = queryClient.getQueryData<WorkoutWithSets[]>(
        workoutKeys.all(input.userId),
      ) ?? []

      const { data, error } = await supabase.rpc("finish_workout", {
        p_workout_log_id: input.workoutLogId,
        p_notes:          input.notes,
      })
      if (error) throw new Error(error.message)

      const log = data as WorkoutLogRow
      const prs = computePRs(
        input.sets,
        previous,
        (id) =>
          previous
            .flatMap((w) => w.set_logs)
            .find((s) => s.exercise_id === id)?.exercises?.name ??
          `Ejercicio #${id}`,
      )
      return { log, prs }
    },
    onSuccess: ({ prs }, input) => {
      if (prs.length > 0) {
        toast.success(
          prs.length === 1 ? "¡Nuevo récord personal!" : `¡${prs.length} récords nuevos!`,
          { description: "Lo viste en la pantalla siguiente." },
        )
      } else {
        toast.success("Entrenamiento guardado")
      }
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(input.userId) })
    },
    onError: (error) => {
      toast.error("No se pudo guardar el entrenamiento", {
        description: error.message,
      })
    },
  })
}

/** Cierra manualmente la sesión huérfana como cancelada. */
export function useAbortWorkout() {
  const queryClient = useQueryClient()
  return useMutation<WorkoutLogRow, Error, { userId: string; workoutLogId: number }>({
    mutationFn: async ({ workoutLogId }) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("finish_workout", {
        p_workout_log_id: workoutLogId,
        p_notes:          "Cancelada — reemplazada por nueva sesión",
      })
      if (error) throw new Error(error.message)
      return data as WorkoutLogRow
    },
    onSuccess: (_log, vars) => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(vars.userId) })
    },
  })
}

/** Query que devuelve la sesión huérfana del usuario (si existe). */
export function useActiveWorkout(userId: string | null) {
  return useQuery<WorkoutLogRow | null>({
    queryKey: userId ? ["active-workout", userId] : ["active-workout", "noop"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const supabase = createClient()
      // Reusamos get_or_create_active pasando NULL → abre si no hay, devuelve la huérfana si hay.
      // Para DETECTAR sin abrir, hacemos un select directo:
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return null
      // Necesitamos users.id del caller — el join no es trivial aquí, así que
      // delegamos a get_or_create_active con NULLs que devuelve la huérfana si existe,
      // o crea una vacía si no. Para EVITAR crear una vacía al chequear, primero
      // hacemos un select directo por user_id via... no, no tenemos el uuid aquí.
      // Solución simple: usamos la RPC pasando null → si devuelve una huérfana
      // (rows > 0 + completed_at IS NULL) la usamos; si devuelve una nueva (creada
      // ahora mismo), la descartamos para "verificar" sin crear.
      // Patrón: llamamos a la RPC; si la sesión es NUEVA (started_at muy reciente),
      // la cerramos inmediatamente como cancelada y devolvemos null.
      const { data, error } = await supabase.rpc("get_or_create_active_workout", {
        p_routine_id: null,
        p_routine_day_id: null,
      })
      if (error) throw new Error(error.message)
      const log = data as WorkoutLogRow
      // Si la sesión tiene series o fue creada hace > 30s → es huérfana real.
      const ageMs = Date.now() - new Date(log.started_at).getTime()
      if (ageMs > 30_000) return log
      // Si no, la acabamos de crear → la cerramos y devolvemos null.
      await supabase.rpc("finish_workout", {
        p_workout_log_id: log.id,
        p_notes:          "Sesión de detección cancelada",
      })
      return null
    },
    staleTime: 10_000,
  })
}

// ─── Compatibilidad: hook viejo preservado para no romper imports existentes.
//     Marcado deprecated; migrar usos a useStartWorkout + useSaveSet + useFinishWorkout.
// ───
/** @deprecated Use useStartWorkout + useSaveSet + useFinishWorkout instead. */
export function useSaveWorkout() {
  const queryClient = useQueryClient()
  return useMutation<SaveWorkoutResult, Error, SaveWorkoutInput>({
    mutationFn: async (input) => {
      const supabase = createClient()
      const previous = queryClient.getQueryData<WorkoutWithSets[]>(
        workoutKeys.all(input.userId),
      ) ?? []
      const { data, error } = await supabase.rpc("save_workout", {
        p_routine_id: input.routineId,
        p_routine_day_id: input.routineDayId,
        p_notes: input.notes,
        p_sets: input.sets as unknown as never[],
      })
      if (error) throw new Error(error.message)
      const log = data as WorkoutLogRow
      const prs = computePRs(
        input.sets,
        previous,
        (id) =>
          previous
            .flatMap((w) => w.set_logs)
            .find((s) => s.exercise_id === id)?.exercises?.name ??
          `Ejercicio #${id}`,
      )
      return { log, prs }
    },
    onSuccess: ({ prs }, input) => {
      if (prs.length > 0) {
        toast.success(
          prs.length === 1 ? "¡Nuevo récord personal!" : `¡${prs.length} récords nuevos!`,
          { description: "Lo viste en la pantalla siguiente." },
        )
      } else {
        toast.success("Entrenamiento guardado")
      }
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(input.userId) })
    },
    onError: (error) => {
      toast.error("No se pudo guardar el entrenamiento", {
        description: error.message,
      })
    },
  })
}
