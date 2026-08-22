"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

export type ExerciseRow = {
  id: number
  name: string
  muscle_group: string
  equipment: string | null
}

export type RoutineExerciseRow = {
  id: number
  order_index: number
  sets: number
  reps: string
  rest_seconds: number
  notes: string | null
  exercise: ExerciseRow
}

export type RoutineDayRow = {
  id: number
  day_index: number
  focus: string
  routine_exercises: RoutineExerciseRow[]
}

export type RoutineAuthor = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar: string | null
  role: "admin" | "user" | "coach" | null
}

export type UserRoutine = {
  id: number
  name: string
  goal: Exclude<Tables<"routines">["goal"], null>
  days_per_week: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
  user_id: string
  author: RoutineAuthor | null
  routine_days: RoutineDayRow[]
}

export const routineKeys = {
  byUser: (userId: string) => ["users", userId, "routines"] as const,
}

async function fetchUserRoutines(userId: string): Promise<UserRoutine[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("routines")
    .select(
      `
        id,
        name,
        goal,
        days_per_week,
        notes,
        is_active,
        created_at,
        updated_at,
        created_by,
        user_id,
        author:created_by (
          id,
          first_name,
          last_name,
          avatar,
          role
        ),
        routine_days (
          id,
          day_index,
          focus,
          routine_exercises (
            id,
            order_index,
            sets,
            reps,
            rest_seconds,
            notes,
            exercise:exercise_id (
              id,
              name,
              muscle_group,
              equipment
            )
          )
        )
      `,
    )
    .eq("user_id", userId)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error

  // Ordenar días y ejercicios por sus índices (Supabase no garantiza orden en joins)
  const normalized = (data ?? []).map((routine) => ({
    ...routine,
    routine_days: [...(routine.routine_days ?? [])]
      .sort((a, b) => a.day_index - b.day_index)
      .map((day) => ({
        ...day,
        routine_exercises: [...(day.routine_exercises ?? [])].sort(
          (a, b) => a.order_index - b.order_index,
        ),
      })),
  })) as UserRoutine[]

  return normalized
}

export function useUserRoutines(userId: string | null | undefined) {
  return useQuery({
    queryKey: routineKeys.byUser(userId ?? ""),
    queryFn: () => fetchUserRoutines(userId as string),
    enabled: Boolean(userId),
  })
}

export function authorBadgeKind(
  routine: Pick<UserRoutine, "created_by" | "user_id">,
  viewerId: string | null | undefined,
): "self" | "coach" | "other" {
  if (viewerId && routine.created_by === viewerId && routine.user_id === viewerId) {
    return "self"
  }
  // "DE TU COACH" cuando el autor es un coach/admin asignado al usuario.
  // Simplificación: si el autor NO es el propio usuario, lo tratamos como coach.
  if (routine.created_by !== routine.user_id) return "coach"
  return "other"
}
