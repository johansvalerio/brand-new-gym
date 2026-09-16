"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export type PlatformGymRow = {
  gym_id: string
  name: string
  slug: string
  primary_color: string
  is_active: boolean
  members_total: number
  members_active: number
  signups_month: number
  income_month: number
  expenses_month: number
  net_month: number
  income_all_time: number
  last_checkin: string | null
}

export const platformKeys = {
  all: ["platform"] as const,
  overview: ["platform", "gyms-overview"] as const,
}

/**
 * Vista cross-gym de Jaula (solo platform admin; el RPC valida is_platform_admin
 * server-side — el flag se setea por SQL directo, nunca desde la app).
 */
export function usePlatformOverview() {
  return useQuery({
    queryKey: platformKeys.overview,
    queryFn: async (): Promise<PlatformGymRow[]> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("platform_gyms_overview")
      if (error) throw new Error(error.message)
      return (data ?? []) as PlatformGymRow[]
    },
    staleTime: 60_000,
  })
}
