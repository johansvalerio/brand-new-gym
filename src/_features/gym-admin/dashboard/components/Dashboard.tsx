"use client"

import { useEffect, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, ShieldAlert } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { createClient } from "@/lib/supabase/client"
import { useUsers } from "@/_features/gym-admin/users/hooks/useUsers"
import { usePayments } from "@/_features/gym-admin/payments/hooks/usePayments"
import { DashboardStats, type DashboardStatsData } from "./dashboard-stats"
import { ExpiringMembers } from "./expiring-members"
import { PendingPayments } from "./pending-payments"

const DAY_MS = 86_400_000

export function Dashboard() {
  const { isAdmin, loading: authLoading } = useAuthSession()
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useUsers()
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
  } = usePayments()
  const queryClient = useQueryClient()

  // Barrido de vencidas al entrar (fallback del cron nocturno)
  useEffect(() => {
    if (!isAdmin) return
    const supabase = createClient()
    void supabase.rpc("expire_stale_memberships").then(() => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    })
  }, [isAdmin, queryClient])

  const stats = useMemo(() => {
    const now = Date.now()
    const active = users.filter((u) => u.membership_status === "active")

    const expiringRows = active
      .filter(
        (u) =>
          u.membership_end &&
          new Date(u.membership_end).getTime() > now &&
          new Date(u.membership_end).getTime() - now <= 7 * DAY_MS,
      )
      .sort(
        (a, b) =>
          new Date(a.membership_end ?? 0).getTime() -
          new Date(b.membership_end ?? 0).getTime(),
      )

    const pendingRows = payments
      .filter((p) => p.status === "pending")
      .sort(
        (a, b) =>
          new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime(),
      )

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
    const revenueMonth = payments
      .filter(
        (p) =>
          p.status === "approved" &&
          p.decided_at &&
          new Date(p.decided_at).getTime() >= monthStart,
      )
      .reduce((sum, p) => sum + p.amount, 0)

    return {
      totalMembers: users.length,
      activeMembers: active.length,
      expiring: expiringRows.length,
      pendingRequests: pendingRows.length,
      revenueMonth,
      expiringRows,
      pendingRows,
    }
  }, [users, payments])

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando dashboard...
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
            Acceso restringido
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            El dashboard está disponible solo para administradores.
          </p>
        </div>
      </div>
    )
  }

  const statsData: DashboardStatsData = {
    totalMembers: stats.totalMembers,
    activeMembers: stats.activeMembers,
    expiring: stats.expiring,
    pendingRequests: stats.pendingRequests,
    revenueMonth: stats.revenueMonth,
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardStats data={statsData} loading={usersLoading || paymentsLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpiringMembers
          rows={stats.expiringRows}
          loading={usersLoading}
          error={usersError instanceof Error ? usersError.message : null}
        />
        <PendingPayments
          rows={stats.pendingRows}
          loading={paymentsLoading}
          error={paymentsError instanceof Error ? paymentsError.message : null}
        />
      </div>
    </div>
  )
}
