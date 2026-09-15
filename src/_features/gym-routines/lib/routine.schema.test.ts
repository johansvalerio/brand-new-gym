import { describe, expect, it } from "vitest"
import {
  fullRoutineSchema,
  routineMetadataSchema,
  routineStructureSchema,
  zodToWizardErrors,
} from "./routine.schema"

const metadata = {
  name: "Fuerza 3x",
  goal: "fuerza",
  days_per_week: 3,
  notes: null,
  is_active: true,
}

const day = (focus = "Pecho") => ({
  focus,
  exercises: [{ exercise_id: 1, sets: 4, reps: "8-10", rest_seconds: 90 }],
})

describe("routineMetadataSchema", () => {
  it("acepta metadata válida", () => {
    expect(routineMetadataSchema.safeParse(metadata).success).toBe(true)
  })

  it("rechaza nombre vacío y objetivo inválido", () => {
    expect(routineMetadataSchema.safeParse({ ...metadata, name: "" }).success).toBe(false)
    expect(routineMetadataSchema.safeParse({ ...metadata, goal: "yoga" }).success).toBe(false)
  })

  it("rechaza días fuera de 1-7", () => {
    expect(routineMetadataSchema.safeParse({ ...metadata, days_per_week: 0 }).success).toBe(
      false,
    )
    expect(routineMetadataSchema.safeParse({ ...metadata, days_per_week: 8 }).success).toBe(
      false,
    )
  })
})

describe("routineStructureSchema", () => {
  it("exige al menos un día y foco no vacío", () => {
    expect(routineStructureSchema.safeParse({ days: [day()] }).success).toBe(true)
    expect(routineStructureSchema.safeParse({ days: [] }).success).toBe(false)
    expect(routineStructureSchema.safeParse({ days: [day("  ")] }).success).toBe(false)
  })

  it("exige ejercicio con series ≥ 1 y reps", () => {
    const bad = { focus: "Pecho", exercises: [{ exercise_id: 0, sets: 0, reps: "", rest_seconds: 0 }] }
    expect(routineStructureSchema.safeParse({ days: [bad] }).success).toBe(false)
  })
})

describe("zodToWizardErrors", () => {
  it("mapea metadata.name → name y days vacío → days", () => {
    const r = fullRoutineSchema.safeParse({
      metadata: { ...metadata, name: "" },
      days: [],
    })
    expect(r.success).toBe(false)
    if (r.success) return
    const m = zodToWizardErrors(r.error)
    expect(m.name).toBeTruthy()
    expect(m.days).toBeTruthy()
  })

  it("mapea days.0.focus → day_0_focus", () => {
    const r = fullRoutineSchema.safeParse({ metadata, days: [day("")] })
    expect(r.success).toBe(false)
    if (r.success) return
    expect(zodToWizardErrors(r.error).day_0_focus).toBeTruthy()
  })
})
