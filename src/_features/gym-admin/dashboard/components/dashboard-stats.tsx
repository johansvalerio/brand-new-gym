"use client"

import { Banknote, BadgeCheck, CalendarClock, Dumbbell, Loader2, User as UserIcon, Utensils } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { currency } from "@/_features/gym-admin/products/components/utils"

export type DashboardStatsData = {
  totalMembers: number
  activeMembers: number
  expiring: number
  pendingRequests: number
  revenueMonth: number
  /** Ej. "Ingresos (Sep)" — mes dinámico calculado en el dashboard. */
  revenueLabel: string
  withRoutine: number
  withNutrition: number
}

export function DashboardStats({
  data,
  loading,
}: {
  data: DashboardStatsData
  loading: boolean
}) {
  return (
    <Tabs defaultValue="miembros">
      <div className="max-w-full overflow-x-auto pb-1">
        <TabsList>
          <TabsTrigger value="miembros">
            <UserIcon className="h-4 w-4" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="negocio">
            <Banknote className="h-4 w-4" />
            Negocio
          </TabsTrigger>
          <TabsTrigger value="adopcion">
            <Dumbbell className="h-4 w-4" />
            Uso de la app
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="miembros" className="mt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<UserIcon className="h-4 w-4" />}
            label="Miembros"
            value={data.totalMembers}
            loading={loading}
          />
          <StatCard
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Activos"
            value={data.activeMembers}
            loading={loading}
            accent
          />
          <StatCard
            icon={<CalendarClock className="h-4 w-4" />}
            label="Por vencer"
            value={data.expiring}
            loading={loading}
            warn={data.expiring > 0}
          />
        </div>
      </TabsContent>

      <TabsContent value="negocio" className="mt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard
            icon={<Banknote className="h-4 w-4" />}
            label="Solicitudes"
            value={data.pendingRequests}
            loading={loading}
            warn={data.pendingRequests > 0}
          />
          <StatCard
            icon={<Banknote className="h-4 w-4" />}
            label={data.revenueLabel}
            value={currency(data.revenueMonth)}
            loading={loading}
          />
        </div>
      </TabsContent>

      <TabsContent value="adopcion" className="mt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard
            icon={<Dumbbell className="h-4 w-4" />}
            label="Con rutina"
            value={data.withRoutine}
            sub={`de ${data.totalMembers} miembros`}
            loading={loading}
            accent
          />
          <StatCard
            icon={<Utensils className="h-4 w-4" />}
            label="Con nutrición"
            value={data.withNutrition}
            sub={`de ${data.totalMembers} miembros`}
            loading={loading}
            accent
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  loading,
  accent = false,
  warn = false,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
  loading: boolean
  accent?: boolean
  warn?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-card px-4 py-3 ${
        warn ? "border-yellow-500/40" : accent ? "border-primary/30" : "border-border"
      }`}
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      {loading ? (
        <Loader2 className="mt-1 h-5 w-5 animate-spin text-muted-foreground/60" />
      ) : (
        <>
          <p
            className={`mt-1 font-sans text-xl font-black leading-none ${
              warn ? "text-yellow-500" : accent ? "text-primary" : "text-foreground"
            }`}
          >
            {value}
          </p>
          {sub ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {sub}
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
