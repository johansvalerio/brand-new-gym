"use client"

import { useMemo } from "react"
import { Loader2, ShieldAlert } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useUsers } from "@/_features/gym-admin/users/hooks/useUsers"
import { usePayments } from "@/_features/gym-admin/payments/hooks/usePayments"
import { useMonthProductSales } from "../hooks/useAdminCharts"
// Reuso de queries ligeras (mismo cache que el dashboard del coach, sin queries extra).
import { useRoutinesLite, useNutritionLite } from "@/_features/gym-coach/dashboard/hooks/useCoachDashboard"
import { useNow } from "@/_features/shared/hooks/useNow"
import { useRecentSales } from "@/_features/gym-admin/products/hooks/useProductSales"
import { DashboardStats, type DashboardStatsData } from "./dashboard-stats"
import { ExpiringMembers } from "./expiring-members"
import { PendingPayments } from "./pending-payments"
import { PendingSales } from "./pending-sales"
import { AdminCharts } from "./AdminCharts"

const DAY_MS = 86_400_000

/** Mes corto en español con mayúscula ("Sep") para labels como "Ingresos (Sep)". */
function monthShortEs(ts: number): string {
  const raw = new Date(ts)
    .toLocaleDateString("es-CR", { month: "short" })
    .replace(".", "")
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function AdminDashboard() {
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
  const { data: monthProductSales = 0 } = useMonthProductSales()
  const { data: routinesLite = [], isLoading: routinesLoading } = useRoutinesLite()
  const { data: nutritionLite = [], isLoading: nutritionLoading } = useNutritionLite()
  const {
    data: recentSales = [],
    isLoading: salesLoading,
    error: salesError,
  } = useRecentSales(50)
  const now = useNow()

  const stats = useMemo(() => {
    const active = users.filter((u) => u.membership_status === "active")

    // now === null (primer render) → sin cálculo de vencimientos aún
    const expiringRows =
      now === null
        ? []
        : active
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

    // Cola del mostrador: ventas pendientes de entrega (también son "solicitudes").
    const pendingSalesRows = recentSales.filter((s) => s.status === "pending")

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
    const monthRevenue = payments
      .filter(
        (p) =>
          p.status === "approved" &&
          p.decided_at &&
          new Date(p.decided_at).getTime() >= monthStart,
      )
      .reduce((sum, p) => sum + p.amount, 0)
    const revenueMonth = monthRevenue + monthProductSales

    // Adopción global: miembros con al menos una rutina / plan nutricional activo.
    const withRoutine = new Set(
      routinesLite.filter((r) => r.is_active).map((r) => r.user_id),
    ).size
    const withNutrition = new Set(
      nutritionLite.filter((p) => p.is_active).map((p) => p.user_id),
    ).size

    return {
      totalMembers: users.length,
      activeMembers: active.length,
      expiring: expiringRows.length,
      pendingRequests: pendingRows.length + pendingSalesRows.length,
      revenueMonth,
      revenueLabel: `Ingresos (${monthShortEs(now ?? new Date().getTime())})`,
      withRoutine,
      withNutrition,
      expiringRows,
      pendingRows,
      pendingSalesRows,
    }
  }, [users, payments, now, monthProductSales, routinesLite, nutritionLite, recentSales])

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
    revenueLabel: stats.revenueLabel,
    withRoutine: stats.withRoutine,
    withNutrition: stats.withNutrition,
  }

  return (
    <div className="flex flex-col gap-8">
      <DashboardStats data={statsData} loading={usersLoading || paymentsLoading || routinesLoading || nutritionLoading || salesLoading} />

      <AdminCharts />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpiringMembers
          rows={stats.expiringRows}
          loading={usersLoading}
          error={usersError instanceof Error ? usersError.message : null}
        />
        <div className="flex flex-col gap-6">
          <PendingPayments
            rows={stats.pendingRows}
            loading={paymentsLoading}
            error={paymentsError instanceof Error ? paymentsError.message : null}
          />
          <PendingSales
            rows={stats.pendingSalesRows}
            loading={salesLoading}
            error={salesError instanceof Error ? salesError.message : null}
          />
        </div>
      </div>
    </div>
  )
}
