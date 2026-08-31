import { z } from "zod"

export const planFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  duration_days: z.coerce.number().int("Entero requerido.").min(1, "Duración ≥ 1 día."),
  price: z.coerce.number().min(0, "Precio ≥ 0."),
  is_active: z.boolean(),
})

export type PlanFormInput = z.infer<typeof planFormSchema>
export function zodToFormErrors(e: z.ZodError): Record<string, string> {
  const m: Record<string, string> = {}
  for (const i of e.issues) m[i.path.join(".")] = i.message
  return m
}
