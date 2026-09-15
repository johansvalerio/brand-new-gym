import { describe, expect, it } from "vitest"
import { planFormSchema } from "./plan.schema"

const valid = { name: "Mensual", duration_days: 30, price: 15000, is_active: true }

describe("planFormSchema", () => {
  it("acepta un plan válido (diario/semanal/mensual usan este mismo schema)", () => {
    expect(planFormSchema.safeParse({ ...valid }).success).toBe(true)
  })

  it("rechaza nombre vacío", () => {
    expect(planFormSchema.safeParse({ ...valid, name: "" }).success).toBe(false)
  })

  it("rechaza duración menor a 1 día", () => {
    expect(planFormSchema.safeParse({ ...valid, duration_days: 0 }).success).toBe(false)
  })

  it("convierte duración string numérica (coerce)", () => {
    const r = planFormSchema.safeParse({ ...valid, duration_days: "30" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.duration_days).toBe(30)
  })

  it("rechaza precio negativo", () => {
    expect(planFormSchema.safeParse({ ...valid, price: -1 }).success).toBe(false)
  })

  it("exige is_active booleano", () => {
    expect(planFormSchema.safeParse({ ...valid, is_active: "sí" }).success).toBe(false)
  })
})
