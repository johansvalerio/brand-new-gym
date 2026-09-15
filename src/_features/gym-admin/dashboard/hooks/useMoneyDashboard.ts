"use client"

import { useMemo } from "react"
import { useExpenses } from "@/_features/gym-finances/hooks/useExpenses"
import { useIncome } from "@/_features/gym-finances/hooks/useIncome"
import { useAdminCharts } from "./useAdminCharts"

export type MonthKpi = {
  /** "2026-09" */
  month: string
  label: string
  incomes: number
  expenses: number
  net: number
  /** % vs mes anterior (neto); null si no hay mes previo en la serie. */
  vsPrevPct: number | null
  prevNet: number | null
}

/**
 * Fusión income (useIncome) + egresos (useExpenses) por mes para el tab
 * "Dinero" del dashboard. Datos base ya vienen con cortes UTC.
 */
export function useMoneyDashboard() {
  const { data: income } = useIncome()
  const { data: expenses = [] } = useExpenses()
  const { data: charts } = useAdminCharts()

  const months = useMemo<MonthKpi[]>(() => {
    const revenue = income?.revenueByMonth ?? []
    const byMonth = new Map<string, number>()
    for (const e of expenses) {
      const key = e.expense_date.slice(0, 7)
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(e.amount ?? 0))
    }

    const series = revenue.map((m) => {
      const incomes = m.memberships + m.products + m.rents
      const monthExpenses = byMonth.get(m.month) ?? 0
      return {
        month: m.month,
        label: m.label,
        incomes,
        expenses: monthExpenses,
        net: incomes - monthExpenses,
        vsPrevPct: null as number | null,
        prevNet: null as number | null,
      } satisfies MonthKpi
    })

    // Flechas: porcentaje vs mes anterior de la ventana.
    for (let i = 0; i < series.length; i++) {
      const prev = i > 0 ? series[i - 1].net : null
      series[i].prevNet = prev
      if (prev === null || prev === 0) {
        series[i].vsPrevPct = null
      } else {
        series[i].vsPrevPct = ((series[i].net - prev) / Math.abs(prev)) * 100
      }
    }
    return series
  }, [income, expenses])

  const current = months.length > 0 ? months[months.length - 1] : null

  const expenseMix = useMemo(() => {
    if (!current) return []
    const key = current.month
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.expense_date.slice(0, 7) !== key) continue
      map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount ?? 0))
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
  }, [expenses, current])

  return {
    months,
    current,
    expenseMix,
    revenueSources: income?.bySource ?? [],
    byMethod: income?.byMethod ?? [],
    planDistribution: charts?.planDistribution ?? [],
  }
}
