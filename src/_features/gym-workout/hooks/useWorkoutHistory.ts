"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"
import { workoutKeys } from "./useWorkoutSession"
import { toast } from "sonner"

type ExerciseRow = Tables<"exercises">
type SetLogRow = Tables<"set_logs">
type WorkoutLogRow = Tables<"workout_logs">

export type WorkoutSetWithExercise = SetLogRow & {
  exercises: ExerciseRow | null
}

export type WorkoutWithSets = WorkoutLogRow & {
  routines: { id: number; name: string } | null
  routine_days: { id: number; focus: string } | null
  set_logs: WorkoutSetWithExercise[]
}

export type WorkoutStats = {
  totalWorkouts: number
  workoutsThisWeek: number
  volumeThisWeek: number
  lastWorkout: WorkoutWithSets | null
  volumeByDay: { date: string; volume: number }[]
  volumeByWeek: { week: string; volume: number }[]
  muscleDistribution: { muscle: string; sets: number; volume: number }[]
  topE1RM: { exercise: string; e1RM: number; history: { date: string; e1RM: number }[] } | null
}

function startOfWeek(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay() // 0 Sun
  const diff = (day + 6) % 7 // Mon as start
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - diff)
  return date
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function e1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30) // Brzycki
}

export function computeWorkoutStats(workouts: WorkoutWithSets[]): WorkoutStats {
  const now = new Date()
  const weekStart = startOfWeek(now)

  const workoutsThisWeek = workouts.filter((w) => new Date(w.started_at) >= weekStart)
  const volumeThisWeek = workoutsThisWeek.reduce(
    (sum, w) => sum + w.set_logs.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  )

  // volume by day last 7 days for mini bar
  const volumeByDay: { date: string; volume: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const key = toISODate(d)
    const vol = workouts
      .filter((w) => toISODate(new Date(w.started_at)) === key)
      .reduce((sum, w) => sum + w.set_logs.reduce((s, set) => s + set.weight * set.reps, 0), 0)
    volumeByDay.push({ date: key, volume: vol })
  }

  // volume by week last 8 weeks for line chart
  const volumeByWeek: { week: string; volume: number }[] = []
  for (let w = 7; w >= 0; w--) {
    const ws = new Date(weekStart)
    ws.setDate(weekStart.getDate() - w * 7)
    const we = new Date(ws)
    we.setDate(ws.getDate() + 6)
    const vol = workouts
      .filter((work) => {
        const d = new Date(work.started_at)
        return d >= ws && d <= we
      })
      .reduce((sum, work) => sum + work.set_logs.reduce((s, set) => s + set.weight * set.reps, 0), 0)
    volumeByWeek.push({ week: ws.toLocaleDateString("es-CR", { day: "2-digit", month: "short" }), volume: vol })
  }

  // muscle distribution last 30 days
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const recent = workouts.filter((w) => new Date(w.started_at) >= thirtyDaysAgo)
  const muscleMap = new Map<string, { sets: number; volume: number }>()
  for (const w of recent) {
    for (const s of w.set_logs) {
      const muscle = s.exercises?.muscle_group ?? "otros"
      const cur = muscleMap.get(muscle) ?? { sets: 0, volume: 0 }
      cur.sets += 1
      cur.volume += s.weight * s.reps
      muscleMap.set(muscle, cur)
    }
  }
  const muscleDistribution = Array.from(muscleMap.entries())
    .map(([muscle, v]) => ({ muscle, ...v }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 6)

  // top e1RM exercise (most frequent) + history
  const exerciseCounts = new Map<string, number>()
  for (const w of workouts) for (const s of w.set_logs) {
    const name = s.exercises?.name ?? `Ej #${s.exercise_id}`
    exerciseCounts.set(name, (exerciseCounts.get(name) ?? 0) + 1)
  }
  const topExercise = Array.from(exerciseCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  let topE1RM: WorkoutStats["topE1RM"] = null
  if (topExercise) {
    const history: { date: string; e1RM: number }[] = []
    // per workout max e1RM for that exercise
    const sorted = [...workouts].sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    for (const w of sorted) {
      const sets = w.set_logs.filter((s) => (s.exercises?.name ?? `Ej #${s.exercise_id}`) === topExercise)
      if (sets.length === 0) continue
      const max = Math.max(...sets.map((s) => e1RM(s.weight, s.reps)))
      if (max > 0) history.push({ date: toISODate(new Date(w.started_at)), e1RM: Math.round(max) })
    }
    const best = history.length ? Math.max(...history.map((h) => h.e1RM)) : 0
    // keep last 12 points
    topE1RM = { exercise: topExercise, e1RM: best, history: history.slice(-12) }
  }

  return {
    totalWorkouts: workouts.length,
    workoutsThisWeek: workoutsThisWeek.length,
    volumeThisWeek,
    lastWorkout: workouts[0] ?? null,
    volumeByDay,
    volumeByWeek,
    muscleDistribution,
    topE1RM,
  }
}

async function fetchWorkoutHistory(userId: string): Promise<WorkoutWithSets[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("workout_logs")
    .select(
      `
      id, user_id, routine_id, routine_day_id, notes, started_at, completed_at,
      routines ( id, name ),
      routine_days ( id, focus ),
      set_logs ( id, exercise_id, weight, reps, is_warmup, set_number, exercises ( id, name, muscle_group, image_url ) )
    `,
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  // normalize: supabase may return single object for 1-1, ensure types
  return (data ?? []) as unknown as WorkoutWithSets[]
}

export function useWorkoutHistory(userId: string | null) {
  return useQuery({
    queryKey: userId ? workoutKeys.all(userId) : ["workouts", "noop"],
    queryFn: () => fetchWorkoutHistory(userId as string),
    enabled: Boolean(userId),
    staleTime: 30_000,
  })
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (workoutId: number): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase.from("workout_logs").delete().eq("id", workoutId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast.success("Entrenamiento borrado")
      // invalida todas las queries de workouts (con userId) — types verificados: workout_logs.notes existe text nullable
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "workouts" })
    },
    onError: (error) => {
      toast.error("No se pudo borrar", { description: (error as Error).message })
    },
  })
}

