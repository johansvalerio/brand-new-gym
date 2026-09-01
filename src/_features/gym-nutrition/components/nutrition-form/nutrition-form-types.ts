export type MealDraft = {
  id: number
  food_id: number
  foodName?: string
  grams: number
  meal: "desayuno" | "almuerzo" | "cena" | "snack"
  _status: "kept" | "new"
}

export type DayDraft = {
  id: number
  plan_id: number | null
  day_index: number
  focus: string
  _status: "kept" | "new"
  meals: MealDraft[]
}

export type NutritionFormPayload = {
  name: string
  goal: "volumen" | "definicion" | "mantenimiento"
  kcal_target: number | null
  protein_target: number | null
  notes: string | null
}

export const emptyMeal = (order: number): MealDraft => ({
  id: -order,
  food_id: 0,
  grams: 100,
  meal: "almuerzo",
  _status: "new",
})

export const emptyDay = (dayIndex: number): DayDraft => ({
  id: -dayIndex,
  plan_id: null,
  day_index: dayIndex,
  focus: "",
  _status: "new",
  meals: [],
})
