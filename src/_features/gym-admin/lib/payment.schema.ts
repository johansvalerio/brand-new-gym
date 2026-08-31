import { z } from "zod"

export const walkInPaymentSchema = z.object({
  userId: z.string().uuid("Selecciona un miembro válido."),
  planId: z.string().uuid("Selecciona un plan."),
  method: z.enum(["sinpe", "efectivo"]),
  note: z.string().trim().max(200, "Máx 200 caracteres.").nullable(),
})

export type WalkInPaymentInput = z.infer<typeof walkInPaymentSchema>
export function zodToFormErrors(e: z.ZodError): Record<string, string> {
  const m: Record<string, string> = {}
  for (const i of e.issues) m[i.path.join(".")] = i.message
  return m
}
