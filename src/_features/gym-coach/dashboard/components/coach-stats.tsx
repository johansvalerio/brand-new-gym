"use client"

import { BadgeCheck, CalendarClock, Dumbbell, Loader2, Users, Utensils } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type CoachStatsData = {
  totalMembers: number
  activeMembers: number
  expiring: number
  myRoutines: number
  withRoutine: number
  withNutrition: number
}

export function CoachStats({
  data,
  loading,
}: {
  data: CoachStatsData
  loading: boolean
}) {
  return (
    <Tabs defaultValue="equipo">
      <div className="max-w-full overflow-x-auto pb-1">
        <TabsList>
          <TabsTrigger value="equipo">
            <Users className="h-4 w-4" />
            Equipo
          </TabsTrigger>
          <TabsTrigger value="planes">
            <Dumbbell className="h-4 w-4" />
            Planes
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="equipo" className="mt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Mis miembros"
            value={data.totalMembers}
            loading={loading}
          />
          <StatCard
            icon={<BadgeCheck className="h-4 w-4" />}
            label="Activos"
            value={data.activeMembers}
            loading={loading}
            accent
          />
          <StatCard
            icon={<CalendarClock className="h-4 w-4" />}
            label="Por vencer"
            value={data.expiring}
            loading={loading}
            warn={data.expiring > 0}
          />
        </div>
      </TabsContent>

      <TabsContent value="planes" className="mt-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<Dumbbell className="h-4 w-4" />}
            label="Rutinas creadas"
            value={data.myRoutines}
            loading={loading}
          />
          <StatCard
            icon={<Dumbbell className="h-4 w-4" />}
            label="Con rutina"
            value={data.withRoutine}
            sub={`de ${data.totalMembers} miembros`}
            loading={loading}
            accent
          />
          <StatCard
            icon={<Utensils className="h-4 w-4" />}
            label="Con nutrición"
            value={data.withNutrition}
            sub={`de ${data.totalMembers} miembros`}
            loading={loading}
            accent
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  loading,
  accent = false,
  warn = false,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub?: string
  loading: boolean
  accent?: boolean
  warn?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-card px-4 py-3 ${
        warn ? "border-yellow-500/40" : accent ? "border-primary/30" : "border-border"
      }`}
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      {loading ? (
        <Loader2 className="mt-1 h-5 w-5 animate-spin text-muted-foreground/60" />
      ) : (
        <>
          <p
            className={`mt-1 font-sans text-xl font-black leading-none ${
              warn ? "text-yellow-500" : accent ? "text-primary" : "text-foreground"
            }`}
          >
            {value}
          </p>
          {sub ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {sub}
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
