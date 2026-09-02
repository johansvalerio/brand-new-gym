"use client"

import { useEffect } from "react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import { NutritionFormShell } from "./shell"
import type { NutritionPlanRow } from "../../hooks/useNutritionPlans"

interface NutritionFormDialogProps {
  open: boolean
  plan?: NutritionPlanRow | null
  targetUserId: string
  onClose: () => void
  onSubmit: (payload: { metadata: import("./nutrition-form-types").NutritionFormPayload; days: import("./nutrition-form-types").DayDraft[] }) => Promise<void>
}

/**
 * Wizard de plan de nutrición (2 pasos: datos → estructura).
 * Sin <form> nativo: todo botón es type="button" con handler propio.
 * Sin setState en effects: el `key` remonta el body.
 */
export function NutritionFormDialog(props: NutritionFormDialogProps) {
  const { open, plan, targetUserId, onClose, onSubmit } = props
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

  return (
    <NutritionFormShell
      key={plan?.id ?? "new"}
      plan={plan ?? null}
      targetUserId={targetUserId}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
