"use client"

import { TrendingUp, Dumbbell, PieChart as PieIcon } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useWorkoutHistory, computeWorkoutStats } from "../hooks/useWorkoutHistory"

const COLORS = ["#96D906", "#84cc16", "#65a30d", "#4d7c0f", "#3f6212", "#365314"]

export function WorkoutCharts() {
  const { profile } = useAuthSession()
  const { data: workouts = [] } = useWorkoutHistory(profile?.id ?? null)

  if (workouts.length === 0) return null
  const stats = computeWorkoutStats(workouts)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Volumen semanal — Area */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:col-span-2">
        <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <TrendingUp className="h-4 w-4" />
          </span>
          Volumen semanal (kg)
        </h3>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.volumeByWeek}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: "#09090b", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#a1a1aa" }}
              />
              <Area type="monotone" dataKey="volume" stroke="#96D906" fill="#96D906" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#96D906" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribución músculo — Pie */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <PieIcon className="h-4 w-4" />
          </span>
          Músculo (30d)
        </h3>
        {stats.muscleDistribution.length === 0 ? (
          <p className="py-10 text-center font-mono text-xs text-muted-foreground">Sin datos</p>
        ) : (
          <>
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.muscleDistribution} dataKey="volume" nameKey="muscle" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {stats.muscleDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {stats.muscleDistribution.map((m, i) => (
                <span key={m.muscle} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {m.muscle} · {m.sets}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* e1RM top ejercicio — Line */}
      {stats.topE1RM && stats.topE1RM.history.length > 1 ? (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:col-span-3">
          <h3 className="mb-1 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Dumbbell className="h-4 w-4" />
            </span>
            Fuerza — {stats.topE1RM.exercise} <span className="ml-1 font-mono text-[10px] text-primary">e1RM {stats.topE1RM.e1RM}kg</span>
          </h3>
          <p className="mb-3 font-mono text-[11px] text-muted-foreground">Brzycki · mejor serie por sesión</p>
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.topE1RM.history}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} width={45} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="e1RM" stroke="#96D906" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  )
}
