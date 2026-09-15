import { z } from "zod"

export const userFormSchema = z.object({
  first_name: z.string().trim().min(1, "El nombre es obligatorio."),
  last_name: z.string().trim().nullable(),
  email: z.string().trim().email("Ingresa un email válido."),
  phone: z.string().trim().nullable(),
  // https (OAuth/link legacy) o dataURL del AvatarPicker (foto del dispositivo).
  // Regex propia: z.string().url() acepta data:text/plain y no sirve aquí.
  avatar: z
    .string()
    .trim()
    .refine(
      (v) =>
        v === "" || /^https?:\/\/.+/.test(v) || v.startsWith("data:image/"),
      { message: "URL inválida." },
    )
    .nullable()
    .or(z.literal("")),
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
