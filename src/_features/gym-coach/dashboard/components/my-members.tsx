"use client"

import { ArrowRight, Dumbbell, Loader2, ShieldAlert, User as UserIcon, Users, Utensils } from "lucide-react"
import type { CoachMemberRow } from "../hooks/useCoachDashboard"
import { MembershipChip } from "@/_features/gym-admin/users/components/MembershipCountdown"
import { membershipLabel } from "@/_features/gym-admin/users/components/utils"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

export function MyMembers({
  rows,
  loading,
  error,
  routineIds,
  nutritionIds,
}: {
  rows: CoachMemberRow[]
  loading: boolean
  error: string | null
  /** ids de miembros con rutina activa */
  routineIds: Set<string>
  /** ids de miembros con plan nutricional activo */
  nutritionIds: Set<string>
}) {
  const { navigate } = usePageTransition()

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Users className="h-4 w-4 text-primary" />
          Mis miembros
        </h3>
        <button
          onClick={() => navigate("/users")}
          aria-label="Ver todos los usuarios"
          className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Ver usuarios
          <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando...
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" />
          {error}
        </p>
      ) : rows.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 font-sans text-sm font-bold text-foreground">
            Aún no tienes miembros asignados
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cuando el admin te asigne un miembro aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul>
          {rows.map((member) => {
            const fullName =
              `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() || "Miembro"
            return (
              <li
                key={member.id}
                className="border-b border-border/40 last:border-0 hover:bg-secondary/30"
              >
                <button
                  onClick={() => navigate(`/users/profile/${member.id}`)}
                  aria-label={`Ver perfil de ${fullName}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
                      {member.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatar}
                          alt={fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-sans text-sm font-semibold text-foreground">
                        {fullName}
                      </span>
                      <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {membershipLabel(member.plan)}
                      </span>
                      <span className="mt-1 flex items-center gap-1">
                        {routineIds.has(member.id) ? (
                          <span
                            title="Tiene rutina activa"
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary"
                          >
                            <Dumbbell className="h-3 w-3" />
                          </span>
                        ) : null}
                        {nutritionIds.has(member.id) ? (
                          <span
                            title="Tiene nutrición activa"
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                          >
                            <Utensils className="h-3 w-3" />
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </span>

                  <MembershipChip start={member.membership_start} end={member.membership_end} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
