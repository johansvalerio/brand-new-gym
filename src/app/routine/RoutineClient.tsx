"use client"

import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { UserRoutines } from "@/_features/gym-routines/components/UserRoutines"

export function RoutineClient() {
  const { profile, loading } = useAuthSession()
  if (loading) {
    return <div className="rounded-lg border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">Cargando…</div>
  }
  if (!profile) {
    return <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">Inicia sesión para ver y crear rutinas.</div>
  }
  return (
    <div className="flex flex-col gap-10">
      <UserRoutines profile={profile} />
    </div>
  )
}
