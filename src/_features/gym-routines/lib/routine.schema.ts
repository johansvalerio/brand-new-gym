import { z } from "zod"
import { ROUTINE_GOALS } from "../hooks/routine-helpers"

export const routineMetadataSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  goal: z.enum(ROUTINE_GOALS as unknown as [string, ...string[]], {
    message: "Objetivo inválido.",
  }),
  days_per_week: z.number().min(1, "Mínimo 1 día.").max(7, "Máximo 7 días."),
  notes: z.string().nullable(),
  is_active: z.boolean(),
})

export const exerciseDraftSchema = z.object({
  exercise_id: z.number().min(1, "Elige un ejercicio."),
  sets: z.number().min(1, "Mínimo 1 serie."),
  reps: z.string().trim().min(1, "Reps requerido."),
  rest_seconds: z.number().min(0),
})

export const dayDraftSchema = z.object({
  focus: z.string().trim().min(1, "Foco requerido."),
  exercises: z.array(exerciseDraftSchema),
})

export const routineStructureSchema = z.object({
  days: z.array(dayDraftSchema).min(1, "Agrega al menos un día de entrenamiento."),
})

export const fullRoutineSchema = z.object({
  metadata: routineMetadataSchema,
  days: z.array(dayDraftSchema).min(1, "Agrega al menos un día de entrenamiento."),
})

export type FullRoutineInput = z.infer<typeof fullRoutineSchema>

/**
 * Convierte errores Zod a Record<string,string> compatible con el wizard actual
 * (errors.name, errors.days_per_week, errors[`day_${i}_focus`], errors.days)
 */
export function zodToWizardErrors(error: z.ZodError): Record<string, string> {
  const next: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join(".")
    // metadata.name -> name, metadata.days_per_week -> days_per_week
    if (path.startsWith("metadata.")) {
      next[path.replace("metadata.", "")] = issue.message
      continue
    }
    if (path === "days") {
      next.days = issue.message
      continue
    }
    // days.0.focus -> day_0_focus
    const m = path.match(/^days\.(\d+)\.focus$/)
    if (m) {
      next[`day_${m[1]}_focus`] = issue.message
      continue
    }
    // days.0.exercises.1.exercise_id -> day_0_ex_1_exercise
    const ex = path.match(/^days\.(\d+)\.exercises\.(\d+)\./)
    if (ex) {
      next[`day_${ex[1]}_ex_${ex[2]}`] = issue.message
      continue
    }
    next[path] = issue.message
  }
  return next
}
