"use client"

import { useRef } from "react"
import type { DayDraft, NutritionFormPayload } from "./nutrition-form-types"
import { emptyDay } from "./nutrition-form-types"
import { ShellChrome } from "./chrome"
import { NutritionFormProvider } from "./context"
import type { NutritionPlanRow } from "../../hooks/useNutritionPlans"

const EMPTY_META: NutritionFormPayload = {
  name: "",
  goal: "mantenimiento",
  kcal_target: null,
  protein_target: null,
  notes: null,
}

const createEmptyDays = (): DayDraft[] => [emptyDay(1), emptyDay(2), emptyDay(3)]

export function NutritionFormShell({
  plan,
  onClose,
  onSubmit,
}: {
  plan: NutritionPlanRow | null
  onClose: () => void
  onSubmit: (payload: { metadata: NutritionFormPayload; days: DayDraft[] }) => Promise<void>
}) {
  const isEdit = Boolean(plan)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  return (
    <NutritionFormProvider
      initialMetadata={() =>
        plan
          ? {
              name: plan.name,
              goal: plan.goal as NutritionFormPayload["goal"],
              kcal_target: plan.kcal_target,
              protein_target: plan.protein_target,
              notes: plan.notes,
            }
          : EMPTY_META
      }
      initialDays={() => createEmptyDays()}
    >
      <ShellChrome plan={plan} isEdit={isEdit} firstFieldRef={firstFieldRef} onClose={onClose} onSubmit={onSubmit} />
    </NutritionFormProvider>
  )
}
