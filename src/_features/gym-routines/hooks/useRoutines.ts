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
  all: ["routines"] as const,
  detail: (id: number) => ["routines", id] as const,
  byUser: (userId: string) => ["users", userId, "routines"] as const,
}

async function fetchRoutine(id: number): Promise<RoutineRow | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
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

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (routine) => {
      toast.success(`Rutina "${routine.name}" creada correctamente`)
      queryClient.invalidateQueries({ queryKey: routineKeys.byUser(routine.user_id) })
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

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (routine) => {
      toast.success(`Rutina "${routine.name}" actualizada correctamente`)
      queryClient.invalidateQueries({ queryKey: routineKeys.byUser(routine.user_id) })
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
      if (error) throw new Error(error.message)
    },
    onMutate: async (routine) => {
      await queryClient.cancelQueries({ queryKey: routineKeys.byUser(routine.user_id) })
      const previous = queryClient.getQueryData<UserRoutine[]>(routineKeys.byUser(routine.user_id))

      queryClient.setQueryData<UserRoutine[]>(routineKeys.byUser(routine.user_id), (old) => old?.filter((r) => r.id !== routine.id) ?? old)

      return { previous }
    },
    onSuccess: (_, routine) => {
      toast.success(`Rutina "${routine.name}" eliminada correctamente`)
    },
    onError: (error, routine, context) => {
      if (context?.previous) {
        queryClient.setQueryData(routineKeys.byUser(routine.user_id), context.previous)
      }
      toast.error("No se pudo eliminar la rutina", { description: error.message })
    },
    onSettled: (_data, _err, routine) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.byUser(routine.user_id) })
      queryClient.invalidateQueries({ queryKey: routineKeys.detail(routine.id) })
    },
  })
}
