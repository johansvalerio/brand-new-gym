"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

export type PlanRow = Tables<"plans">
export type CreatePlanDto = TablesInsert<"plans">
export type UpdatePlanDto = TablesUpdate<"plans">

export const plansKeys = {
  all: ["plans"] as const,
}

async function fetchPlans(): Promise<PlanRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("duration_days", { ascending: true })

  if (error) throw error
  return data ?? []
}

export function usePlans() {
  return useQuery({
    queryKey: plansKeys.all,
    queryFn: fetchPlans,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreatePlanDto): Promise<PlanRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("plans")
        .insert(dto)
        .select("*")
        .single()

      if (error) throw error
      return data as PlanRow
    },
    onSuccess: (plan) => {
      toast.success(`Plan "${plan.name}" creado correctamente`)
      queryClient.invalidateQueries({ queryKey: plansKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo crear el plan", {
        description: error.message,
      })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string
      dto: UpdatePlanDto
    }): Promise<PlanRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("plans")
        .update(dto)
        .eq("id", id)
        .select("*")
        .single()

      if (error) throw error
      return data as PlanRow
    },
    onSuccess: (plan) => {
      toast.success(`Plan "${plan.name}" actualizado correctamente`)
      queryClient.invalidateQueries({ queryKey: plansKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el plan", {
        description: error.message,
      })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (plan: PlanRow): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase.from("plans").delete().eq("id", plan.id)

      if (error) throw error
    },
    onMutate: async (plan) => {
      await queryClient.cancelQueries({ queryKey: plansKeys.all })
      const previous = queryClient.getQueryData<PlanRow[]>(plansKeys.all)

      queryClient.setQueryData<PlanRow[]>(plansKeys.all, (old) =>
        old?.filter((row) => row.id !== plan.id) ?? old,
      )

      return { previous }
    },
    onSuccess: (_, plan) => {
      toast.success(`Plan "${plan.name}" eliminado correctamente`)
    },
    onError: (error, plan, context) => {
      if (context?.previous) {
        queryClient.setQueryData(plansKeys.all, context.previous)
      }
      toast.error(`No se pudo eliminar "${plan.name}"`, {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: plansKeys.all })
    },
  })
}