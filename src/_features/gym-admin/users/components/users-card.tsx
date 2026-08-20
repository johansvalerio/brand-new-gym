"use client"

import { User, Pencil, Trash2, Shield, Clock } from "lucide-react"
import type { User as UserType } from "@/_features/gym-admin/users/types"
import { membershipBadgeClasses, membershipLabel, statusBadgeClasses, statusLabel } from "./utils"

interface UsersCardsProps {
  users: UserType[]
  onEdit: (user: UserType) => void
  onDelete: (user: UserType) => void
}

export function UsersCards({ users, onEdit, onDelete }: UsersCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {users.map((user) => {
        const statusBadge = statusBadgeClasses(user.user_membership_status)
        const planBadge = membershipBadgeClasses(user.user_membership_plan)
        return (
          <article
            key={user.user_id}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
          >
            {/* hover glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

            {/* header */}
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
              <div className="flex h-full w-full items-center justify-center">
                {user.user_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_avatar}
                    alt={`${user.user_first_name} ${user.user_last_name}`}
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                  />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground/40" />
                )}
              </div>
              <span
                className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}
              >
                {statusLabel(user.user_membership_status)}
              </span>
            </div>

            {/* body */}
            <div className="relative flex flex-1 flex-col p-4">
              <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                #{String(user.user_id).padStart(3, "0")}
              </span>
              <h3 className="font-sans text-base font-bold leading-tight text-foreground text-balance">
                {user.user_first_name} {user.user_last_name}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {user.user_email}
              </p>

              <div className="mt-4 flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${planBadge}`}
                  >
                    {membershipLabel(user.user_membership_plan)}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {user.user_phone}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(user)}
                    aria-label={`Editar ${user.user_first_name} ${user.user_last_name}`}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    aria-label={`Eliminar ${user.user_first_name} ${user.user_last_name}`}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}