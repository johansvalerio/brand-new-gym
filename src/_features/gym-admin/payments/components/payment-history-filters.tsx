"use client"

import { Banknote, CalendarClock, CheckCircle2 } from "lucide-react"
import { FilterPill } from "@/_features/shared/components/filter-pill"
import type { PlanRow } from "@/_features/gym-admin/users/hooks/usePlans"

const DAY_MS = 86_400_000

export type PaymentPeriod = "all" | "today" | "week" | "month" | "custom"

export type PaymentFilters = {
  period: PaymentPeriod
  /** yyyy-mm-dd, usado solo en modo custom */
  from: string
  to: string
  planSlug: string // "all" | slug
  status: "all" | "pending" | "approved" | "rejected"
  method: "all" | "sinpe" | "efectivo"
}

export const defaultPaymentFilters: PaymentFilters = {
  period: "all",
  from: "",
  to: "",
  planSlug: "all",
  status: "all",
  method: "all",
}

function matchesPeriod(requestedAt: string, f: PaymentFilters): boolean {
  const ts = new Date(requestedAt).getTime()

  switch (f.period) {
    case "today": {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      return ts >= start.getTime()
    }
    case "week":
      return ts >= Date.now() - 7 * DAY_MS
    case "month": {
      const d = new Date()
      return ts >= new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    }
    case "custom": {
      if (!f.from && !f.to) return true
      const from = f.from ? new Date(`${f.from}T00:00:00`).getTime() : -Infinity
      const to = f.to ? new Date(`${f.to}T23:59:59.999`).getTime() : Infinity
      return ts >= from && ts <= to
    }
    default:
      return true
  }
}

/** Filtrado puro reutilizable por /payments (historial) y /membership. */
export function filterPaymentRows<
  T extends {
    requested_at: string
    status: string
    method: string
    plan?: { slug: string } | null
  },
>(rows: T[], f: PaymentFilters): T[] {
  return rows.filter((row) => {
    if (f.status !== "all" && row.status !== f.status) return false
    if (f.method !== "all" && row.method !== f.method) return false
    if (f.planSlug !== "all" && row.plan?.slug !== f.planSlug) return false
    return matchesPeriod(row.requested_at, f)
  })
}

const selectCls =
  "w-full cursor-pointer appearance-none rounded-md border border-border bg-card py-2 pl-9 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"

export function PaymentHistoryFilters({
  value,
  onChange,
  plans,
}: {
  value: PaymentFilters
  onChange: (next: PaymentFilters) => void
  plans: PlanRow[]
}) {
  const set = <K extends keyof PaymentFilters>(key: K, v: PaymentFilters[K]) =>
    onChange({ ...value, [key]: v })

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-3 rounded-lg border border-border/60 bg-card/50 p-3">
      {/* Período */}
      <div className="relative w-full sm:w-auto">
        <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={value.period}
          onChange={(e) => set("period", e.target.value as PaymentPeriod)}
          aria-label="Filtrar por fecha"
          className={selectCls}
        >
          <option value="all">Todo el historial</option>
          <option value="today">Hoy</option>
          <option value="week">Últimos 7 días</option>
          <option value="month">Este mes</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      {value.period === "custom" ? (
        <>
          <input
            type="date"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => set("from", e.target.value)}
            aria-label="Desde"
            className="rounded-md border border-border bg-card px-2 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">
            →
          </span>
          <input
            type="date"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => set("to", e.target.value)}
            aria-label="Hasta"
            className="rounded-md border border-border bg-card px-2 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </>
      ) : null}

      {/* Estado */}
      <div className="relative w-full sm:w-auto">
        <CheckCircle2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={value.status}
          onChange={(e) => set("status", e.target.value as PaymentFilters["status"])}
          aria-label="Filtrar por estado"
          className={selectCls}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      {/* Método */}
      <div className="relative w-full sm:w-auto">
        <Banknote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={value.method}
          onChange={(e) => set("method", e.target.value as PaymentFilters["method"])}
          aria-label="Filtrar por método de pago"
          className={selectCls}
        >
          <option value="all">Todo método</option>
          <option value="sinpe">SINPE</option>
          <option value="efectivo">Efectivo</option>
        </select>
      </div>

      {/* Pills de plan */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Plan
        </span>
        <FilterPill
          active={value.planSlug === "all"}
          onClick={() => set("planSlug", "all")}
        >
          Todos
        </FilterPill>
        {plans.map((plan) => (
          <FilterPill
            key={plan.id}
            active={value.planSlug === plan.slug}
            onClick={() => set("planSlug", plan.slug)}
          >
            {plan.name}
          </FilterPill>
        ))}
      </div>
    </div>
  )
}
