import { z } from "zod"
import { EXPENSE_CATEGORIES } from "./expense.schema"

export const recurringIncomeFormSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, "Selecciona una categoría."),
  description: z
    .string()
    .trim()
    .min(1, "El concepto es obligatorio.")
    .max(200, "Máx 200 caracteres."),
  amount: z.coerce.number().min(0, "Monto ≥ 0."),
  is_active: z.boolean(),
})

export type RecurringIncomeFormInput = z.infer<typeof recurringIncomeFormSchema>

export function zodToFormErrors(e: z.ZodError): Record<string, string> {
  const m: Record<string, string> = {}
  for (const i of e.issues) m[i.path.join(".")] = i.message
  return m
}
