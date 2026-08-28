"use client"

import { Loader2, ShieldAlert } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { AdminDashboard } from "./admin-dashboard"
import { CoachDashboard } from "@/_features/gym-coach/dashboard/components/CoachDashboard"
import { MemberDashboard } from "@/_features/gym-member/dashboard/components/MemberDashboard"

/**
 * Router por rol: cada rol ve SU dashboard (mismos datos, distinta vista).
 * El guard real vive en RLS; esto solo decide qué orquestador renderizar.
 */
export function Dashboard() {
  const { profile, isAdmin, isCoach, loading } = useAuthSession()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando dashboard...
      </div>
    )
  }

  if (isAdmin) return <AdminDashboard />
  if (isCoach && profile) return <CoachDashboard coachId={profile.id} />
  if (profile) return <MemberDashboard profileId={profile.id} />

  // Sesión sin fila de perfil (no debería ocurrir: handle_new_user la crea)
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
        <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
          Acceso restringido
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          No se encontró tu perfil de miembro.
        </p>
      </div>
    </div>
  )
}
