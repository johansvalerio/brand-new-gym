"use client"

import { AlertTriangle, Dumbbell, Loader2, ShieldAlert, UserIcon } from "lucide-react"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import type { CoachMemberRow } from "../hooks/useCoachDashboard"
import { membershipLabel } from "@/_features/gym-admin/users/components/utils"

export type MemberFlag = "sin_rutina" | "inactivo" | "por_vencer"

export type AttentionMember = {
  member: CoachMemberRow
  flags: MemberFlag[]
}

export function MembersNeedAttention({
  rows,
  loading,
  error,
}: {
  rows: AttentionMember[]
  loading: boolean
  error: string | null
}) {
  const { navigate } = usePageTransition()

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Necesitan atención
        </h3>
        {rows.length > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {rows.length} alerta{rows.length > 1 ? "s" : ""}
          </span>
        )}
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando…
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" />
          {error}
        </p>
      ) : rows.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <Dumbbell className="mx-auto h-8 w-8 text-primary/60" />
          <p className="mt-2 font-sans text-sm font-bold text-foreground">Todo en orden</p>
          <p className="mt-1 text-xs text-muted-foreground">Tus miembros tienen rutina y vienen al gym.</p>
        </div>
      ) : (
        <ul>
          {rows.map(({ member, flags }) => {
            const fullName = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() || "Miembro"
            return (
              <li key={member.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/30">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-semibold text-foreground">{fullName}</p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {membershipLabel(member.plan)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {/* chips de alerta */}
                    <div className="flex flex-col items-end gap-0.5">
                      {flags.includes("sin_rutina") && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-600">
                          sin rutina
                        </span>
                      )}
                      {flags.includes("inactivo") && (
                        <span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-destructive">
                          inactivo 7d+
                        </span>
                      )}
                      {flags.includes("por_vencer") && (
                        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-yellow-600">
                          por vencer
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/users/profile/${member.id}`)}
                      aria-label={`Ver member ${fullName}`}
                      title="Ir al perfil"
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
                    >
                      <UserIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
