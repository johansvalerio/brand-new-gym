"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"
import { useExerciseCatalog, type ExerciseRow } from "@/_features/gym-routines/hooks/useExercises"

export type { ExerciseRow }
export { useExerciseCatalog }

export type WorkoutLogRow = Tables<"workout_logs">

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

export const workoutKeys = {
  all: (userId: string) => ["workouts", userId] as const,
}

export function useSaveWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SaveWorkoutInput): Promise<WorkoutLogRow> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("save_workout", {
        p_routine_id: input.routineId,
        p_routine_day_id: input.routineDayId,
        p_notes: input.notes,
        p_sets: input.sets as unknown as never[],
      })
      if (error) throw new Error(error.message)
      return data as WorkoutLogRow
    },
    onSuccess: (_log, input) => {
      toast.success("Entrenamiento guardado")
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(input.userId) })
    },
    onError: (error) => {
      toast.error("No se pudo guardar el entrenamiento", {
        description: error.message,
      })
    },
  })
}