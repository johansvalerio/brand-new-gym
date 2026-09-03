"use client"

import { useMemo } from "react"
import { Loader2, ShieldAlert } from "lucide-react"
import { useCoachMembers, useRoutinesLite, useNutritionLite, useCoachActivity } from "../hooks/useCoachDashboard"
import { useNow } from "@/_features/shared/hooks/useNow"
import { CoachStats, type CoachStatsData } from "./coach-stats"
import { MyMembers } from "./my-members"
import { MembersNeedAttention, type AttentionMember, type MemberFlag } from "./MembersNeedAttention"
import { CoachActivity } from "./CoachActivity"

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
  const {
    data: nutritionPlans = [],
    isLoading: nutritionLoading,
    error: nutritionError,
  } = useNutritionLite()

  const memberIds = useMemo(() => members.map((m) => m.id), [members])
  const { data: activity } = useCoachActivity(memberIds)

  // Miembros con membresía activa (para círculos que el coach ve)
  const activeMembers = useMemo(
    () => members.filter((m) => m.membership_status === "active"),
    [members],
  )

  // Set de ids que hoy hicieron check-in (para pintar círculos activos)
  const todayActiveIds = useMemo(() => {
    const ids = new Set<string>()
    if (!activity) return ids
    const today = new Date().toISOString().slice(0, 10)
    for (const row of activity.byDay) {
      if (row.date === today) {
        // necesitamos los user_id de hoy — no los tenemos en byDay (solo count).
        // Los extraemos de lastCheckinByMember: quien tenga último check-in = hoy.
        for (const [memberId, iso] of activity.lastCheckinByMember) {
          if (iso.slice(0, 10) === today) ids.add(memberId)
        }
        break
      }
    }
    return ids
  }, [activity])

  const loading = membersLoading || routinesLoading || nutritionLoading
  const error =
    (membersError instanceof Error ? membersError.message : null) ??
    (routinesError instanceof Error ? routinesError.message : null) ??
    (nutritionError instanceof Error ? nutritionError.message : null)

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
    const ownersWithActiveNutrition = new Set(
      nutritionPlans.filter((p) => p.is_active).map((p) => p.user_id),
    )

    // Necesitan atención: sin rutina, inactivo 7+d, o por vencer. Combinado, sin repetir.
    const attentionMap = new Map<string, { member: typeof members[number]; flags: MemberFlag[] }>()
    for (const m of members) {
      const flags: MemberFlag[] = []
      if (!ownersWithActiveRoutine.has(m.id)) flags.push("sin_rutina")
      const lastCheck = activity?.lastCheckinByMember.get(m.id)
      if (!lastCheck || (now !== null && new Date(lastCheck).getTime() < now - 7 * DAY_MS)) flags.push("inactivo")
      if (
        m.membership_end &&
        now !== null &&
        new Date(m.membership_end).getTime() > now &&
        new Date(m.membership_end).getTime() - now <= 7 * DAY_MS
      ) flags.push("por_vencer")
      if (flags.length > 0) attentionMap.set(m.id, { member: m, flags })
    }

    const myRoutinesCount = routines.filter((r) => r.created_by === coachId).length

    return {
      totalMembers: members.length,
      activeMembers: active.length,
      expiring: expiringRows.length,
      myRoutines: myRoutinesCount,
      withRoutine: members.filter((m) => ownersWithActiveRoutine.has(m.id)).length,
      withNutrition: members.filter((m) => ownersWithActiveNutrition.has(m.id)).length,
      ownersWithActiveRoutine,
      ownersWithActiveNutrition,
      attentionRows: [...attentionMap.values()] as AttentionMember[],
    }
  }, [members, routines, nutritionPlans, coachId, now, activity])

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
    withRoutine: derived.withRoutine,
    withNutrition: derived.withNutrition,
  }

  return (
    <div className="flex flex-col gap-8">
      {loading && members.length === 0 && routines.length === 0 && nutritionPlans.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando tu equipo...
        </div>
      ) : null}

      <CoachStats data={statsData} loading={loading} />

      {activity ? (
        <CoachActivity
          byDay={activity.byDay}
          todayCount={activity.todayCount}
          members={activeMembers}
          activeIdsToday={todayActiveIds}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MyMembers
          rows={members}
          loading={membersLoading}
          error={membersError instanceof Error ? membersError.message : null}
          routineIds={derived.ownersWithActiveRoutine}
          nutritionIds={derived.ownersWithActiveNutrition}
        />
        <MembersNeedAttention
          rows={derived.attentionRows}
          loading={membersLoading || routinesLoading}
          error={error}
        />
      </div>
    </div>
  )
}
