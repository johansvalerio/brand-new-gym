"use client"

import { useMemo } from "react"
import { Loader2, ShieldAlert } from "lucide-react"
import { useCoachMembers, useRoutinesLite } from "../hooks/useCoachDashboard"
import { useNow } from "@/_features/shared/hooks/useNow"
import { CoachStats, type CoachStatsData } from "./coach-stats"
import { MyMembers } from "./my-members"
import { MembersWithoutRoutine } from "./members-without-routine"

const DAY_MS = 86_400_000

export function CoachDashboard({ coachId }: { coachId: string }) {
  const now = useNow()
  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
  } = useCoachMembers(coachId)
  const {
    data: routines = [],
    isLoading: routinesLoading,
    error: routinesError,
  } = useRoutinesLite()

  const loading = membersLoading || routinesLoading
  const error =
    (membersError instanceof Error ? membersError.message : null) ??
    (routinesError instanceof Error ? routinesError.message : null)

  const derived = useMemo(() => {
    const active = members.filter((m) => m.membership_status === "active")

    // now === null (primer render) → sin cálculo de vencimientos aún
    const expiringRows =
      now === null
        ? []
        : active
            .filter(
              (m) =>
                m.membership_end &&
                new Date(m.membership_end).getTime() > now &&
                new Date(m.membership_end).getTime() - now <= 7 * DAY_MS,
            )
            .sort(
              (a, b) =>
                new Date(a.membership_end ?? 0).getTime() -
                new Date(b.membership_end ?? 0).getTime(),
            )

    const ownersWithActiveRoutine = new Set(
      routines.filter((r) => r.is_active).map((r) => r.user_id),
    )
    const withoutRoutineRows = members.filter(
      (m) => !ownersWithActiveRoutine.has(m.id),
    )
    const myRoutinesCount = routines.filter((r) => r.created_by === coachId).length

    return {
      totalMembers: members.length,
      activeMembers: active.length,
      expiring: expiringRows.length,
      myRoutines: myRoutinesCount,
      withoutRoutineRows,
    }
  }, [members, routines, coachId, now])

  if (!coachId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
            Acceso restringido
          </p>
        </div>
      </div>
    )
  }

  const statsData: CoachStatsData = {
    totalMembers: derived.totalMembers,
    activeMembers: derived.activeMembers,
    expiring: derived.expiring,
    myRoutines: derived.myRoutines,
  }

  return (
    <div className="flex flex-col gap-8">
      {loading && members.length === 0 && routines.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando tu equipo...
        </div>
      ) : null}

      <CoachStats data={statsData} loading={loading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MyMembers
          rows={members}
          loading={membersLoading}
          error={membersError instanceof Error ? membersError.message : null}
        />
        <MembersWithoutRoutine
          rows={derived.withoutRoutineRows}
          loading={routinesLoading}
          error={error}
        />
      </div>
    </div>
  )
}
