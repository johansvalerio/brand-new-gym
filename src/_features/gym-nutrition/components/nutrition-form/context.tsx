"use client"

import { createContext, useContext, useReducer } from "react"
import type { DayDraft, NutritionFormPayload } from "./nutrition-form-types"

type Step = "datos" | "estructura"

type State = {
  step: Step
  metadata: NutritionFormPayload
  days: DayDraft[]
  errors: Record<string, string>
  isSubmitting: boolean
}

type Action =
  | { type: "set_step"; step: Step }
  | { type: "set_metadata_field"; field: keyof NutritionFormPayload; value: unknown }
  | { type: "set_days"; days: DayDraft[] }
  | { type: "set_errors"; errors: Record<string, string> }
  | { type: "set_submitting"; v: boolean }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set_step":
      return { ...state, step: action.step }
    case "set_metadata_field":
      return { ...state, metadata: { ...state.metadata, [action.field]: action.value } }
    case "set_days":
      return { ...state, days: action.days }
    case "set_errors":
      return { ...state, errors: action.errors }
    case "set_submitting":
      return { ...state, isSubmitting: action.v }
    default:
      return state
  }
}

const StateCtx = createContext<State | null>(null)
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null)

export function NutritionFormProvider({
  initialMetadata,
  initialDays,
  children,
}: {
  initialMetadata: () => NutritionFormPayload
  initialDays: () => DayDraft[]
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    step: "datos" as Step,
    metadata: initialMetadata(),
    days: initialDays(),
    errors: {},
    isSubmitting: false,
  }))
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  )
}

export function useNutritionState() {
  const v = useContext(StateCtx)
  if (!v) throw new Error("useNutritionState must be inside NutritionFormProvider")
  return v
}

export function useNutritionDispatch() {
  const v = useContext(DispatchCtx)
  if (!v) throw new Error("useNutritionDispatch must be inside NutritionFormProvider")
  return v
}
