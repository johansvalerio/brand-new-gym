"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useGym } from "@/app/providers/gym-provider"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { recurringIncomeFormSchema } from "../lib/recurring-income.schema"

export type RecurringIncomeRow = Tables<"recurring_incomes">
export type CreateRecurringIncomeDto = TablesInsert<"recurring_incomes">
export type UpdateRecurringIncomeDto = TablesUpdate<"recurring_incomes">

export const recurringIncomeKeys = {
  all: ["recurring-incomes"] as const,
  /** Rentas por gym: sin gym en la key, el caché mezclaría gyms. */
  byGym: (gymId: string) => ["recurring-incomes", gymId] as const,
  detail: (id: string) => ["recurring-incomes", id] as const,
}

async function fetchRecurringIncomes(gymId: string): Promise<RecurringIncomeRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("recurring_incomes")
    .select("*")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export function useRecurringIncomes() {
  const gym = useGym()
  const gymId = gym?.id ?? "none"
  return useQuery({
    queryKey: recurringIncomeKeys.byGym(gymId),
    queryFn: () => fetchRecurringIncomes(gymId),
    enabled: !!gym?.id,
  })
}

export function useCreateRecurringIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateRecurringIncomeDto): Promise<RecurringIncomeRow> => {
      const parsed = recurringIncomeFormSchema.safeParse({
        category: dto.category as string,
        description: dto.description as string,
        amount: dto.amount as number,
        is_active: (dto.is_active as boolean) ?? true,
      })
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos")
      const supabase = createClient()
      // gym_id lo pone el default/trigger (el cliente nunca lo manda).
      const { data, error } = await supabase
        .from("recurring_incomes")
        .insert({
          category: parsed.data.category,
          description: parsed.data.description.trim(),
          amount: parsed.data.amount,
          is_active: parsed.data.is_active,
        })
        .select("*")
        .single()

      if (error) throw new Error(error.message)
      return data as RecurringIncomeRow
    },
    onSuccess: (income) => {
      toast.success(`Renta "${income.description}" creada`)
      queryClient.invalidateQueries({ queryKey: recurringIncomeKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo crear la renta", { description: error.message })
    },
  })
}

export function useUpdateRecurringIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateRecurringIncomeDto
    }): Promise<RecurringIncomeRow> => {
      const parsed = recurringIncomeFormSchema.safeParse({
        category: dto.category as string,
        description: dto.description as string,
        amount: dto.amount as number,
        is_active: dto.is_active as boolean,
      })
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos")
      const supabase = createClient()
      const { data, error } = await supabase
        .from("recurring_incomes")
        .update({
          category: parsed.data.category,
          description: parsed.data.description.trim(),
          amount: parsed.data.amount,
          is_active: parsed.data.is_active,
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error) throw new Error(error.message)
      return data as RecurringIncomeRow
    },
    onSuccess: () => {
      toast.success("Renta actualizada correctamente")
      queryClient.invalidateQueries({ queryKey: recurringIncomeKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo actualizar la renta", { description: error.message })
    },
  })
}

/** Pausar/Reanudar: solo flips is_active (sin zod completo). */
export function useToggleRecurringIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string
      is_active: boolean
    }): Promise<RecurringIncomeRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("recurring_incomes")
        .update({ is_active })
        .eq("id", id)
        .select("*")
        .single()

      if (error) throw new Error(error.message)
      return data as RecurringIncomeRow
    },
    onSuccess: (income) => {
      toast.success(
        income.is_active ? `Renta "${income.description}" reanudada` : `Renta "${income.description}" pausada`,
      )
      queryClient.invalidateQueries({ queryKey: recurringIncomeKeys.all })
      // Las rentas activas cuentan en cada mes del gráfico de ingresos.
      queryClient.invalidateQueries({ queryKey: ["income"] })
    },
    onError: (error) => {
      toast.error("No se pudo cambiar el estado", { description: error.message })
    },
  })
}

export function useDeleteRecurringIncome() {
  const queryClient = useQueryClient()
  const gym = useGym()
  const gymId = gym?.id ?? "none"

  return useMutation({
    mutationFn: async (income: RecurringIncomeRow): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase.from("recurring_incomes").delete().eq("id", income.id)

      if (error) throw new Error(error.message)
    },
    onMutate: async (income) => {
      await queryClient.cancelQueries({ queryKey: recurringIncomeKeys.byGym(gymId) })
      const previous = queryClient.getQueryData<RecurringIncomeRow[]>(
        recurringIncomeKeys.byGym(gymId),
      )

      queryClient.setQueryData<RecurringIncomeRow[]>(recurringIncomeKeys.byGym(gymId), (old) =>
        old?.filter((row) => row.id !== income.id) ?? old,
      )

      return { previous }
    },
    onSuccess: (_, income) => {
      toast.success(`Renta "${income.description}" eliminada correctamente`)
      queryClient.invalidateQueries({ queryKey: ["income"] })
    },
    onError: (error, income, context) => {
      if (context?.previous) {
        queryClient.setQueryData(recurringIncomeKeys.byGym(gymId), context.previous)
      }
      toast.error(`No se pudo eliminar "${income.description}"`, {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recurringIncomeKeys.all })
    },
  })
}
