"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

/** Miembro asignado al coach, con el plan embebido (mismo shape que UserRow). */
export type CoachMemberRow = Tables<"users"> & {
  plan: { id: string; slug: string; name: string } | null
}

/** Fila mínima de rutina para derivar "quién tiene rutina activa" y conteos. */
export type RoutineLite = Pick<
  Tables<"routines">,
  "id" | "name" | "user_id" | "created_by" | "is_active" | "is_shared"
>

export const coachKeys = {
  /** Bajo ["users"] para heredar las invalidaciones del CRUD de usuarios. */
  members: (coachId: string) => ["users", "coach-members", coachId] as const,
  routinesLite: ["routines", "lite"] as const,
}

async function fetchCoachMembers(coachId: string): Promise<CoachMemberRow[]> {
  const supabase = createClient()
  // RLS: coaches pueden ver usuarios; filtramos a los asignados a este coach.
  const { data, error } = await supabase
    .from("users")
    .select("*, plan:plans(id, slug, name)")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as CoachMemberRow[]
}

export function useCoachMembers(coachId: string) {
  return useQuery({
    queryKey: coachKeys.members(coachId),
    queryFn: () => fetchCoachMembers(coachId),
    enabled: Boolean(coachId),
  })
}

async function fetchRoutinesLite(): Promise<RoutineLite[]> {
  const supabase = createClient()
  // RLS: owner/admin/coach ven todas; solo pedimos columnas ligeras.
  const { data, error } = await supabase
    .from("routines")
    .select("id, name, user_id, created_by, is_active, is_shared")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as RoutineLite[]
}

export function useRoutinesLite() {
  return useQuery({
    queryKey: coachKeys.routinesLite,
    queryFn: fetchRoutinesLite,
  })
}
