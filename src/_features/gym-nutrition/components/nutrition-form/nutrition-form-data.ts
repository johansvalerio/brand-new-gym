import type { NutritionPlanRow } from "../../hooks/useNutritionPlans"
import type { DayDraft } from "./nutrition-form-types"

// hydrateDaysFromPlan no se usa (el wizard hidrata desde el prop plan) — remover si aparece de nuevo.

export function initialDaysFromPlan(plan: NutritionPlanRow | null): DayDraft[] {
  if (!plan) return []
  return plan.nutrition_days
    .slice()
    .sort((a, b) => a.day_index - b.day_index)
    .map((d) => ({
      id: d.id,
      plan_id: (d as unknown as { plan_id: number }).plan_id ?? null,
      day_index: d.day_index,
      focus: d.focus,
      _status: "kept" as const,
      meals: d.nutrition_meals
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((m) => ({
          id: m.id,
          food_id: m.food_id,
          grams: m.grams,
          meal: m.meal as DayDraft["meals"][number]["meal"],
          _status: "kept" as const,
        })),
    }))
}
