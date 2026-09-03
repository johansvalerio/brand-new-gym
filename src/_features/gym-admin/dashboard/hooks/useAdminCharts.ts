"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export type AdminChartsData = {
  checkinsByDay: { date: string; count: number }[]
  revenueByMonth: { month: string; label: string; memberships: number; products: number }[]
  planDistribution: { name: string; count: number }[]
  signupsByMonth: { month: string; label: string; count: number }[]
}

const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

function startOfMonthUtc(monthsBack = 0): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1)).toISOString()
}

function monthLabel(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear().toString().slice(2)}`
}

async function fetchAdminCharts(): Promise<AdminChartsData> {
  const supabase = createClient()

  // 1) Check-ins últimos 30 días
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000).toISOString()
  const { data: checkins } = await supabase
    .from("check_ins")
    .select("checked_in_at")
    .gte("checked_in_at", thirtyDaysAgo)
    .order("checked_in_at", { ascending: true })

  const byDay = new Map<string, number>()
  ;(checkins ?? []).forEach((row: { checked_in_at: string }) => {
    const day = row.checked_in_at.slice(0, 10) // YYYY-MM-DD
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  })
  const checkinsByDay = [...byDay.entries()].map(([date, count]) => ({ date, count }))

  // 2) Ingresos por mes — últimos 6 meses, memberships (payments) + productos (product_sales)
  const sixMonthsAgo = startOfMonthUtc(5)
  const [{ data: payments }, { data: sales }] = await Promise.all([
    supabase
      .from("payments")
      .select("amount, decided_at")
      .eq("status", "approved")
      .gte("decided_at", sixMonthsAgo),
    supabase
      .from("product_sales")
      .select("total, sold_at")
      .eq("status", "approved")
      .gte("sold_at", sixMonthsAgo),
  ])

  const revenueMap = new Map<string, { memberships: number; products: number }>()
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const key = startOfMonthUtc(i).slice(0, 7) // YYYY-MM
    months.push(key)
    revenueMap.set(key, { memberships: 0, products: 0 })
  }
  ;(payments ?? []).forEach((p: { amount: number | null; decided_at: string | null }) => {
    if (!p.decided_at) return
    const key = p.decided_at.slice(0, 7)
    const cur = revenueMap.get(key)
    if (cur && p.amount != null) cur.memberships += p.amount
  })
  ;(sales ?? []).forEach((s: { total: number; sold_at: string }) => {
    const key = s.sold_at.slice(0, 7)
    const cur = revenueMap.get(key)
    if (cur) cur.products += s.total
  })

  const revenueByMonth = months.map((key) => ({
    month: key,
    label: monthLabel(`${key}-01T00:00:00Z`),
    ...(revenueMap.get(key) ?? { memberships: 0, products: 0 }),
  }))

  // 3) Distribución de planes activos
  const { data: activeMembers } = await supabase
    .from("users")
    .select("plan:plans(name)")
    .eq("membership_status", "active")

  const planCount = new Map<string, number>()
  ;(activeMembers ?? []).forEach((row: { plan: { name: string } | null }) => {
    const name = row.plan?.name ?? "Sin plan"
    planCount.set(name, (planCount.get(name) ?? 0) + 1)
  })
  const planDistribution = [...planCount.entries()].map(([name, count]) => ({ name, count }))

  // 4) Altas de usuarios últimos 6 meses
  const { data: profiles } = await supabase
    .from("users")
    .select("join_date")
    .gte("join_date", sixMonthsAgo)

  const signupCount = new Map<string, number>()
  ;(profiles ?? []).forEach((row: { join_date: string | null }) => {
    if (!row.join_date) return
    const key = row.join_date.slice(0, 7)
    signupCount.set(key, (signupCount.get(key) ?? 0) + 1)
  })
  const signupsByMonth = months.map((key) => ({
    month: key,
    label: monthLabel(`${key}-01T00:00:00Z`),
    count: signupCount.get(key) ?? 0,
  }))

  return { checkinsByDay, revenueByMonth, planDistribution, signupsByMonth }
}

/** Ventas de productos aprobadas del mes en curso (para "Ingresos mes" del dashboard). */
async function fetchMonthProductSales(): Promise<number> {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const { data, error } = await supabase
    .from("product_sales")
    .select("total, sold_at")
    .eq("status", "approved")
    .gte("sold_at", startOfMonth)
  if (error) throw new Error(error.message)
  return (data ?? []).reduce((sum: number, r: { total: number }) => sum + r.total, 0)
}

export function useAdminCharts() {
  return useQuery({
    queryKey: ["admin", "charts"],
    queryFn: fetchAdminCharts,
    staleTime: 60_000,
  })
}

/** Total de ventas de productos aprobadas este mes (para sumar a membresías en stats). */
export function useMonthProductSales() {
  return useQuery({
    queryKey: ["admin", "month-product-sales"],
    queryFn: fetchMonthProductSales,
    staleTime: 60_000,
  })
}
