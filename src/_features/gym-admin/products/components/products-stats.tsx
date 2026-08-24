"use client"

import { Banknote, PackageOpen } from "lucide-react"
import { currency } from "./utils"

export function ProductsStats({
  isAdmin,
  count,
  units,
  revenue,
}: {
  isAdmin: boolean
  count: number
  units: number
  revenue: number
}) {
  return (
    <div className={`mb-8 grid gap-3 sm:max-w-xl ${isAdmin ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}>
      <Stat label="Productos" value={count} icon={<PackageOpen className="h-3.5 w-3.5" />} />
      {isAdmin ? (
        <>
          <Stat label="Unidades" value={units} icon={<Banknote className="h-3.5 w-3.5" />} />
          <Stat label="Valor inv." value={currency(revenue)} icon={<Banknote className="h-3.5 w-3.5" />} />
        </>
      ) : null}
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-sans text-xl font-black text-foreground">{value}</p>
    </div>
  )
}
