import { describe, expect, it } from "vitest"
import { expenseFormSchema } from "./expense.schema"

const valid = {
  category: "alquiler",
  description: "Renta del local",
  amount: 250000,
  expense_date: "2026-09-01",
}

describe("expenseFormSchema", () => {
  it("acepta un egreso válido", () => {
    expect(expenseFormSchema.safeParse({ ...valid }).success).toBe(true)
  })

  it("convierte monto string numérico (coerce)", () => {
    const r = expenseFormSchema.safeParse({ ...valid, amount: "15000" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.amount).toBe(15000)
  })

  it("rechaza descripción vacía", () => {
    expect(expenseFormSchema.safeParse({ ...valid, description: "  " }).success).toBe(false)
  })

  it("rechaza monto negativo", () => {
    expect(expenseFormSchema.safeParse({ ...valid, amount: -1 }).success).toBe(false)
  })

  it("rechaza categoría fuera del enum", () => {
    expect(expenseFormSchema.safeParse({ ...valid, category: "fiesta" }).success).toBe(false)
  })

  it("rechaza fecha sin formato AAAA-MM-DD", () => {
    expect(expenseFormSchema.safeParse({ ...valid, expense_date: "01/09/2026" }).success).toBe(
      false,
    )
  })
})
