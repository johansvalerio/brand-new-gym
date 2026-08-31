"use client"

// Barrel para compatibilidad: el wizard se splitteó en routine-form/ (MASTER.md granularidad)
// Este archivo re-exporta la API pública para que imports existentes no rompan.
// Nuevo código debe importar desde "./routine-form/*"
export { RoutineFormDialog } from "./routine-form/dialog"
export type { DayDraft, ExerciseDraft, RoutineFormPayload, Step } from "./routine-form-types"
