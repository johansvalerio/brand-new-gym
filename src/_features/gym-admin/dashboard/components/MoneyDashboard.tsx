"use client"

import { useMemo } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowDown, ArrowUp, DollarSign, Minus, Wallet } from "lucide-react"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { EXPENSE_CATEGORY_LABELS } from "@/_features/gym-finances/lib/expense.schema"
import { useMoneyDashboard, type MonthKpi } from "../hooks/useMoneyDashboard"

const GREEN = "#96D906"
const RED = "#E63946"
const COOL = ["#96D906", "#E63946", "#F08C00", "#FFD60A", "#9B5DE5", "#4CC9F0"]

const tip = {
  contentStyle: { background: "#09090b", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#a1a1aa" },
}

function KpiCard({ month }: { month: MonthKpi }) {
  const up = month.vsPrevPct != null && month.vsPrevPct > 0
  const down = month.vsPrevPct != null && month.vsPrevPct < 0
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3.5">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Flujo · {month.label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Ingresos</p>
          <p className="truncate font-sans text-lg font-black tabular-nums text-foreground">
            {currency(month.incomes)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Egresos</p>
          <p className="truncate font-sans text-lg font-black tabular-nums text-destructive">
            {currency(month.expenses)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Neto</p>
          <p className={`font-sans text-xl font-black tabular-nums ${month.net < 0 ? "text-destructive" : "text-primary"}`}>
            {currency(month.net)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-2">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">vs mes anterior</span>
        {month.vsPrevPct === null ? (
          <span className="flex items-center gap-1 font-mono text-[10px] font-bold text-muted-foreground">
            <Minus className="h-3 w-3" /> Primero en la serie
          </span>
        ) : (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-black ${
              up
                ? "bg-primary/10 text-primary border border-primary/30"
                : down
                  ? "bg-destructive/10 text-destructive border border-destructive/30"
                  : "bg-secondary text-muted-foreground border border-border"
            }`}
          >
            {up ? <ArrowUp className="h-3 w-3" /> : down ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {Math.abs(month.vsPrevPct).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          {icon}
        </span>
        {title}
      </h3>
      <div className="h-[220px]">{children}</div>
    </div>
  )
}

export function MoneyDashboard() {
  const { months, current, expenseMix, revenueSources } = useMoneyDashboard()

  const netSeries = useMemo(
    () => months.map((m) => ({ label: m.label, net: m.net })),
    [months],
  )

  const donut = useMemo(() => {
    if (!current) return []
    return expenseMix.map((c) => ({
      name: EXPENSE_CATEGORY_LABELS[c.name as keyof typeof EXPENSE_CATEGORY_LABELS] ?? c.name,
      value: c.value,
    }))
  }, [expenseMix, current])

  if (!current) {
    return <p className="py-6 text-center font-mono text-xs text-muted-foreground">Sin datos aún. Guarda un egreso o una renta fija para activar este panel.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tarjetas: mes actual + anterior si hay. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <KpiCard month={current} />
        {months.length > 1 ? <KpiCard month={months[months.length - 2]} /> : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-4 py-8 text-center">
            <p className="font-mono text-xs text-muted-foreground">El mes pasado aún no tiene serie.<br />Sé constante: compara el próximo.</p>
          </div>
        )}
      </div>

      {/* Neto por mes (hero del dinero) */}
      <ChartCard title="Flujo de caja neto · últimos 6 meses" icon={<Wallet className="h-4 w-4" />}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={netSeries} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v: number) => `₡${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <Tooltip {...tip} formatter={(v) => (typeof v === "number" ? currency(v) : "")} />
            <ReferenceLine y={0} stroke="#52525b" strokeDasharray="4 4" />
            <Bar dataKey="net" radius={[4, 4, 0, 0]}>
              {netSeries.map((m) => (
                <Cell key={m.label} fill={m.net >= 0 ? GREEN : RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Mix ingresos vs egresos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title={`Egresos por categoría · ${current.label}`} icon={<Wallet className="h-4 w-4" />}>
          {donut.length === 0 ? (
            <p className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">Sin egresos este mes</p>
          ) : (
            <div className="flex h-full items-center gap-4">
              <div className="h-full min-w-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donut} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={3}>
                      {donut.map((_, i) => (
                        <Cell key={i} fill={COOL[i % COOL.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tip} formatter={(v) => (typeof v === "number" ? currency(v) : "")} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex flex-col gap-2 pr-2">
                {donut.map((s, i) => (
                  <li key={s.name} className="flex items-center gap-2.5">
                    <span className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ backgroundColor: COOL[i % COOL.length] }} />
                    <span className="font-sans text-sm text-foreground">{s.name}</span>
                    <span className="ml-auto font-mono text-xs font-bold tabular-nums text-muted-foreground">{currency(s.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>

        <ChartCard title={`Ingresos por fuente · ${current.label}`} icon={<DollarSign className="h-4 w-4" />}>
          {revenueSources.length === 0 ? (
            <p className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">Sin ingresos este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSources} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `₡${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#a1a1aa" }} width={90} tickLine={false} axisLine={false} />
                <Tooltip {...tip} formatter={(v) => (typeof v === "number" ? currency(v) : "")} />
                <Area dataKey="value" fill={GREEN} fillOpacity={0.25} stroke={GREEN} strokeWidth={2} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
