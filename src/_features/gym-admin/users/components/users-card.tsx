"use client"

import { User, Pencil, Trash2 } from "lucide-react"
import type { Tables } from "@/types/database.types"
import { membershipBadgeClasses, membershipLabel, statusBadgeClasses, statusLabel } from "./utils"

type UserRow = Tables<"users">

interface UsersCardsProps {
  users: UserRow[]
  onEdit: (user: UserRow) => void
  onDelete: (user: UserRow) => void
  canManage?: boolean
}

export function UsersCards({ users, onEdit, onDelete, canManage = true }: UsersCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {users.map((user) => {
        const statusBadge = statusBadgeClasses(user.membership_status ?? "pending")
        const planBadge = membershipBadgeClasses(user.membership_plan ?? "basic")
        const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Miembro"

        return (
          <article
            key={user.id}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
          >
            {/* hover glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

            {/* header */}
            <div className="relative aspect-4/3 overflow-hidden bg-secondary">
              <div className="flex h-full w-full items-center justify-center">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={fullName}
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                  />
                ) : (
                  <User className="h-16 w-16 text-muted-foreground/40" />
                )}
              </div>
              <span
                className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}
              >
                {statusLabel(user.membership_status ?? "pending")}
              </span>
            </div>

            {/* body */}
            <div className="relative flex flex-1 flex-col p-4">
              <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                #{user.id.slice(0, 8)}
              </span>
              <h3 className="font-sans text-base font-bold leading-tight text-foreground text-balance">
                {fullName}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{user.email}</p>

              <div className="mt-4 flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${planBadge}`}
                  >
                    {membershipLabel(user.membership_plan ?? "basic")}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {user.phone ?? "Sin teléfono"}
                  </span>
                </div>

                {canManage ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEdit(user)}
                      aria-label={`Editar ${fullName}`}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      aria-label={`Eliminar ${fullName}`}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}