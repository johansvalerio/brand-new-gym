"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

export type CheckInRow = Tables<"check_ins">

export const checkInKeys = {
  all: (userId: string) => ["check-ins", userId] as const,
}

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
      toast.success("Entrenamiento registrado")
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

function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}