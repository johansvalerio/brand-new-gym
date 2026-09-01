"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { useNutritionDispatch, useNutritionState } from "./context"
import { MetadataTab } from "./metadata-tab"
import { StructureTab } from "./structure-tab"
import { nutritionMetadataSchema, nutritionStructureSchema, zodToNutritionErrors } from "../../lib/nutrition.schema"
import type { DayDraft, NutritionFormPayload } from "./nutrition-form-types"
import type { NutritionPlanRow } from "../../hooks/useNutritionPlans"

export function FormBody({
  plan,
  isEdit,
  firstFieldRef,
  onClose,
  onSubmit,
}: {
  plan: NutritionPlanRow | null
  isEdit: boolean
  firstFieldRef: React.RefObject<HTMLInputElement | null>
  onClose: () => void
  onSubmit: (payload: { metadata: NutritionFormPayload; days: DayDraft[] }) => Promise<void>
}) {
  const { step, metadata, days, errors, isSubmitting } = useNutritionState()
  const dispatch = useNutritionDispatch()
  const formRef = useRef<HTMLFormElement>(null)

  const goNext = () => {
    const parsed = nutritionMetadataSchema.safeParse(metadata)
    if (!parsed.success) {
      dispatch({ type: "set_errors", errors: zodToNutritionErrors(parsed.error) })
      return
    }
    dispatch({ type: "set_errors", errors: {} })
    dispatch({ type: "set_step", step: "estructura" })
  }

  const handleSave = async () => {
    const m1 = nutritionMetadataSchema.safeParse(metadata)
    if (!m1.success) {
      dispatch({ type: "set_errors", errors: zodToNutritionErrors(m1.error) })
      dispatch({ type: "set_step", step: "datos" })
      return
    }
    const m2 = nutritionStructureSchema.safeParse({ days: days.map((d) => ({ focus: d.focus, meals: d.meals.map((m) => ({ food_id: m.food_id, grams: m.grams, meal: m.meal })) })) })
    if (!m2.success) {
      dispatch({ type: "set_errors", errors: zodToNutritionErrors(m2.error) })
      return
    }
    dispatch({ type: "set_submitting", v: true })
    try {
      await onSubmit({ metadata, days })
    } finally {
      dispatch({ type: "set_submitting", v: false })
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
          <h2 id="nutrition-form-title" className="font-sans text-sm font-black uppercase tracking-wider">
            {isEdit ? "Editar plan" : "Nuevo plan"} — {step === "datos" ? "Datos" : "Estructura"}
          </h2>
          <span className="font-mono text-xs text-muted-foreground">{step === "datos" ? "1/2" : "2/2"}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === "datos" ? <MetadataTab errors={errors} firstFieldRef={firstFieldRef} /> : <StructureTab errors={errors} />}
        </div>

        <div className="flex justify-between border-t border-border bg-card px-4 py-3 sm:px-6">
          {step === "estructura" ? (
            <Button variant="outline" onClick={() => dispatch({ type: "set_step", step: "datos" })}>
              Atrás
            </Button>
          ) : (
            <span />
          )}
          {step === "datos" ? (
            <Button onClick={goNext}>Siguiente</Button>
          ) : (
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Guardando…" : isEdit ? "Actualizar" : "Crear"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
