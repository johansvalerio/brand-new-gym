"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Activity, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import type { CoachMemberRow } from "../hooks/useCoachDashboard"

const tip = {
  contentStyle: { background: "#09090b", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#a1a1aa" },
}

function initials(m: CoachMemberRow): string {
  return `${(m.first_name ?? "?")[0] ?? ""}${(m.last_name ?? "")[0] ?? ""}`.toUpperCase()
}

export function CoachActivity({
  byDay,
  todayCount,
  members,
  activeIdsToday,
}: {
  byDay: { date: string; count: number }[]
  todayCount: number
  members: CoachMemberRow[]
  activeIdsToday: Set<string>
}) {
  const { navigate } = usePageTransition()
  const has = byDay.length > 0 || todayCount > 0

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:col-span-2">
      <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Activity className="h-4 w-4" />
        </span>
        Mi semana (check-ins de tus miembros)
      </h3>

      {!has && members.length === 0 ? (
        <p className="flex h-32 items-center justify-center font-mono text-xs text-muted-foreground">
          Sin check-ins registrados aún.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Círculos de miembros activos hoy */}
          {members.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Entrenando hoy
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {members.map((m) => {
                  const active = activeIdsToday.has(m.id)
                  const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "Miembro"
                  return (
                    <button
                      key={m.id}
                      onClick={() => navigate(`/users/profile/${m.id}`)}
                      title={active ? `${name} — entrenando` : `${name} — sin check-in hoy`}
                      aria-label={`Ver perfil de ${name}`}
                      className="group flex flex-col items-center gap-1"
                    >
                      <span className="relative">
                        <Avatar className={`h-10 w-10 border-2 transition-all duration-200 ${
                          active
                            ? "border-primary"
                            : "border-border opacity-40 grayscale"
                        }`}>
                          <AvatarImage src={m.avatar ?? undefined} alt={name} />
                          <AvatarFallback className="text-xs font-bold">
                            {initials(m)}
                          </AvatarFallback>
                        </Avatar>
                        {active && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      <span className={`max-w-[52px] truncate text-center font-mono text-[9px] ${
                        active ? "text-foreground" : "text-muted-foreground/50"
                      }`}>
                        {name.split(" ")[0]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Barras + Pill */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="shrink-0 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-center sm:text-left">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hoy</p>
              <p className={`mt-1 font-sans text-2xl font-black ${todayCount > 0 ? "text-primary" : "text-foreground"}`}>
                {todayCount}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {todayCount === 0 ? "sin asistencias" : todayCount === 1 ? "entrenando" : "entrenando"}
              </p>
            </div>

            <div className="h-[140px] min-w-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDay} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                  <Tooltip {...tip} />
                  <Bar dataKey="count" fill="#96D906" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
