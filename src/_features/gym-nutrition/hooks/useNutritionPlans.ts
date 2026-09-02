// @ts-nocheck
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Tables } from "@/types/database.types"
import { nutritionMetadataSchema } from "../lib/nutrition.schema"

export type NutritionMealRow = {
  id: number
  food_id: number
  grams: number
  meal: string
  order_index: number
  food: { id: number; name: string; kcal_100: number; protein_100: number } | null
}

export type NutritionDayRow = {
  id: number
  day_index: number
  focus: string
  nutrition_meals: NutritionMealRow[]
}

export type NutritionPlanRow = {
  id: number
  name: string
  goal: string
  kcal_target: number | null
  protein_target: number | null
  notes: string | null
  is_active: boolean
  is_shared: boolean
  user_id: string
  created_by: string | null
  created_at: string
  nutrition_days: NutritionDayRow[]
  author: { id: string; first_name: string | null; last_name: string | null; avatar: string | null; role: string | null } | null
  votes: { user_id: string }[]
}

export const nutritionKeys = {
  all: ["nutrition"] as const,
  byUser: (userId: string) => ["users", userId, "nutrition"] as const,
  shared: ["nutrition", "shared"] as const,
}

async function fetchUserNutrition(userId: string): Promise<NutritionPlanRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("nutrition_plans")
    .select(
      `
        id, name, goal, kcal_target, protein_target, notes, is_active, is_shared, user_id, created_by, created_at,
        author:created_by (id, first_name, last_name, avatar, role),
        nutrition_days (id, day_index, focus, nutrition_meals (id, food_id, grams, meal, order_index, food:food_id (id, name, kcal_100, protein_100))),
        votes:nutrition_votes (user_id)
      `
    )
    .eq("user_id", userId)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as NutritionPlanRow[]
}

export function useUserNutrition(userId: string | null | undefined) {
  return useQuery({
    queryKey: nutritionKeys.byUser(userId ?? ""),
    queryFn: () => fetchUserNutrition(userId as string),
    enabled: Boolean(userId),
  })
}

export function useCreateNutrition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      metadata,
      days,
      targetUserId,
      authorId,
    }: {
      metadata: { name: string; goal: string; kcal_target: number | null; protein_target: number | null; notes: string | null; is_active: boolean }
      days: { focus: string; meals: { food_id: number; grams: number; meal: string }[] }[]
      targetUserId: string
      authorId: string
    }) => {
      const parsed = nutritionMetadataSchema.safeParse(metadata)
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos")
      const supabase = createClient()
      const { data: plan, error: planErr } = await supabase
        .from("nutrition_plans")
        .insert({
          user_id: targetUserId,
          created_by: authorId,
          name: metadata.name,
          goal: metadata.goal,
          kcal_target: metadata.kcal_target,
          protein_target: metadata.protein_target,
          notes: metadata.notes,
          is_active: metadata.is_active,
        })
        .select("id")
        .single()
      if (planErr) throw new Error(planErr.message)
      for (let i = 0; i < days.length; i++) {
        const d = days[i]
        const { data: dayRow, error: dayErr } = await supabase
          .from("nutrition_days")
          .insert({ plan_id: plan.id, day_index: i + 1, focus: d.focus || `Día ${i + 1}` })
          .select("id")
          .single()
        if (dayErr) throw new Error(dayErr.message)
        for (let j = 0; j < d.meals.length; j++) {
          const m = d.meals[j]
          const { error: mealErr } = await supabase.from("nutrition_meals").insert({
            day_id: dayRow.id,
            food_id: m.food_id,
            grams: m.grams,
            meal: m.meal,
            order_index: j,
          })
          if (mealErr) throw new Error(mealErr.message)
        }
      }
      return plan as { id: number }
    },
    onSuccess: () => toast.success("Plan de nutrición creado"),
    onError: (e: Error) => toast.error(e.message),
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: nutritionKeys.byUser(vars.targetUserId) })
      qc.invalidateQueries({ queryKey: nutritionKeys.shared })
    },
  })
}

export function useUpdateNutrition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: Record<string, unknown> }) => {
      const supabase = createClient()
      // .select() para recuperar user_id y invalidar byUser exacto (patrón useUpdateFullRoutine)
      const { data, error } = await supabase
        .from("nutrition_plans")
        .update({ ...(dto as Record<string, unknown>), updated_at: new Date().toISOString() } as never)
        .eq("id", id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as unknown as NutritionPlanRow
    },
    onSuccess: (plan) => {
      toast.success(`Plan "${plan.name}" actualizado`)
      qc.invalidateQueries({ queryKey: nutritionKeys.byUser(plan.user_id) })
      qc.invalidateQueries({ queryKey: nutritionKeys.shared })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteNutrition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (plan: NutritionPlanRow) => {
      const supabase = createClient()
      const { error } = await supabase.from("nutrition_plans").delete().eq("id", plan.id)
      if (error) throw new Error(error.message)
    },
    onMutate: async (plan) => {
      // optimistic: quita del cache byUser
      const key = nutritionKeys.byUser(plan.user_id)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<NutritionPlanRow[]>(key)
      qc.setQueryData<NutritionPlanRow[]>(key, (old) => old?.filter((p) => p.id !== plan.id) ?? old)
      return { prev, key }
    },
    onError: (e: Error, _p, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
      toast.error(e.message)
    },
    onSuccess: (_d, plan) => toast.success(`Plan "${plan.name}" eliminado`),
    onSettled: (_d, _e, plan) => {
      qc.invalidateQueries({ queryKey: nutritionKeys.byUser(plan.user_id) })
      qc.invalidateQueries({ queryKey: nutritionKeys.shared })
    },
  })
}
