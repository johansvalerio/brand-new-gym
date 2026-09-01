import type { WorkoutWithSets, WorkoutSetWithExercise } from "./useWorkoutHistory"
import type { SetDraft } from "./useWorkoutSession"

export type PR = {
  exerciseId: number
  exerciseName: string
  newBest: number
  previousBest: number
  isFirstTime: boolean
}

/**
 * Detecta récords personales (peso máximo histórico por ejercicio) en la sesión
 * recién guardada, comparándola con el historial previo. Puro y testeable.
 *
 * Reglas:
 *  - Solo series NO-warmup y con weight > 0 cuentan (defensa adicional a la RPC).
 *  - Una serie rompe récord solo si su peso > mejor peso histórico ESTRICTAMENTE.
 *    Empates no cuentan (alzar lo mismo que tu récord no es récord nuevo).
 *  - Si no hay historial previo para un ejercicio, marcamos `isFirstTime = true`
 *    y celebramos igual (primera marca personal).
 */
export function computePRs(
  justSaved: SetDraft[],
  previousWorkouts: WorkoutWithSets[],
  resolveExerciseName: (id: number) => string,
): PR[] {
  const safeSets = justSaved.filter((s) => !s.is_warmup && s.weight > 0)
  if (safeSets.length === 0) return []

  // Mejor peso histórico por ejercicio (no-warmup).
  const previousBestByExercise = new Map<number, number>()
  for (const w of previousWorkouts) {
    for (const set of w.set_logs as WorkoutSetWithExercise[]) {
      if (set.is_warmup) continue
      if (set.weight <= 0) continue
      const cur = previousBestByExercise.get(set.exercise_id) ?? 0
      if (set.weight > cur) previousBestByExercise.set(set.exercise_id, set.weight)
    }
  }

  // Mejor peso en la sesión actual por ejercicio.
  const newBestByExercise = new Map<number, number>()
  for (const set of safeSets) {
    const cur = newBestByExercise.get(set.exercise_id) ?? 0
    if (set.weight > cur) newBestByExercise.set(set.exercise_id, set.weight)
  }

  const prs: PR[] = []
  for (const [exerciseId, newBest] of newBestByExercise) {
    const previousBest = previousBestByExercise.get(exerciseId) ?? 0
    if (previousBest === 0) {
      // Primera vez que toca este ejercicio → celebración de "primera marca".
      prs.push({
        exerciseId,
        exerciseName: resolveExerciseName(exerciseId),
        newBest,
        previousBest: 0,
        isFirstTime: true,
      })
      continue
    }
    if (newBest > previousBest) {
      prs.push({
        exerciseId,
        exerciseName: resolveExerciseName(exerciseId),
        newBest,
        previousBest,
        isFirstTime: false,
      })
    }
  }

  return prs
}
