"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

export type ExerciseRow = Tables<"exercises">

export const exerciseKeys = {
  all: ["exercises"] as const,
  catalog: ["exercises", "catalog"] as const,
}

/**
 * Catálogo de ejercicios (compartido entre el wizard de rutinas y la sesión
 * de entrenamiento). Trae image_url + instructions para el picker visual.
 */
async function fetchExerciseCatalog(): Promise<ExerciseRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name, muscle_group, equipment, image_url, instructions, created_at")
    .order("muscle_group", { ascending: true })
    .order("name", { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export function useExerciseCatalog() {
  return useQuery({
    queryKey: exerciseKeys.catalog,
    queryFn: fetchExerciseCatalog,
    staleTime: 5 * 60_000,
  })
}