"use client"

import { User, Pencil, Trash2, Eye, Dumbbell, Utensils, MoreVertical } from "lucide-react"
import type { UserRow } from "../hooks/useUsers"
import { MembershipChip } from "./MembershipCountdown"
import { membershipBadgeClasses, membershipLabel, statusBadgeClasses, statusLabel } from "./utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface UsersCardsProps {
  users: UserRow[]
  onEdit: (user: UserRow) => void
  onDelete: (user: UserRow) => void
  onView: (user: UserRow) => void
  onAssignRoutine?: (user: UserRow) => void
  onAssignNutrition?: (user: UserRow) => void
  canManage?: boolean
  canAssign?: boolean
}

export function UsersCards({ users, onEdit, onDelete, onView, onAssignRoutine, onAssignNutrition, canManage = true, canAssign = false }: UsersCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {users.map((user) => {
        const statusBadge = statusBadgeClasses(user.membership_status ?? "pending")
        const planBadge = membershipBadgeClasses(user.plan)
        const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Miembro"

        return (
          <article
            key={user.id}
            className={`group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:-translate-y-1 ${
              user.membership_status === "active"
                ? "border-primary/40 hover:border-primary"
                : "border-border hover:border-primary/50"
            }`}
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

              {/* Status chip — izquierda */}
              <span
                className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${statusBadge} bg-card/80`}
              >
                {statusLabel(user.membership_status ?? "pending")}
              </span>

              {/* Edit/Delete — dropdown en esquina superior derecha */}
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={`Más acciones de ${fullName}`}
                    className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/80 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={4}
                    className="z-[60] w-44 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                  >
                    <DropdownMenuItem
                      onClick={() => onEdit(user)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 font-sans text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(user)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 font-sans text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* body */}
            <div className="relative flex flex-1 flex-col p-4">
              <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                #{user.id.slice(0, 8)}
              </span>
              <h3 className="font-sans text-base font-bold leading-tight text-foreground text-balance">
                {fullName}
              </h3>
              <p className="mt-1 truncate text-sm leading-relaxed text-muted-foreground">{user.email}</p>

              <div className="mt-4 flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-block w-fit rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${planBadge}`}
                  >
                    {membershipLabel(user.plan)}
                  </span>
                  <MembershipChip start={user.membership_start} end={user.membership_end} />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {user.phone ?? "Sin teléfono"}
                  </span>
                </div>

                {canManage ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onView(user)}
                      aria-label={`Ver perfil de ${fullName}`}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-9 sm:w-9 hover:border-primary hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canAssign && onAssignRoutine && (
                      <button
                        onClick={() => onAssignRoutine(user)}
                        aria-label={`Crear rutina del miembro ${fullName}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-9 sm:w-9 hover:border-primary hover:text-primary"
                      >
                        <Dumbbell className="h-4 w-4" />
                      </button>
                    )}
                    {canAssign && onAssignNutrition && (
                      <button
                        onClick={() => onAssignNutrition(user)}
                        aria-label={`Nutrición del miembro ${fullName}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-9 sm:w-9 hover:border-primary hover:text-primary"
                      >
                        <Utensils className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : canAssign && (onAssignRoutine || onAssignNutrition) ? (
                  <div className="flex items-center gap-1.5">
                    {onAssignRoutine && (
                      <button
                        onClick={() => onAssignRoutine(user)}
                        aria-label={`Crear rutina del miembro ${fullName}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-9 sm:w-9 hover:border-primary hover:text-primary"
                      >
                        <Dumbbell className="h-4 w-4" />
                      </button>
                    )}
                    {onAssignNutrition && (
                      <button
                        onClick={() => onAssignNutrition(user)}
                        aria-label={`Nutrición del miembro ${fullName}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-9 sm:w-9 hover:border-primary hover:text-primary"
                      >
                        <Utensils className="h-4 w-4" />
                      </button>
                    )}
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