export function useUpdateWorkoutNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string | null }): Promise<{ id: number; notes: string | null }> => {
      const supabase = createClient()
      const { data, error } = await supabase.from("workout_logs").update({ notes }).eq("id", id).select("id, notes").single()
      if (error) throw new Error(error.message)
      return data as { id: number; notes: string | null }
    },
    onMutate: async ({ id, notes }) => {
      await queryClient.cancelQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "workouts" })
      const previous = queryClient.getQueriesData<WorkoutWithSets[]>({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "workouts" })
      queryClient.setQueriesData<WorkoutWithSets[]>({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "workouts" }, (old) => {
        if (!old) return old
        return (old as WorkoutWithSets[]).map((w) => (w.id === id ? { ...w, notes } : w))
      })
      return { previous }
    },
    onError: (error, _vars, context) => {
      const ctx = context as { previous?: [unknown, WorkoutWithSets[] | undefined][] } | undefined
      if (ctx?.previous) {
        for (const [key, data] of ctx.previous) {
          queryClient.setQueryData(key as readonly unknown[], data)
        }
      }
      toast.error("No se pudo actualizar", { description: (error as Error).message })
    },
    onSuccess: (data) => {
      toast.success("Nota actualizada")
      // confirma con dato real del single
      queryClient.setQueriesData<WorkoutWithSets[]>({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "workouts" }, (old) => {
        if (!old) return old
        return (old as WorkoutWithSets[]).map((w) => (w.id === data.id ? { ...w, notes: data.notes } : w))
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "workouts" })
    },
  })
}
