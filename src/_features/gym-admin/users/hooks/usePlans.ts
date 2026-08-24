"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

export type PlanRow = Tables<"plans">

export const plansKeys = {
  all: ["plans"] as const,
}

async function fetchPlans(): Promise<PlanRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("duration_days", { ascending: true })

  if (error) throw error
  return data ?? []
}

export function usePlans() {
  return useQuery({
    queryKey: plansKeys.all,
    queryFn: fetchPlans,
  })
}
