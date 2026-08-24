"use client"

import { Banknote, BadgeCheck, CalendarClock, Loader2, User as UserIcon } from "lucide-react"
import { currency } from "@/_features/gym-admin/products/components/utils"

export type DashboardStatsData = {
  totalMembers: number
  activeMembers: number
  expiring: number
  pendingRequests: number
  revenueMonth: number
}

export function DashboardStats({
  data,
  loading,
}: {
  data: DashboardStatsData
  loading: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
      <StatCard
        icon={<Banknote className="h-4 w-4" />}
        label="Solicitudes"
        value={data.pendingRequests}
        loading={loading}
        warn={data.pendingRequests > 0}
      />
      <StatCard
        icon={<Banknote className="h-4 w-4" />}
        label="Ingresos (mes)"
        value={currency(data.revenueMonth)}
        loading={loading}
      />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  loading,
  accent = false,
  warn = false,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
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
        <p
          className={`mt-1 font-sans text-xl font-black leading-none ${
            warn ? "text-yellow-500" : accent ? "text-primary" : "text-foreground"
          }`}
        >
          {value}
        </p>
      )}
    </div>
  )
}
