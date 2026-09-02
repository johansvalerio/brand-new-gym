"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export type SharedPlanAuthor = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar: string | null
  role: string | null
}

export type SharedNutritionPlan = {
  id: number
  name: string
  goal: string
  kcal_target: number | null
  protein_target: number | null
  notes: string | null
  is_shared: boolean
  user_id: string
  created_by: string | null
  created_at: string
  author: SharedPlanAuthor | null
  votes: { user_id: string }[]
  /** Macros reales calculados de las comidas (promedio por día del plan). */
  nutrition_days: {
    id: number
    day_index: number
    focus: string
    nutrition_meals: {
      grams: number
      food: { kcal_100: number; protein_100: number } | null
    }[]
  }[]
}

/** Macros diarios reales: promedio de lo que contienen las comidas (no los targets). */
export function planDailyMacros(plan: Pick<SharedNutritionPlan, "nutrition_days">): { kcal: number; protein: number; meals: number } {
  let kcal = 0
  let protein = 0
  let meals = 0
  for (const d of plan.nutrition_days) {
    for (const m of d.nutrition_meals) {
      if (!m.food) continue
      kcal += (m.food.kcal_100 * m.grams) / 100
      protein += (m.food.protein_100 * m.grams) / 100
      meals++
    }
  }
  const days = plan.nutrition_days.length || 1
  return { kcal: Math.round(kcal / days), protein: Math.round(protein / days), meals }
}

export const sharedNutritionKeys = {
  all: ["nutrition", "shared"] as const,
}

async function fetchSharedNutrition(): Promise<SharedNutritionPlan[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("nutrition_plans")
    .select(
      `id, name, goal, kcal_target, protein_target, notes, is_shared, user_id, created_by, created_at,
       author:users!nutrition_plans_created_by_fkey(id, first_name, last_name, avatar, role),
       votes:nutrition_votes(user_id),
       nutrition_days (id, day_index, focus, nutrition_meals (grams, food:food_id (kcal_100, protein_100)))`,
    )
    .eq("is_shared", true)

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as SharedNutritionPlan[]).sort((a, b) => {
    const diff = b.votes.length - a.votes.length
    if (diff !== 0) return diff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function useSharedNutrition() {
  return useQuery({
    queryKey: sharedNutritionKeys.all,
    queryFn: fetchSharedNutrition,
  })
}

type ToggleVoteInput = {
  planId: number
  voterProfileId: string
  wasVoted: boolean
}

/** Like con optimistic update (patrón useToggleVote de rutinas). */
export function useToggleNutritionVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, voterProfileId, wasVoted }: ToggleVoteInput): Promise<void> => {
      const supabase = createClient()
      if (wasVoted) {
        const { error } = await supabase.from("nutrition_votes").delete().eq("plan_id", planId)
        if (error) throw new Error(error.message)
        return
      }
      const { error } = await supabase.from("nutrition_votes").insert({ plan_id: planId, user_id: voterProfileId })
      if (error) throw new Error(error.message)
    },
    onMutate: async ({ planId, voterProfileId, wasVoted }) => {
      await queryClient.cancelQueries({ queryKey: sharedNutritionKeys.all })
      const previous = queryClient.getQueryData<SharedNutritionPlan[]>(sharedNutritionKeys.all)

      queryClient.setQueryData<SharedNutritionPlan[]>(sharedNutritionKeys.all, (old) =>
        old?.map((plan) => {
          if (plan.id !== planId) return plan
          return {
            ...plan,
            votes: wasVoted
              ? plan.votes.filter((v) => v.user_id !== voterProfileId)
              : [...plan.votes, { user_id: voterProfileId }],
          }
        }) ?? old,
      )

      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(sharedNutritionKeys.all, context.previous)
      toast.error("No se pudo registrar tu voto", {
        description: error instanceof Error ? error.message : String(error),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sharedNutritionKeys.all })
    },
  })
}

/** Copia el plan compartido a la lista del viewer via RPC (SECURITY DEFINER). */
export function useCopySharedNutritionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId }: { planId: number; viewerId: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("copy_shared_nutrition_plan", { source_plan_id: planId })
      if (error) throw new Error(error.message)
      return data as unknown as { id: number; name: string }
    },
    onSuccess: (plan, { viewerId }) => {
      toast.success(`Plan "${plan.name}" copiado a tus planes`)
      queryClient.invalidateQueries({ queryKey: ["users", viewerId, "nutrition"] })
    },
    onError: (error) => {
      toast.error("No se pudo copiar el plan", { description: error.message })
    },
  })
}
