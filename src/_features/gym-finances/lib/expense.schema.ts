import { z } from "zod"

export const EXPENSE_CATEGORIES = [
  "alquiler",
  "salarios",
  "servicios",
  "mantenimiento",
  "limpieza",
  "marketing",
  "otros",
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  alquiler: "Alquiler",
  salarios: "Salarios",
  servicios: "Servicios",
  mantenimiento: "Mantenimiento",
  limpieza: "Limpieza",
  marketing: "Marketing",
  otros: "Otros",
}

export const expenseFormSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, "Selecciona una categoría."),
  description: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria.")
    .max(200, "Máx 200 caracteres."),
  amount: z.coerce.number().min(0, "Monto ≥ 0."),
  expense_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (AAAA-MM-DD)."),
})

export type ExpenseFormInput = z.infer<typeof expenseFormSchema>

export function zodToFormErrors(e: z.ZodError): Record<string, string> {
  const m: Record<string, string> = {}
  for (const i of e.issues) m[i.path.join(".")] = i.message
  return m
}
