"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useGym } from "@/app/providers/gym-provider"

export type IncomeMonthRow = {
  month: string
  label: string
  memberships: number
  products: number
  rents: number
}

export type IncomeRecentRow = {
  id: string
  source: "membership" | "product" | "rent"
  title: string
  subtitle: string
  amount: number
  at: string
}

export type IncomeData = {
  revenueByMonth: IncomeMonthRow[]
  totalMonth: number
  totalHistoric: number
  byMethod: { method: string; total: number }[]
  bySource: { name: string; value: number }[]
  recent: IncomeRecentRow[]
  rentsMonth: number
}

const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

/** Corte de mes SIEMPRE UTC — el cliente dista de la DB y el revenue sale mal. */
export function startOfMonthUtc(monthsBack = 0): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1)).toISOString()
}

function monthLabel(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear().toString().slice(2)}`
}

export const incomeKeys = {
  all: ["income"] as const,
  /** Ingresos por gym: sin gym en la key, el caché mezclaría gyms. */
  byGym: (gymId: string) => ["income", gymId] as const,
}

async function fetchIncome(gymId: string): Promise<IncomeData> {
  const supabase = createClient()
  const sixMonthsAgo = startOfMonthUtc(5)

  const [{ data: payments }, { data: sales }, { data: rents }] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "id, amount, method, decided_at, user:users!payments_user_id_fkey(first_name, last_name), plan:plans(name)",
      )
      .eq("gym_id", gymId)
      .eq("status", "approved")
      .gte("decided_at", sixMonthsAgo)
      .order("decided_at", { ascending: false }),
    supabase
      .from("product_sales")
      .select(
        "id, total, sold_at, buyer:users!product_sales_buyer_id_fkey(first_name, last_name), product:products!product_sales_product_id_fkey(product_name)",
      )
      .eq("gym_id", gymId)
      .eq("status", "approved")
      .gte("sold_at", sixMonthsAgo)
      .order("sold_at", { ascending: false }),
    supabase.from("recurring_incomes").select("id, description, amount").eq("gym_id", gymId).eq("is_active", true),
  ])

  type PayRow = {
    id: string
    amount: number | null
    method: string | null
    decided_at: string | null
    user: { first_name: string | null; last_name: string | null } | null
    plan: { name: string } | null
  }
  type SaleRow = {
    id: number
    total: number
    sold_at: string
    buyer: { first_name: string | null; last_name: string | null } | null
    product: { product_name: string } | null
  }
  type RentRow = { id: string; description: string; amount: number }

  const payRows = (payments ?? []) as unknown as PayRow[]
  const saleRows = (sales ?? []) as unknown as SaleRow[]
  const rentRows = (rents ?? []) as unknown as RentRow[]
  const rentsMonth = rentRows.reduce((s, r) => s + (r.amount ?? 0), 0)

  // Ventana de 6 meses (YYYY-MM) con cortes UTC.
  const months: string[] = []
  const revenueMap = new Map<string, { memberships: number; products: number; rents: number }>()
  for (let i = 5; i >= 0; i--) {
    const key = startOfMonthUtc(i).slice(0, 7)
    months.push(key)
    revenueMap.set(key, { memberships: 0, products: 0, rents: rentsMonth })
  }

  const byMethod = new Map<string, number>()
  payRows.forEach((p) => {
    if (!p.decided_at) return
    const key = p.decided_at.slice(0, 7)
    const cur = revenueMap.get(key)
    if (cur && p.amount != null) cur.memberships += p.amount
    if (p.amount != null) {
      const m = p.method === "sinpe" ? "SINPE" : "Efectivo"
      byMethod.set(m, (byMethod.get(m) ?? 0) + p.amount)
    }
  })
  saleRows.forEach((s) => {
    const key = s.sold_at.slice(0, 7)
    const cur = revenueMap.get(key)
    if (cur) cur.products += s.total
  })

  const revenueByMonth = months.map((key) => ({
    month: key,
    label: monthLabel(`${key}-01T00:00:00Z`),
    ...(revenueMap.get(key) ?? { memberships: 0, products: 0, rents: 0 }),
  }))

  // Mes actual (UTC) vs histórico (ventana 6m; las rentas cuentan en cada mes).
  const currentKey = startOfMonthUtc(0).slice(0, 7)
  const cur = revenueMap.get(currentKey) ?? { memberships: 0, products: 0, rents: 0 }
  const totalMonth = cur.memberships + cur.products + cur.rents
  const totalHistoric = revenueByMonth.reduce((s, r) => s + r.memberships + r.products + r.rents, 0)

  const bySource = [
    { name: "Membresías", value: revenueByMonth.reduce((s, r) => s + r.memberships, 0) },
    { name: "Productos", value: revenueByMonth.reduce((s, r) => s + r.products, 0) },
    { name: "Rentas", value: revenueByMonth.reduce((s, r) => s + r.rents, 0) },
  ].filter((s) => s.value > 0)

  const memberName = (u: { first_name: string | null; last_name: string | null } | null) =>
    u ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "Miembro" : "Miembro"

  const recent: IncomeRecentRow[] = [
    ...payRows.slice(0, 20).map((p) => ({
      id: `pay-${p.id}`,
      source: "membership" as const,
      title: `${memberName(p.user)} · ${p.plan?.name ?? "Plan"}`,
      subtitle: p.method === "sinpe" ? "SINPE" : "Efectivo",
      amount: p.amount ?? 0,
      at: p.decided_at ?? "",
    })),
    ...saleRows.slice(0, 20).map((s) => ({
      id: `sale-${s.id}`,
      source: "product" as const,
      title: `${s.product?.product_name ?? "Producto"} · ${memberName(s.buyer)}`,
      subtitle: "Mostrador",
      amount: s.total,
      at: s.sold_at,
    })),
  ]
    .filter((r) => r.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 15)

  return {
    revenueByMonth,
    totalMonth,
    totalHistoric,
    byMethod: [...byMethod.entries()].map(([method, total]) => ({ method, total })),
    bySource,
    recent,
    rentsMonth,
  }
}

export function useIncome() {
  const gym = useGym()
  const gymId = gym?.id ?? "none"
  return useQuery({
    queryKey: incomeKeys.byGym(gymId),
    queryFn: () => fetchIncome(gymId),
    enabled: !!gym?.id,
    staleTime: 60_000,
  })
}
