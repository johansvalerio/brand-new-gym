"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

export type CheckInRow = Tables<"check_ins">

export const checkInKeys = {
  all: (userId: string) => ["check-ins", userId] as const,
}

/** Días que merecen celebración: el toast de check-in cambia en estos hitos */
const STREAK_MILESTONES = new Set([7, 14, 30, 60, 100])

async function fetchCheckIns(userId: string): Promise<CheckInRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("checked_in_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export function useCheckIns(userId: string) {
  return useQuery({
    queryKey: checkInKeys.all(userId),
    queryFn: () => fetchCheckIns(userId),
    enabled: Boolean(userId),
  })
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string): Promise<CheckInRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("check_ins")
        .insert({ user_id: userId })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as CheckInRow
    },
    onSuccess: (row, userId) => {
      const rows = queryClient.getQueryData<CheckInRow[]>(checkInKeys.all(userId)) ?? []
      const { count } = computeStreak([row, ...rows], new Date())
      if (STREAK_MILESTONES.has(count)) {
        toast.success(`¡Racha de ${count} días!`, { description: "No la rompas ahora." })
      } else {
        toast.success("Entrenamiento registrado")
      }
      queryClient.invalidateQueries({ queryKey: checkInKeys.all(userId) })
    },
    onError: (error) => {
      toast.error("No se pudo registrar el entrenamiento", {
        description: error.message,
      })
    },
  })
}

/**
 * Cuenta días consecutivos entrenando hacia atrás desde hoy (o ayer, si hoy
 * aún no registró). Devuelve { count, lastDate }. Puro (sin RPC).
 */
export function computeStreak(
  rows: Pick<CheckInRow, "check_in_date">[],
  today: Date,
): { count: number; lastDate: string | null } {
  const days = new Set(rows.map((r) => r.check_in_date.slice(0, 10)))
  if (days.size === 0) return { count: 0, lastDate: null }

  // Índice de días consecutivos: hoy o ayer como ancla.
  const anchor = new Date(today)
  let count = 0
  let lastDate: string | null = null

  // Si hoy no figura, la racha se mide desde ayer (aún no se rompe).
  const start = new Date(today)
  if (!days.has(toKey(start))) {
    start.setDate(start.getDate() - 1)
  }

  for (let i = 0; i < 366; i++) {
    const key = toKey(start)
    if (days.has(key)) {
      count++
      lastDate = key
      start.setDate(start.getDate() - 1)
    } else {
      break
    }
  }

  return { count, lastDate }
}

/**
 * Mayor racha histórica (para "Récord: X"). Puro.
 */
export function computeBestStreak(rows: Pick<CheckInRow, "check_in_date">[]): number {
  const days = [...new Set(rows.map((r) => r.check_in_date.slice(0, 10)))].sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const key of days) {
    if (prev) {
      const next = new Date(prev)
      next.setDate(next.getDate() + 1)
      run = toKey(next) === key ? run + 1 : 1
    } else {
      run = 1
    }
    if (run > best) best = run
    prev = key
  }
  return best
}

export type WeekDay = {
  key: string
  letter: string
  trained: boolean
  isToday: boolean
}

/** Últimos 7 días terminando en hoy, para la tira de puntitos de la card. */
export function buildWeek(
  rows: Pick<CheckInRow, "check_in_date">[],
  today: Date,
): WeekDay[] {
  const days = new Set(rows.map((r) => r.check_in_date.slice(0, 10)))
  const todayKey = toKey(today)
  const out: WeekDay[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = toKey(d)
    out.push({
      key,
      letter: d
        .toLocaleDateString("es-CR", { weekday: "narrow" })
        .replace(".", "")
        .toUpperCase(),
      trained: days.has(key),
      isToday: key === todayKey,
    })
  }
  return out
}

function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}