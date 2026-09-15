import { describe, expect, it } from "vitest"
import { recurringIncomeFormSchema } from "./recurring-income.schema"

const valid = {
  category: "alquiler",
  description: "Alquiler del salón para eventos",
  amount: 80000,
  is_active: true,
}

describe("recurringIncomeFormSchema", () => {
  it("acepta una renta fija válida", () => {
    expect(recurringIncomeFormSchema.safeParse({ ...valid }).success).toBe(true)
  })

  it("convierte monto string numérico (coerce)", () => {
    const r = recurringIncomeFormSchema.safeParse({ ...valid, amount: "80000" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.amount).toBe(80000)
  })

  it("rechaza concepto vacío", () => {
    expect(recurringIncomeFormSchema.safeParse({ ...valid, description: "" }).success).toBe(false)
  })

  it("rechaza monto negativo", () => {
    expect(recurringIncomeFormSchema.safeParse({ ...valid, amount: -5 }).success).toBe(false)
  })

  it("exige is_active booleano", () => {
    expect(recurringIncomeFormSchema.safeParse({ ...valid, is_active: "sí" }).success).toBe(false)
  })
})
