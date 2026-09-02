"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import type { NutritionPlanRow } from "../../hooks/useNutritionPlans"
import { initialDaysFromPlan } from "./nutrition-form-data"
import { FormBody } from "./form-body"
import { useNutritionDispatch } from "./context"
import type { DayDraft, NutritionFormPayload } from "./nutrition-form-types"

interface ShellChromeProps {
  plan: NutritionPlanRow | null
  targetUserId: string
  isEdit: boolean
  firstFieldRef: React.RefObject<HTMLInputElement | null>
  onClose: () => void
  onSubmit: (payload: { metadata: NutritionFormPayload; days: DayDraft[] }) => Promise<void>
}

export function ShellChrome({
  plan,
  targetUserId,
  isEdit,
  firstFieldRef,
  onClose,
  onSubmit,
}: ShellChromeProps) {
  const dispatch = useNutritionDispatch()
  // Sin setState sincrono en el effect: lazy init para el caso !plan (crear), effect solo para editar.
  const [hydratedDays, setHydratedDays] = useState(!plan)

  useEffect(() => {
    if (!plan) return // ya hidratado por lazy init
    dispatch({ type: "set_days", days: initialDaysFromPlan(plan) })
    const t = setTimeout(() => setHydratedDays(true), 0)
    return () => clearTimeout(t)
  }, [plan, dispatch])

  if (plan && !hydratedDays) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nutrition-form-title"
      >
        <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 flex min-w-0 max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando plan…
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FormBody
      plan={plan}
      targetUserId={targetUserId}
      isEdit={isEdit}
      firstFieldRef={firstFieldRef}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
