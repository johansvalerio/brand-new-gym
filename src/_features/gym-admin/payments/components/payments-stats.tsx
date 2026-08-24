"use client"

import { Banknote, CheckCircle2, Loader2 } from "lucide-react"
import { currency } from "@/_features/gym-admin/products/components/utils"

export type PaymentsStatsData = {
  pending: number
  approvedMonth: number
  revenueMonth: number
}

export function PaymentsStats({
  data,
  loading,
}: {
  data: PaymentsStatsData
  loading: boolean
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:max-w-2xl sm:grid-cols-3">
      <StatCard
        icon={<Loader2 className="h-4 w-4" />}
        label="Pendientes"
        value={String(data.pending)}
        loading={loading}
        warn={data.pending > 0}
      />
      <StatCard
        icon={<CheckCircle2 className="h-4 w-4" />}
        label="Aprobadas (mes)"
        value={String(data.approvedMonth)}
        loading={loading}
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
  warn = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  loading: boolean
  warn?: boolean
}) {
  return (
    <div
      className={`rounded-lg border bg-card px-4 py-3 ${
        warn ? "border-yellow-500/40" : "border-border"
      }`}
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      {loading ? (
        <p className={`mt-1 font-sans text-xl font-black leading-none ${warn ? "text-yellow-500" : "text-foreground"}`}>
          …
        </p>
      ) : (
        <p
          className={`mt-1 font-sans text-xl font-black leading-none ${
            warn ? "text-yellow-500" : "text-foreground"
          }`}
        >
          {value}
        </p>
      )}
    </div>
  )
}
