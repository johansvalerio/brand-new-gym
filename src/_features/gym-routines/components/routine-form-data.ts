"use client"

import { createClient } from "@/lib/supabase/client"
import type { DayDraft } from "./routine-form-types"

/** Hidrata los días + ejercicios de una rutina existente (modo edición). */
export async function hydrateDaysFromRoutine(routineId: number): Promise<DayDraft[]> {
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

  if (error) throw new Error(error.message)

  return (data ?? []).map((day) => ({
    id: day.id,
    routine_id: day.routine_id,
    day_index: day.day_index,
    focus: day.focus ?? "",
    _status: "kept" as const,
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
        _status: "kept" as const,
      })),
  }))
}