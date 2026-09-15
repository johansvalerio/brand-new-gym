"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useGym } from "@/app/providers/gym-provider"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { expenseFormSchema } from "../lib/expense.schema"

export type ExpenseRow = Tables<"expenses">
export type CreateExpenseDto = TablesInsert<"expenses">
export type UpdateExpenseDto = TablesUpdate<"expenses">

export const expenseKeys = {
  all: ["expenses"] as const,
  /** Egresos por gym: sin gym en la key, el caché mezclaría gyms. */
  byGym: (gymId: string) => ["expenses", gymId] as const,
  detail: (id: string) => ["expenses", id] as const,
}

// Beneficiario embebido (coach/recepción) cuando el egreso tiene paid_to_user_id.
export type ExpenseWithPayee = ExpenseRow & {
  payee: { first_name: string | null; last_name: string | null } | null
}

async function fetchExpenses(gymId: string): Promise<ExpenseWithPayee[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("expenses")
    .select("*, payee:users!expenses_paid_to_user_id_fkey(first_name, last_name)")
    .eq("gym_id", gymId)
    .order("expense_date", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ExpenseWithPayee[]
}

export function useExpenses() {
  const gym = useGym()
  const gymId = gym?.id ?? "none"
  return useQuery({
    queryKey: expenseKeys.byGym(gymId),
    queryFn: () => fetchExpenses(gymId),
    enabled: !!gym?.id,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateExpenseDto): Promise<ExpenseRow> => {
      const parsed = expenseFormSchema.safeParse({
        category: dto.category as string,
        description: dto.description as string,
        amount: dto.amount as number,
        expense_date: dto.expense_date as string,
        paid_to_user_id: dto.paid_to_user_id ?? null,
      })
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos")
      const supabase = createClient()
      // gym_id lo pone el default/trigger (el cliente nunca lo manda).
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          category: parsed.data.category,
          description: parsed.data.description.trim(),
          amount: parsed.data.amount,
          expense_date: parsed.data.expense_date,
          paid_to_user_id: parsed.data.paid_to_user_id ?? null,
        })
        .select("*")
        .single()

      if (error) throw new Error(error.message)
      return data as ExpenseRow
    },
    onSuccess: (expense) => {
      toast.success(`Egreso "${expense.description}" registrado`)
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo registrar el egreso", { description: error.message })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateExpenseDto
    }): Promise<ExpenseRow> => {
      const parsed = expenseFormSchema.safeParse({
        category: dto.category as string,
        description: dto.description as string,
        amount: dto.amount as number,
        expense_date: dto.expense_date as string,
        paid_to_user_id: dto.paid_to_user_id ?? null,
      })
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos")
      const supabase = createClient()
      const { data, error } = await supabase
        .from("expenses")
        .update({
          category: parsed.data.category,
          description: parsed.data.description.trim(),
          amount: parsed.data.amount,
          expense_date: parsed.data.expense_date,
          paid_to_user_id: parsed.data.paid_to_user_id ?? null,
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error) throw new Error(error.message)
      return data as ExpenseRow
    },
    onSuccess: () => {
      toast.success("Egreso actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el egreso", { description: error.message })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  const gym = useGym()
  const gymId = gym?.id ?? "none"

  return useMutation({
    mutationFn: async (expense: ExpenseRow): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase.from("expenses").delete().eq("id", expense.id)

      if (error) throw new Error(error.message)
    },
    onMutate: async (expense) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.byGym(gymId) })
      const previous = queryClient.getQueryData<ExpenseRow[]>(expenseKeys.byGym(gymId))

      queryClient.setQueryData<ExpenseRow[]>(expenseKeys.byGym(gymId), (old) =>
        old?.filter((row) => row.id !== expense.id) ?? old,
      )

      return { previous }
    },
    onSuccess: (_, expense) => {
      toast.success(`Egreso "${expense.description}" eliminado correctamente`)
    },
    onError: (error, expense, context) => {
      if (context?.previous) {
        queryClient.setQueryData(expenseKeys.byGym(gymId), context.previous)
      }
      toast.error(`No se pudo eliminar "${expense.description}"`, {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })
}
