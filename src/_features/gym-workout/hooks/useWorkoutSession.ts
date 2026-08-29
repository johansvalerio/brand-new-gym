"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

export type WorkoutLogRow = Tables<"workout_logs">

export type ExerciseRow = {
  id: number
  name: string
  muscle_group: string
  equipment: string | null
}

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

async function fetchExerciseCatalog(): Promise<ExerciseRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, equipment")
    .order("muscle_group", { ascending: true })
    .order("name", { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useExerciseCatalog() {
  return useQuery({
    queryKey: ["exercises", "catalog"],
    queryFn: fetchExerciseCatalog,
    staleTime: 5 * 60_000,
  })
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
      if (error) throw error
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