"use client"

import {
  ArrowRight,
  CalendarClock,
  Loader2,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react"
import type { UserRow } from "@/_features/gym-admin/users/hooks/useUsers"
import { MembershipChip } from "@/_features/gym-admin/users/components/MembershipCountdown"
import { membershipLabel } from "@/_features/gym-admin/users/components/utils"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

export function ExpiringMembers({
  rows,
  loading,
  error,
}: {
  rows: UserRow[]
  loading: boolean
  error: string | null
}) {
  const { navigate } = usePageTransition()

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <CalendarClock className="h-4 w-4 text-primary" />
          Por vencer (≤7 días)
        </h3>
        <button
          onClick={() => navigate("/users")}
          aria-label="Ver todos los miembros"
          className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Ver miembros
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
          <CalendarClock className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 font-sans text-sm font-bold text-foreground">
            Sin vencimientos próximos
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ninguna membresía activa vence en los próximos 7 días.
          </p>
        </div>
      ) : (
        <ul>
          {rows.map((user) => {
            const fullName =
              `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Miembro"
            return (
              <li
                key={user.id}
                className="border-b border-border/40 last:border-0 hover:bg-secondary/30"
              >
                <button
                  onClick={() => navigate(`/users/profile/${user.id}`)}
                  aria-label={`Ver perfil de ${fullName}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar}
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
                        {membershipLabel(user.plan)}
                      </span>
                    </span>
                  </span>

                  <MembershipChip start={user.membership_start} end={user.membership_end} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
