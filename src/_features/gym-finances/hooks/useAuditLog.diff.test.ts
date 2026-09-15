import { describe, expect, it } from "vitest"
import { diffAudit } from "./useAuditLog"

describe("diffAudit", () => {
  it("devuelve vacío si falta alguno de los lados", () => {
    expect(diffAudit(null, { a: 1 })).toEqual([])
    expect(diffAudit({ a: 1 }, null)).toEqual([])
  })

  it("detecta solo los campos que cambiaron", () => {
    const changes = diffAudit(
      { name: "Plan Viejo", price: 100, gym_id: "g1" },
      { name: "Plan Nuevo", price: 100, gym_id: "g1" },
    )
    expect(changes).toEqual([{ field: "name", before: "Plan Viejo", after: "Plan Nuevo" }])
  })

  it("oculta columnas técnicas y marca nulos como —", () => {
    const changes = diffAudit(
      { id: "1", created_at: "2026-09-01", note: null } as Record<string, unknown>,
      { id: "1", created_at: "2026-09-01", note: "hola" } as Record<string, unknown>,
    )
    expect(changes).toEqual([{ field: "note", before: "—", after: "hola" }])
  })
})
