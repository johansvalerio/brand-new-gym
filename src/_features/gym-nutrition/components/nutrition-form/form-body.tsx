"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { Apple, ArrowLeft, ArrowRight, Loader2, X } from "lucide-react"
import { useNutritionDispatch, useNutritionState } from "./context"
import { MetadataTab } from "./metadata-tab"
import { StructureTab } from "./structure-tab"
import { StepPill } from "./step-pill"
import { nutritionMetadataSchema, nutritionStructureSchema, zodToNutritionErrors } from "../../lib/nutrition.schema"
import type { DayDraft, NutritionFormPayload } from "./nutrition-form-types"
import type { NutritionPlanRow } from "../../hooks/useNutritionPlans"

interface FormBodyProps {
  plan: NutritionPlanRow | null
  targetUserId: string
  isEdit: boolean
  firstFieldRef: React.RefObject<HTMLInputElement | null>
  onClose: () => void
  onSubmit: (payload: { metadata: NutritionFormPayload; days: DayDraft[] }) => Promise<void>
}

export function FormBody({
  plan,
  targetUserId,
  isEdit,
  firstFieldRef,
  onClose,
  onSubmit,
}: FormBodyProps) {
  const { step, metadata, days, errors, isSubmitting } = useNutritionState()
  const dispatch = useNutritionDispatch()

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateDatos = (): Record<string, string> => {
    const parsed = nutritionMetadataSchema.safeParse(metadata)
    if (parsed.success) return {}
    return zodToNutritionErrors(parsed.error)
  }
  const validateEstructura = (): Record<string, string> => {
    const parsed = nutritionStructureSchema.safeParse({ days: days.map((d) => ({ focus: d.focus, meals: d.meals.map((m) => ({ food_id: m.food_id, grams: m.grams, meal: m.meal })) })) })
    if (parsed.success) return {}
    return zodToNutritionErrors(parsed.error)
  }
  const errorsDatos = validateDatos()
  const errorsEstructura = validateEstructura()

  const goNext = () => {
    const errs = validateDatos()
    if (Object.keys(errs).length > 0) {
      dispatch({ type: "set_errors", errors: errs })
      return
    }
    dispatch({ type: "set_errors", errors: {} })
    dispatch({ type: "set_step", step: "estructura" })
  }
  const goBack = () => {
    dispatch({ type: "set_errors", errors: {} })
    dispatch({ type: "set_step", step: "datos" })
  }
  const handleSave = async () => {
    const errsDatos = validateDatos()
    const errsEstructura = validateEstructura()
    if (Object.keys(errsDatos).length > 0 || Object.keys(errsEstructura).length > 0) {
      dispatch({ type: "set_errors", errors: { ...errsDatos, ...errsEstructura } })
      if (Object.keys(errsDatos).length > 0) dispatch({ type: "set_step", step: "datos" })
      toast.error("Hay errores en el formulario", { description: "Revisa los campos marcados." })
      return
    }
    dispatch({ type: "set_submitting", v: true })
    try {
      await onSubmit({
        metadata: {
          name: metadata.name.trim(),
          goal: metadata.goal,
          kcal_target: metadata.kcal_target,
          protein_target: metadata.protein_target,
          notes: metadata.notes?.trim() || null,
          is_active: metadata.is_active,
        },
        days,
      })
    } finally {
      dispatch({ type: "set_submitting", v: false })
    }
  }

  const liveErrors = step === "datos" ? errorsDatos : { ...errorsDatos, ...errorsEstructura }
  const currentErrors = Object.keys(errors).length > 0 ? errors : liveErrors

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="nutrition-form-title">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 flex min-w-0 max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Apple className="h-5 w-5" />
            </span>
            <div>
              <h2 id="nutrition-form-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                {isEdit ? "Editar plan" : "Nuevo plan"}
              </h2>
              <p className="text-xs text-muted-foreground">{isEdit ? `ID #${plan?.id}` : `Para miembro #${targetUserId.slice(0, 8)}`}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-3 py-2.5 sm:px-6">
          <StepPill label="1 · Datos básicos" active={step === "datos"} />
          <span className="h-px flex-1 bg-border" />
          <StepPill label="2 · Estructura" active={step === "estructura"} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5">
          {step === "datos" ? (
            <MetadataTab errors={currentErrors} firstFieldRef={firstFieldRef} onEnter={goNext} />
          ) : (
            <StructureTab errors={currentErrors} />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border bg-secondary/30 px-4 py-3 sm:px-6 sm:py-4">
          {step === "datos" ? (
            <>
              <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">
                Cancelar
              </button>
              <button type="button" onClick={goNext} className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90">
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={goBack} disabled={isSubmitting} className="flex cursor-pointer items-center gap-2 rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </button>
              <button type="button" onClick={() => void handleSave()} disabled={isSubmitting} className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando…
                  </>
                ) : isEdit ? (
                  "Guardar cambios"
                ) : (
                  "Crear plan"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
