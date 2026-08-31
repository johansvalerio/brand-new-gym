import { z } from "zod"

export const userFormSchema = z.object({
  first_name: z.string().trim().min(1, "El nombre es obligatorio."),
  last_name: z.string().trim().nullable(),
  email: z.string().trim().email("Ingresa un email válido."),
  phone: z.string().trim().nullable(),
  avatar: z.string().trim().url("URL inválida.").nullable().or(z.literal("")),
  role: z.enum(["admin", "user", "coach"]),
  coach_id: z.string().nullable(),
  membership_status: z.enum(["active", "inactive", "pending", "expired"]),
  gender: z.enum(["masculino", "femenino", "otro"]).nullable(),
})

export type UserFormInput = z.infer<typeof userFormSchema>

export function zodToFormErrors(error: z.ZodError): Record<string, string> {
  const next: Record<string, string> = {}
  for (const i of error.issues) next[i.path.join(".")] = i.message
  return next
}
