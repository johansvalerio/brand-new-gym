"use client"

import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { NutritionPlans } from "@/_features/gym-nutrition/components/NutritionPlans"

export function NutritionClient() {
  const { profile, loading } = useAuthSession()
  if (loading) {
    return <div className="rounded-lg border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">Cargando…</div>
  }
  if (!profile) {
    return <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">Inicia sesión para ver y crear planes.</div>
  }
  return <NutritionPlans profile={profile} />
}
