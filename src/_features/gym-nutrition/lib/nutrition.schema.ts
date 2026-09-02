import { z } from "zod"

export const nutritionMetadataSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  goal: z.enum(["volumen", "definicion", "mantenimiento"]),
  kcal_target: z.coerce.number().int().min(800).max(6000).nullable(),
  protein_target: z.coerce.number().int().min(30).max(400).nullable(),
  notes: z.string().trim().nullable(),
  is_active: z.boolean(),
})

export const nutritionDaySchema = z.object({
  focus: z.string().trim().min(1, "Foco requerido."),
  meals: z.array(
    z.object({
      food_id: z.number().int().min(1, "Alimento requerido."),
      grams: z.coerce.number().int().min(10, "Mín 10g").max(1000),
      meal: z.enum(["desayuno", "almuerzo", "cena", "snack"]),
    })
  ),
})

export const nutritionStructureSchema = z.object({
  days: z.array(nutritionDaySchema).min(1, "Al menos un día.").max(7),
})

export const fullNutritionSchema = nutritionMetadataSchema.merge(nutritionStructureSchema)

export type NutritionFormPayload = z.infer<typeof nutritionMetadataSchema>

export function zodToNutritionErrors(e: z.ZodError): Record<string, string> {
  const m: Record<string, string> = {}
  for (const i of e.issues) m[i.path.join(".")] = i.message
  return m
}
