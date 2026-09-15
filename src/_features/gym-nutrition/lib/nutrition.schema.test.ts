import { describe, expect, it } from "vitest"
import { fullNutritionSchema, nutritionMetadataSchema, nutritionStructureSchema } from "./nutrition.schema"

const metadata = {
  name: "Volumen limpio",
  goal: "volumen",
  kcal_target: 2800,
  protein_target: 160,
  notes: null,
  is_active: true,
}

const meal = { food_id: 1, grams: 150, meal: "almuerzo" }
const day = (focus = "Lunes") => ({ focus, meals: [{ ...meal }] })

describe("nutritionMetadataSchema", () => {
  it("acepta metadata válida", () => {
    expect(nutritionMetadataSchema.safeParse(metadata).success).toBe(true)
  })

  it("rechaza objetivo fuera del enum", () => {
    expect(nutritionMetadataSchema.safeParse({ ...metadata, goal: "keto" }).success).toBe(false)
  })

  it("rechaza kcal fuera de 800-6000 y acepta null", () => {
    expect(nutritionMetadataSchema.safeParse({ ...metadata, kcal_target: 500 }).success).toBe(
      false,
    )
    expect(nutritionMetadataSchema.safeParse({ ...metadata, kcal_target: 7000 }).success).toBe(
      false,
    )
    expect(nutritionMetadataSchema.safeParse({ ...metadata, kcal_target: null }).success).toBe(
      true,
    )
  })

  it("rechaza proteína fuera de 30-400", () => {
    expect(nutritionMetadataSchema.safeParse({ ...metadata, protein_target: 10 }).success).toBe(
      false,
    )
  })
})

describe("nutritionStructureSchema", () => {
  it("exige 1-7 días y foco no vacío", () => {
    expect(nutritionStructureSchema.safeParse({ days: [day()] }).success).toBe(true)
    expect(nutritionStructureSchema.safeParse({ days: [] }).success).toBe(false)
    expect(
      nutritionStructureSchema.safeParse({ days: Array.from({ length: 8 }, () => day()) })
        .success,
    ).toBe(false)
  })

  it("rechaza comida con gramos < 10 o slot inválido", () => {
    const badGrams = { focus: "Lunes", meals: [{ ...meal, grams: 5 }] }
    const badSlot = { focus: "Lunes", meals: [{ ...meal, meal: "brunch" }] }
    expect(nutritionStructureSchema.safeParse({ days: [badGrams] }).success).toBe(false)
    expect(nutritionStructureSchema.safeParse({ days: [badSlot] }).success).toBe(false)
  })
})

describe("fullNutritionSchema", () => {
  it("acepta plan completo válido", () => {
    expect(fullNutritionSchema.safeParse({ ...metadata, days: [day()] }).success).toBe(true)
  })
})
