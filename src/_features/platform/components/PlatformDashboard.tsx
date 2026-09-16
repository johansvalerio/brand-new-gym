"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Building2, Loader2, TrendingUp, Users, Wallet } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { usePlatformOverview } from "../hooks/usePlatformOverview"

const tip = {
  contentStyle: { background: "#09090b", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#a1a1aa" },
}

/**
 * Dashboard de plataforma: qué gym genera más, crecimiento, estado.
 * Solo visible para is_platform_admin (guard de página ya verificó).
 */
export function PlatformDashboard() {
  const { isPlatformAdmin, loading: authLoading } = useAuthSession()
  const { data: gyms = [], isLoading, error } = usePlatformOverview()

  const totals = useMemo(() => {
    return gyms.reduce(
      (acc, g) => ({
        income: acc.income + g.income_month,
        expenses: acc.expenses + g.expenses_month,
        net: acc.net + g.net_month,
        members: acc.members + g.members_active,
        signups: acc.signups + g.signups_month,
        activeGyms: acc.activeGyms + (g.is_active ? 1 : 0),
      }),
      { income: 0, expenses: 0, net: 0, members: 0, signups: 0, activeGyms: 0 },
    )
  }, [gyms])

  const byIncome = useMemo(
    () => [...gyms].sort((a, b) => b.income_month - a.income_month),
    [gyms],
  )

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando plataforma...
      </div>
    )
  }

  if (!isPlatformAdmin) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">Acceso restringido</p>
          <p className="mt-2 text-sm text-muted-foreground">Este panel es solo para el administrador de la plataforma.</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background">
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-6 py-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Error cargando plataforma"}
        </p>
      </section>
    )
  }

  const kpis = [
    { label: "Ingresos del mes (todos)", value: currency(totals.income), icon: Wallet },
    { label: "Neto del mes", value: currency(totals.net), icon: TrendingUp, warn: totals.net < 0 },
    { label: "Miembros activos", value: String(totals.members), icon: Users },
    { label: "Gyms activos", value: String(totals.activeGyms), icon: Building2 },
  ]

  return (
    <section className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Plataforma
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground md:text-6xl">
            Jaula <span className="text-primary">Global</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Vista agregada de todos los gyms: quién vende más, quién crece, quién se está dejando perder dinero.
          </p>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-border bg-card px-4 py-3.5">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <kpi.icon className="h-3.5 w-3.5 text-primary" />
                {kpi.label}
              </p>
              <p className={`mt-2 font-sans text-2xl font-black tabular-nums ${kpi.warn ? "text-destructive" : "text-foreground"}`}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Chart: ingresos del mes por gym */}
        <div className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <TrendingUp className="h-4 w-4" />
            </span>
            Ingresos del mes por gym
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byIncome} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v: number) => `₡${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                <Tooltip {...tip} formatter={(v) => (typeof v === "number" ? currency(v) : "")} />
                <Bar dataKey="income_month" radius={[4, 4, 0, 0]}>
                  {byIncome.map((g) => (
                    <Cell key={g.gym_id} fill={g.primary_color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla por gym */}
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border/60 px-4 py-3">
            <h3 className="font-sans text-xs font-black uppercase tracking-widest text-foreground">Rendimiento por gym</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-2">Gym</th>
                  <th className="px-4 py-2 text-right">Miembros activos</th>
                  <th className="px-4 py-2 text-right">Altas del mes</th>
                  <th className="px-4 py-2 text-right">Ingresos mes</th>
                  <th className="px-4 py-2 text-right">Egresos mes</th>
                  <th className="px-4 py-2 text-right">Neto mes</th>
                  <th className="px-4 py-2 text-right">Total histórico</th>
                  <th className="px-4 py-2 text-right">Último check-in</th>
                </tr>
              </thead>
              <tbody>
                {byIncome.map((g) => (
                  <tr key={g.gym_id} className="border-b border-border/40 last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.primary_color }} />
                        <div>
                          <p className="font-sans text-sm font-bold text-foreground">{g.name}</p>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            /{g.slug}{!g.is_active ? " · inactivo" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{g.members_active}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{g.signups_month}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(g.income_month)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-destructive">{currency(g.expenses_month)}</td>
                    <td className={`px-4 py-3 text-right font-mono tabular-nums ${g.net_month < 0 ? "text-destructive" : "text-primary"}`}>
                      {currency(g.net_month)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{currency(g.income_all_time)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                      {g.last_checkin
                        ? new Date(g.last_checkin).toLocaleDateString("es-CR", { day: "numeric", month: "short" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Solo lectura · Las acciones siguen en el gym de cada uno
        </p>
      </div>
    </section>
  )
}
