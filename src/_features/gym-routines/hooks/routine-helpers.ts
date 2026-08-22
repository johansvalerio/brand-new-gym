import type { Tables } from "@/types/database.types"

export const ROUTINE_GOALS = [
  "fuerza",
  "hipertrofia",
  "resistencia",
  "perdida_de_grasa",
  "movilidad",
] as const

export type RoutineGoal = (typeof ROUTINE_GOALS)[number]

export const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const

export type RoutineRow = Tables<"routines">

export function goalLabel(goal: string): string {
  switch (goal) {
    case "fuerza":
      return "Fuerza"
    case "hipertrofia":
      return "Hipertrofia"
    case "resistencia":
      return "Resistencia"
    case "perdida_de_grasa":
      return "Pérdida de grasa"
    case "movilidad":
      return "Movilidad"
    default:
      return goal
  }
}

export function dayLabel(dayIndex: number): string {
  return DAY_NAMES[dayIndex - 1] ?? `Día ${dayIndex}`
}

type Viewer = {
  id: string
  role: "admin" | "user" | "coach" | null
  assignedCoachId: string | null
}

type RoutineLike = Pick<RoutineRow, "created_by" | "user_id">

/**
 * ¿El viewer puede crear/editar/eliminar esta rutina?
 * Alineado con la RLS real: admin siempre, COACH sobre cualquier rutina
 * (la RLS permite is_coach() sin restricción de asignación), usuario solo
 * sobre sus propias rutinas.
 */
export function canEditRoutine(
  routine: RoutineLike | null | undefined,
  viewer: Viewer,
): boolean {
  if (!routine) return false
  if (viewer.role === "admin") return true
  if (viewer.role === "coach") return true
  return routine.created_by === viewer.id && routine.user_id === viewer.id
}

/** ¿El viewer puede crear una rutina NUEVA para este dueño? */
export function canCreateRoutineFor(
  targetUserId: string,
  viewer: Viewer,
  targetCoachId: string | null,
): boolean {
  if (viewer.role === "admin") return true
  if (viewer.id === targetUserId) return true
  if (viewer.role === "coach" && targetCoachId === viewer.id) return true
  return false
}

/** Helper para construir el viewer desde useAuthSession + perfil. */
export function buildViewer(
  sessionProfile: Tables<"users"> | null,
): Viewer {
  return {
    id: sessionProfile?.id ?? "",
    role: sessionProfile?.role ?? null,
    assignedCoachId: sessionProfile?.coach_id ?? null,
  }
}
