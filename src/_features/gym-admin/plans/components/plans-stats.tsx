"use client"

import { BadgeCheck, CalendarClock, CreditCard } from "lucide-react"

export function PlansStats({
  total,
  active,
  inactive,
}: {
  total: number
  active: number
  inactive: number
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Stat
        icon={<CreditCard className="h-3.5 w-3.5" />}
        label="Planes"
        value={total}
      />
      <Stat
        icon={<BadgeCheck className="h-3.5 w-3.5" />}
        label="Activos"
        value={active}
        accent
      />
      <Stat
        icon={<CalendarClock className="h-3.5 w-3.5" />}
        label="Inactivos"
        value={inactive}
      />
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        accent ? "border-primary/30 bg-card" : "border-border bg-card"
      }`}
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p
        className={`mt-1 font-sans text-xl font-black ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  )
}