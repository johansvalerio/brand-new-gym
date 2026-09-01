import type { Tables } from "@/types/database.types"

export const NUTRITION_GOALS = ["volumen", "definicion", "mantenimiento"] as const
export type NutritionGoal = (typeof NUTRITION_GOALS)[number]

export const NUTRITION_MEALS = ["desayuno", "almuerzo", "cena", "snack"] as const
export type NutritionMeal = (typeof NUTRITION_MEALS)[number]

export const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const

export function nutritionGoalLabel(g: string): string {
  switch (g) {
    case "volumen":
      return "Volumen"
    case "definicion":
      return "Definición"
    case "mantenimiento":
      return "Mantenimiento"
    default:
      return g
  }
}

export function dayLabel(dayIndex: number): string {
  return DAY_LABELS[dayIndex - 1] ?? `Día ${dayIndex}`
}

type Viewer = {
  id: string
  role: "admin" | "user" | "coach" | null
  assignedCoachId: string | null
}

type NutritionLike = { created_by: string | null; user_id: string }

export function canEditNutrition(plan: NutritionLike | null | undefined, viewer: Viewer): boolean {
  if (!plan) return false
  if (viewer.role === "admin") return true
  if (viewer.role === "coach") return true
  return plan.created_by === viewer.id && plan.user_id === viewer.id
}

export function canCreateNutritionFor(targetUserId: string, viewer: Viewer, targetCoachId: string | null): boolean {
  if (viewer.role === "admin") return true
  if (viewer.id === targetUserId) return true
  if (viewer.role === "coach" && targetCoachId === viewer.id) return true
  return false
}

export function buildViewer(sessionProfile: Tables<"users"> | null): Viewer {
  return {
    id: sessionProfile?.id ?? "",
    role: sessionProfile?.role ?? null,
    assignedCoachId: sessionProfile?.coach_id ?? null,
  }
}
