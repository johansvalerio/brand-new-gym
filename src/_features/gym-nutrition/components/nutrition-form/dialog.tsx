"use client"

import { useEffect } from "react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import { NutritionFormShell } from "./shell"
import type { NutritionPlanRow } from "../../hooks/useNutritionPlans"

export function NutritionFormDialog({
  open,
  plan,
  onClose,
  onSubmit,
}: {
  open: boolean
  plan?: NutritionPlanRow | null
  onClose: () => void
  onSubmit: (payload: { metadata: import("./nutrition-form-types").NutritionFormPayload; days: import("./nutrition-form-types").DayDraft[] }) => Promise<void>
}) {
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return <NutritionFormShell key={plan?.id ?? "new"} plan={plan ?? null} onClose={onClose} onSubmit={onSubmit} />
}
