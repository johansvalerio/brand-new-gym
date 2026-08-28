"use client"

import { Dumbbell, Loader2, ShieldAlert } from "lucide-react"
import type { CoachMemberRow } from "../hooks/useCoachDashboard"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

export function MembersWithoutRoutine({
  rows,
  loading,
  error,
}: {
  rows: CoachMemberRow[]
  loading: boolean
  error: string | null
}) {
  const { navigate } = usePageTransition()

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Dumbbell className="h-4 w-4 text-primary" />
          Sin rutina activa
        </h3>
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
          <Dumbbell className="mx-auto h-8 w-8 text-primary/60" />
          <p className="mt-2 font-sans text-sm font-bold text-foreground">
            Todos entrenan con rutina
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cada uno de tus miembros tiene una rutina activa. Buen trabajo.
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
                className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 last:border-0 hover:bg-secondary/30"
              >
                <span className="min-w-0">
                  <span className="block truncate font-sans text-sm font-semibold text-foreground">
                    {fullName}
                  </span>
                  <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Espera su rutina
                  </span>
                </span>

                <button
                  onClick={() => navigate(`/users/profile/${member.id}/routine`)}
                  aria-label={`Crear rutina de ${fullName}`}
                  title={`Crear rutina de ${fullName}`}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:h-9 sm:w-9"
                >
                  <Dumbbell className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
