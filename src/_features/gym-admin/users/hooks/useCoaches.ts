"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export type CoachOption = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar: string | null
  role: "admin" | "user" | "coach" | null
}

export const coachKeys = {
  all: ["users", "coaches"] as const,
}

async function fetchCoaches(): Promise<CoachOption[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, avatar, role")
    .eq("role", "coach")
    .order("first_name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export function useCoaches() {
  return useQuery({
    queryKey: coachKeys.all,
    queryFn: fetchCoaches,
  })
}

export function coachDisplayName(
  coach: Pick<CoachOption, "first_name" | "last_name">,
) {
  return [coach.first_name, coach.last_name].filter(Boolean).join(" ") || "Coach"
}
