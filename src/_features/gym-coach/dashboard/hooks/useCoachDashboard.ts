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

/** Fila mínima de plan nutricional para derivar "quién tiene nutrición activa". */
export type NutritionLite = Pick<
  Tables<"nutrition_plans">,
  "id" | "user_id" | "is_active"
>

export const coachKeys = {
  /** Bajo ["users"] para heredar las invalidaciones del CRUD de usuarios. */
  members: (coachId: string) => ["users", "coach-members", coachId] as const,
  routinesLite: ["routines", "lite"] as const,
  nutritionLite: ["nutrition", "lite"] as const,
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

export type CoachActivity = {
  /** check-ins por día ISO YYYY-MM-DD de los miembros asignados (últimos 7d). */
  byDay: { date: string; count: number }[]
  /** cuántos entrenaron HOY */
  todayCount: number
  /** mapa memberId → última fecha check-in (para detectar inactivos) */
  lastCheckinByMember: Map<string, string>
}

async function fetchCoachActivity(memberIds: string[]): Promise<CoachActivity> {
  if (memberIds.length === 0) return { byDay: [], todayCount: 0, lastCheckinByMember: new Map() }
  const supabase = createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString()

  const { data, error } = await supabase
    .from("check_ins")
    .select("user_id, checked_in_at")
    .in("user_id", memberIds)
    .gte("checked_in_at", sevenDaysAgo)
    .order("checked_in_at", { ascending: true })

  if (error) throw new Error(error.message)

  const byDay = new Map<string, number>()
  const lastByMember = new Map<string, string>()
  let todayCount = 0
  const todayKey = new Date().toISOString().slice(0, 10)

  for (const row of data ?? []) {
    const day = row.checked_in_at.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
    lastByMember.set(row.user_id, row.checked_in_at)
    if (day === todayKey) todayCount++
  }

  return {
    byDay: [...byDay.entries()].map(([date, count]) => ({ date, count })),
    todayCount,
    lastCheckinByMember: lastByMember,
  }
}

export function useCoachActivity(memberIds: string[]) {
  return useQuery({
    queryKey: ["coach-activity", ...memberIds.sort()],
    queryFn: () => fetchCoachActivity(memberIds),
    enabled: memberIds.length > 0,
    staleTime: 30_000, // 30s — queremos respuesta rápida si alguien entra
  })
}

export function useRoutinesLite() {
  return useQuery({
    queryKey: coachKeys.routinesLite,
    queryFn: fetchRoutinesLite,
  })
}

async function fetchNutritionLite(): Promise<NutritionLite[]> {
  const supabase = createClient()
  // RLS: owner/admin/coach ven todos (nutrition_plans_select); solo columnas ligeras.
  const { data, error } = await supabase
    .from("nutrition_plans")
    .select("id, user_id, is_active")

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as NutritionLite[]
}

export function useNutritionLite() {
  return useQuery({
    queryKey: coachKeys.nutritionLite,
    queryFn: fetchNutritionLite,
  })
}
