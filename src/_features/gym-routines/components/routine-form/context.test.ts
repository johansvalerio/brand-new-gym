import { describe, expect, it } from "vitest"
import { wizardReducer, type WizardState } from "./context"

const base: WizardState = {
  step: "datos",
  metadata: { name: "", goal: "fuerza", days_per_week: 3, notes: null, is_active: true },
  days: [],
  errors: {},
  isSubmitting: false,
}

describe("wizardReducer (rutinas)", () => {
  it("set_step avanza datos → estructura", () => {
    const s = wizardReducer(base, { type: "set_step", step: "estructura" })
    expect(s.step).toBe("estructura")
    expect(s.metadata).toEqual(base.metadata) // no toca lo demás
  })

  it("set_metadata_field actualiza solo ese campo", () => {
    const s = wizardReducer(base, { type: "set_metadata_field", key: "name", value: "Fuerza 3x" })
    expect(s.metadata.name).toBe("Fuerza 3x")
    expect(s.metadata.goal).toBe("fuerza")
  })

  it("set_days reemplaza con payload plano (sin updaters-función)", () => {
    const days = [
      { id: -1, routine_id: null, day_index: 1, focus: "Pecho", _status: "new" as const, exercises: [] },
    ]
    const s = wizardReducer(base, { type: "set_days", days })
    expect(s.days).toEqual(days)
  })

  it("set_errors + set_submitting del ciclo guardar", () => {
    const s1 = wizardReducer(base, { type: "set_submitting", value: true })
    expect(s1.isSubmitting).toBe(true)
    const s2 = wizardReducer(s1, { type: "set_errors", errors: { name: "Requerido" } })
    expect(s2.errors.name).toBe("Requerido")
    expect(s2.isSubmitting).toBe(true)
  })
})
