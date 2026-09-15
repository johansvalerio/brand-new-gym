"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useGym } from "@/app/providers/gym-provider"
import type { Tables } from "@/types/database.types"

export type StaffOption = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar: string | null
  role: Tables<"users">["role"]
}

export const salaryStaffKeys = {
  all: ["salary-staff"] as const,
  byGym: (gymId: string) => ["salary-staff", gymId] as const,
}

/**
 * Staff pagable del gym: coaches + recepción. Solo para el picker de
 * "salarios" en egresos (beneficiario del pago), no para asignaciones.
 */
async function fetchSalaryStaff(gymId: string): Promise<StaffOption[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, avatar, role")
    .eq("gym_id", gymId)
    .in("role", ["coach", "recepcionista"])
    .order("role", { ascending: false })
    .order("first_name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export function useSalaryStaff() {
  const gym = useGym()
  const gymId = gym?.id ?? "none"
  return useQuery({
    queryKey: salaryStaffKeys.byGym(gymId),
    queryFn: () => fetchSalaryStaff(gymId),
    enabled: !!gym?.id,
  })
}

export function staffDisplayName(s: Pick<StaffOption, "first_name" | "last_name">) {
  return [s.first_name, s.last_name].filter(Boolean).join(" ") || "Staff"
}
