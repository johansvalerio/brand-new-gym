import { describe, expect, it } from "vitest"
import { userFormSchema } from "./user.schema"

const valid = {
  first_name: "Juan",
  last_name: "Pérez",
  email: "juan@gym.cr",
  phone: null,
  avatar: null,
  role: "user",
  coach_id: null,
  membership_status: "active",
  gender: null,
} as const

describe("userFormSchema", () => {
  it("acepta un miembro válido mínimo", () => {
    expect(userFormSchema.safeParse({ ...valid }).success).toBe(true)
  })

  it("rechaza nombre vacío", () => {
    const r = userFormSchema.safeParse({ ...valid, first_name: "  " })
    expect(r.success).toBe(false)
  })

  it("rechaza email inválido", () => {
    const r = userFormSchema.safeParse({ ...valid, email: "no-es-email" })
    expect(r.success).toBe(false)
  })

  it("rechaza rol fuera del enum", () => {
    const r = userFormSchema.safeParse({ ...valid, role: "superadmin" })
    expect(r.success).toBe(false)
  })

  it("rechaza estado de membresía inválido", () => {
    const r = userFormSchema.safeParse({ ...valid, membership_status: "suspendido" })
    expect(r.success).toBe(false)
  })

  it("acepta avatar vacío y rechaza URL inválida", () => {
    expect(userFormSchema.safeParse({ ...valid, avatar: "" }).success).toBe(true)
    expect(
      userFormSchema.safeParse({ ...valid, avatar: "https://img.com/a.png" }).success,
    ).toBe(true)
    expect(userFormSchema.safeParse({ ...valid, avatar: "no-url" }).success).toBe(false)
  })

  it("acepta dataURL del AvatarPicker y rechaza data no-imagen", () => {
    expect(
      userFormSchema.safeParse({ ...valid, avatar: "data:image/jpeg;base64,/9j/abc" })
        .success,
    ).toBe(true)
    expect(
      userFormSchema.safeParse({ ...valid, avatar: "data:text/plain;base64,abc" })
        .success,
    ).toBe(false)
  })

  it("acepta coach y géneros válidos", () => {
    expect(
      userFormSchema.safeParse({ ...valid, role: "coach", gender: "femenino" }).success,
    ).toBe(true)
    expect(userFormSchema.safeParse({ ...valid, gender: "x" }).success).toBe(false)
  })
})
