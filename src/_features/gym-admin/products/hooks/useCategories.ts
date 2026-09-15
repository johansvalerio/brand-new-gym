"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useGym } from "@/app/providers/gym-provider"
import type { Tables } from "@/types/database.types"

export type CategoryRow = Tables<"categories">

export const categoryKeys = {
  all: ["categories"] as const,
  /** Catálogo por gym: sin gym en la key, el caché mezclaría gyms. */
  byGym: (gymId: string) => ["categories", gymId] as const,
}

async function fetchCategories(gymId: string): Promise<CategoryRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("gym_id", gymId)
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export function useCategories() {
  const gym = useGym()
  const gymId = gym?.id ?? "none"
  return useQuery({
    queryKey: categoryKeys.byGym(gymId),
    queryFn: () => fetchCategories(gymId),
    enabled: !!gym?.id,
  })
}
