import { z } from "zod"

export const productFormSchema = z.object({
  product_name: z.string().trim().min(1, "El nombre es obligatorio."),
  product_description: z.string().trim().nullable(),
  product_price: z.coerce.number().min(0, "Precio ≥ 0."),
  product_stock: z.coerce.number().int("Entero requerido.").min(0, "Stock ≥ 0."),
  product_image: z.string().trim().url("URL inválida.").nullable().or(z.literal("")),
  category_id: z.string().nullable(),
})

export type ProductFormInput = z.infer<typeof productFormSchema>
export function zodToFormErrors(e: z.ZodError): Record<string, string> {
  const m: Record<string, string> = {}
  for (const i of e.issues) m[i.path.join(".")] = i.message
  return m
}
