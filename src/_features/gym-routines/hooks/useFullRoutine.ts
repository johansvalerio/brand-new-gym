"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { TablesInsert, TablesUpdate } from "@/types/database.types"
import { routineKeys, type RoutineRow } from "./useRoutines"
import type { DayDraft, RoutineFormPayload } from "../components/routine-form-dialog"

type RoutineFullPayload = {
  metadata: RoutineFormPayload
  days: DayDraft[]
  targetUserId: string
  /** id del perfil del autor (users.id de la sesión — NO el auth id). */
  authorId: string
}

type EditPayload = {
  routineId: number
  metadata: RoutineFormPayload
  days: DayDraft[]
  userId: string
}

async function persistDays(
  supabase: ReturnType<typeof createClient>,
  routineId: number,
  days: DayDraft[],
): Promise<void> {
  // 1. Días existentes que NO están en el nuevo draft → eliminar
  // Para simplicidad: borramos todos los días existentes y reinsertamos.
  // (Si se quiere control fino, agregar diffing. v1: replace completo.)
  await supabase.from("routine_days").delete().eq("routine_id", routineId)

  // 2. Insertar días nuevos
  for (const day of days) {
    const { data: insertedDay, error: dayErr } = await supabase
      .from("routine_days")
      .insert({
        routine_id: routineId,
        day_index: day.day_index,
        focus: day.focus.trim(),
      } satisfies TablesInsert<"routine_days">)
      .select()
      .single()

    if (dayErr) throw dayErr

    if (insertedDay && day.exercises.length > 0) {
      const exercisesPayload: TablesInsert<"routine_exercises">[] = day.exercises
        .filter((ex) => ex.exercise_id > 0)
        .map((ex) => ({
          day_id: insertedDay.id,
          exercise_id: ex.exercise_id,
          order_index: ex.order_index,
          sets: ex.sets,
          reps: ex.reps,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
        }))

      if (exercisesPayload.length > 0) {
        const { error: exErr } = await supabase
          .from("routine_exercises")
          .insert(exercisesPayload)
        if (exErr) throw exErr
      }
    }
  }
}

export function useCreateFullRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      metadata,
      days,
      targetUserId,
      authorId,
    }: RoutineFullPayload): Promise<RoutineRow> => {
      const supabase = createClient()

      // 1. Crear la cabecera
      const { data: routine, error } = await supabase
        .from("routines")
        .insert({
          name: metadata.name,
          goal: metadata.goal,
          days_per_week: metadata.days_per_week,
          notes: metadata.notes,
          is_active: metadata.is_active,
          user_id: targetUserId,
          created_by: authorId,
        } satisfies TablesInsert<"routines">)
        .select()
        .single()

      if (error) throw error

      // 2. Persistir días y ejercicios
      await persistDays(supabase, routine.id, days)

      return routine
    },
    onSuccess: (routine) => {
      toast.success(`Rutina "${routine.name}" creada correctamente`)
      queryClient.invalidateQueries({
        queryKey: ["users", routine.user_id, "routines"],
      })
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(routine.id) })
    },
    onError: (error) => {
      toast.error("No se pudo crear la rutina", {
        description: error.message,
      })
    },
  })
}

export function useUpdateFullRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      routineId,
      metadata,
      days,
      userId,
    }: EditPayload): Promise<RoutineRow> => {
      const supabase = createClient()

      // 1. Update cabecera
      const { data: routine, error } = await supabase
        .from("routines")
        .update({
          name: metadata.name,
          goal: metadata.goal,
          days_per_week: metadata.days_per_week,
          notes: metadata.notes,
          is_active: metadata.is_active,
          updated_at: new Date().toISOString(),
        } satisfies TablesUpdate<"routines">)
        .eq("id", routineId)
        .select()
        .single()

      if (error) throw error

      // 2. Reemplazar estructura completa
      await persistDays(supabase, routineId, days)

      return routine
    },
    onSuccess: (routine) => {
      toast.success(`Rutina "${routine.name}" actualizada correctamente`)
      queryClient.invalidateQueries({
        queryKey: ["users", routine.user_id, "routines"],
      })
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(routine.id) })
    },
    onError: (error) => {
      toast.error("No se pudo actualizar la rutina", {
        description: error.message,
      })
    },
  })
}
