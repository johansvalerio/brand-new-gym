"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Activity, BarChart3, TrendingUp } from "lucide-react"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { useAdminCharts } from "../hooks/useAdminCharts"

// Donut con contraste alto: verde monster + magenta + cian + naranja + oro + púrpura
const COLORS = ["#96D906", "#E63946", "#4CC9F0", "#F08C00", "#FFD60A", "#9B5DE5"]

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          {icon}
        </span>
        {title}
      </h3>
      <div className="h-[200px]">{children}</div>
    </div>
  )
}

const tip = {
  contentStyle: { background: "#09090b", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#a1a1aa" },
}

export function AdminCharts() {
  const { data, isLoading } = useAdminCharts()

  const checkins = useMemo(() => data?.checkinsByDay ?? [], [data])
  const revenue = useMemo(() => data?.revenueByMonth ?? [], [data])
  const plans = useMemo(() => data?.planDistribution ?? [], [data])
  const signups = useMemo(() => data?.signupsByMonth ?? [], [data])

  if (isLoading) {
    return <p className="py-6 text-center font-mono text-xs text-muted-foreground">Cargando gráficas…</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Check-ins · últimos 30 días" icon={<Activity className="h-4 w-4" />}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={checkins} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="gci" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#96D906" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#96D906" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <Tooltip {...tip} />
            <Area type="monotone" dataKey="count" stroke="#96D906" strokeWidth={2} fill="url(#gci)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ingresos · últimos 6 meses" icon={<TrendingUp className="h-4 w-4" />}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenue} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v: number) => `₡${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <Tooltip {...tip} formatter={(value) => (typeof value === "number" ? currency(value) : "")} />
            <Bar dataKey="memberships" stackId="a" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Membresías" />
            <Bar dataKey="products" stackId="a" fill={COLORS[3]} radius={[4, 4, 0, 0]} name="Productos" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Membresías activas · por plan" icon={<BarChart3 className="h-4 w-4" />}>
        {plans.length === 0 ? (
          <p className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">Sin miembros activos</p>
        ) : (
          <div className="flex h-full items-center gap-4">
            {/* Donut a la izquierda, leyenda a la derecha */}
            <div className="h-full min-w-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={plans} dataKey="count" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                    {plans.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-2.5 pr-2">
              {plans.map((p, i) => (
                <li key={p.name} className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="font-sans text-sm text-foreground">{p.name}</span>
                  <span className="ml-auto font-mono text-xs font-bold tabular-nums text-muted-foreground">{p.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Altas de miembros · últimos 6 meses" icon={<BarChart3 className="h-4 w-4" />}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={signups} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
            <Tooltip {...tip} />
            <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
