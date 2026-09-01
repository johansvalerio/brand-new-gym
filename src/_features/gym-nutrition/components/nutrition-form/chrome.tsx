"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import type { NutritionPlanRow } from "../../hooks/useNutritionPlans"
import { initialDaysFromPlan } from "./nutrition-form-data"
import { FormBody } from "./form-body"
import { useNutritionDispatch } from "./context"
import type { DayDraft, NutritionFormPayload } from "./nutrition-form-types"

export function ShellChrome({
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
  const dispatch = useNutritionDispatch()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (!plan) {
      setHydrated(true)
      return
    }
    const days = initialDaysFromPlan(plan)
    dispatch({ type: "set_days", days })
    setHydrated(true)
  }, [plan, dispatch])

  if (plan && !hydrated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 flex min-h-[200px] w-full max-w-5xl items-center justify-center rounded-lg border border-border bg-card">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando plan…
          </span>
        </div>
      </div>
    )
  }

  return <FormBody plan={plan} isEdit={isEdit} firstFieldRef={firstFieldRef} onClose={onClose} onSubmit={onSubmit} />
}
