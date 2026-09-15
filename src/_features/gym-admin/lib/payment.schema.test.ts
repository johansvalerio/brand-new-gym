import { describe, expect, it } from "vitest"
import { walkInPaymentSchema } from "./payment.schema"

const UUID = "123e4567-e89b-12d3-a456-426614174000"
const valid = { userId: UUID, planId: UUID, method: "sinpe", note: null } as const

describe("walkInPaymentSchema", () => {
  it("acepta pago mostrador válido (sinpe, sin nota)", () => {
    expect(walkInPaymentSchema.safeParse({ ...valid }).success).toBe(true)
  })

  it("acepta efectivo con nota", () => {
    expect(
      walkInPaymentSchema.safeParse({ ...valid, method: "efectivo", note: "Pagó en caja" })
        .success,
    ).toBe(true)
  })

  it("rechaza miembro o plan no-uuid (antes solo se pedía !!planId)", () => {
    expect(walkInPaymentSchema.safeParse({ ...valid, userId: "" }).success).toBe(false)
    expect(walkInPaymentSchema.safeParse({ ...valid, planId: "abc" }).success).toBe(false)
  })

  it("rechaza método fuera de sinpe/efectivo", () => {
    expect(walkInPaymentSchema.safeParse({ ...valid, method: "tarjeta" }).success).toBe(false)
  })

  it("rechaza nota de más de 200 caracteres", () => {
    expect(walkInPaymentSchema.safeParse({ ...valid, note: "x".repeat(201) }).success).toBe(
      false,
    )
  })
})
