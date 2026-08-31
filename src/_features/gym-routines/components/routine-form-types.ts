import type { Tables } from "@/types/database.types"

export type RoutineRow = Tables<"routines">
export type RoutineDayRow = Tables<"routine_days">
export type RoutineExerciseRow = Tables<"routine_exercises">

export type ExerciseDraft = {
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

export type DayDraft = {
  id: number
  routine_id: number | null
  day_index: number
  focus: string
  _status: "kept" | "new"
  exercises: ExerciseDraft[]
}

export type RoutineFormPayload = {
  name: string
  goal: RoutineRow["goal"]
  days_per_week: number
  notes: string | null
  is_active: boolean
}

/** Wizard de 2 pasos: primero datos, luego estructura. */
export type Step = "datos" | "estructura"

export const emptyDay = (dayIndex: number): DayDraft => ({
  id: -dayIndex, // negative id for drafts
  routine_id: null,
  day_index: dayIndex,
  focus: "",
  _status: "new",
  exercises: [],
})

export const emptyExercise = (orderIndex: number): ExerciseDraft => ({
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