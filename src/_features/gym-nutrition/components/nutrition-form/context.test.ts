import { describe, expect, it } from "vitest"
import { nutritionFormReducer } from "./context"

const base = {
  step: "datos" as const,
  metadata: {
    name: "",
    goal: "volumen" as const,
    kcal_target: null,
    protein_target: null,
    notes: null,
    is_active: true,
  },
  days: [],
  errors: {},
  isSubmitting: false,
}

describe("nutritionFormReducer (mirror de rutinas)", () => {
  it("set_step avanza datos → estructura", () => {
    expect(nutritionFormReducer(base, { type: "set_step", step: "estructura" }).step).toBe(
      "estructura",
    )
  })

  it("set_metadata_field actualiza macros sin tocar lo demás", () => {
    const s = nutritionFormReducer(base, {
      type: "set_metadata_field",
      field: "kcal_target",
      value: 2800,
    })
    expect(s.metadata.kcal_target).toBe(2800)
    expect(s.metadata.goal).toBe("volumen")
  })

  it("set_days reemplaza días", () => {
    const days = [
      { id: -1, plan_id: null, day_index: 1, focus: "Lunes", _status: "new" as const, meals: [] },
    ]
    expect(nutritionFormReducer(base, { type: "set_days", days }).days).toEqual(days)
  })

  it("acción desconocida devuelve el mismo estado", () => {
    expect(
      nutritionFormReducer(base, { type: "set_submitting", v: false }),
    ).toEqual({ ...base, isSubmitting: false })
  })
})
