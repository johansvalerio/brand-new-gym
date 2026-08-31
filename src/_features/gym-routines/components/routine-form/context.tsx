"use client"

import { createContext, useContext, useReducer } from "react"
import type { DayDraft, RoutineFormPayload, Step } from "../routine-form-types"

/**
 * Estado del wizard de rutina con useReducer + Context
 * (patrón oficial react.dev "Scaling Up with Reducer and Context").
 * Contexts separados (state / dispatch) para que los consumers que solo
 * disparan acciones no re-rendericen cuando cambia el state.
 */

export type WizardState = {
  step: Step
  metadata: RoutineFormPayload
  days: DayDraft[]
  errors: Record<string, string>
  isSubmitting: boolean
}

export type WizardAction =
  | { type: "set_step"; step: Step }
  | { type: "set_metadata_field"; key: keyof RoutineFormPayload; value: RoutineFormPayload[keyof RoutineFormPayload] }
  | { type: "set_days"; days: DayDraft[] }
  | { type: "set_errors"; errors: Record<string, string> }
  | { type: "set_submitting"; value: boolean }

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "set_step":
      return { ...state, step: action.step }
    case "set_metadata_field":
      return { ...state, metadata: { ...state.metadata, [action.key]: action.value } }
    case "set_days":
      return { ...state, days: action.days }
    case "set_errors":
      return { ...state, errors: action.errors }
    case "set_submitting":
      return { ...state, isSubmitting: action.value }
    default:
      return state
  }
}

const WizardStateCtx = createContext<WizardState | null>(null)
const WizardDispatchCtx = createContext<React.Dispatch<WizardAction> | null>(null)

export function RoutineFormProvider({
  initialMetadata,
  initialDays,
  children,
}: {
  initialMetadata: () => RoutineFormPayload
  initialDays: () => DayDraft[]
  children: React.ReactNode
}) {
  const [state, dispatch] = useReducer(wizardReducer, undefined, () => ({
    step: "datos" as Step,
    metadata: initialMetadata(),
    days: initialDays(),
    errors: {},
    isSubmitting: false,
  }))

  return (
    <WizardStateCtx value={state}>
      <WizardDispatchCtx value={dispatch}>{children}</WizardDispatchCtx>
    </WizardStateCtx>
  )
}

export function useWizardState(): WizardState {
  const ctx = useContext(WizardStateCtx)
  if (!ctx) throw new Error("useWizardState debe usarse dentro de RoutineFormProvider")
  return ctx
}

export function useWizardDispatch(): React.Dispatch<WizardAction> {
  const ctx = useContext(WizardDispatchCtx)
  if (!ctx) throw new Error("useWizardDispatch debe usarse dentro de RoutineFormProvider")
  return ctx
}
