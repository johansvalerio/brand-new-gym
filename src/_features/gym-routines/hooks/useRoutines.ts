"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import type { UserRoutine } from "./useUserRoutines"

export type RoutineRow = Tables<"routines">
export type CreateRoutineDto = TablesInsert<"routines">
export type UpdateRoutineDto = TablesUpdate<"routines">

export const routineKeys = {
  detail: (id: number) => ["routines", id] as const,
}

async function fetchRoutine(id: number): Promise<RoutineRow | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

export function useRoutine(id: number | null | undefined) {
  return useQuery({
    queryKey: id ? routineKeys.detail(id) : ["routines", "noop"],
    queryFn: () => fetchRoutine(id as number),
    enabled: Boolean(id),
  })
}

export function useCreateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateRoutineDto): Promise<RoutineRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("routines")
        .insert(dto)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (routine) => {
      toast.success(`Rutina "${routine.name}" creada correctamente`)
      // Invalida la lista del usuario dueño
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

export function useUpdateRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: number
      dto: UpdateRoutineDto
    }): Promise<RoutineRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("routines")
        .update({ ...dto, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
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

export function useDeleteRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (routine: RoutineRow): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase
        .from("routines")
        .delete()
        .eq("id", routine.id)
      if (error) throw error
    },
    onMutate: async (routine) => {
      await queryClient.cancelQueries({
        queryKey: ["users", routine.user_id, "routines"],
      })
      const previous = queryClient.getQueryData<UserRoutine[]>([
        "users",
        routine.user_id,
        "routines",
      ])

      queryClient.setQueryData<UserRoutine[]>(
        ["users", routine.user_id, "routines"],
        (old) => old?.filter((r) => r.id !== routine.id) ?? old,
      )

      return { previous }
    },
    onSuccess: (_, routine) => {
      toast.success(`Rutina "${routine.name}" eliminada correctamente`)
    },
    onError: (error, routine, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["users", routine.user_id, "routines"],
          context.previous,
        )
      }
      toast.error("No se pudo eliminar la rutina", {
        description: error.message,
      })
    },
    onSettled: (_data, _err, routine) => {
      queryClient.invalidateQueries({
        queryKey: ["users", routine.user_id, "routines"],
      })
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(routine.id) })
    },
  })
}
