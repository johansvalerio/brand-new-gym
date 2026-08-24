"use client"

import { User, Pencil, Trash2, Eye, Dumbbell } from "lucide-react"
import type { UserRow } from "../hooks/useUsers"
import { MembershipChip } from "./MembershipCountdown"
import { membershipBadgeClasses, membershipLabel, statusBadgeClasses, statusLabel } from "./utils"

interface UsersTableProps {
  users: UserRow[]
  onEdit: (user: UserRow) => void
  onDelete: (user: UserRow) => void
  onView: (user: UserRow) => void
  onAssignRoutine?: (user: UserRow) => void
  canManage?: boolean
  canAssignRoutine?: boolean
}

export function UsersTable({ users, onEdit, onDelete, onView, onAssignRoutine, canManage = true, canAssignRoutine = false }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["ID", "Miembro", "Email", "Plan", "Estado", "Última visita", ""].map((header, index) => (
                <th
                  key={header}
                  className={`px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${index === 5 ? "text-right" : ""
                    } ${index === 6 ? "text-right" : ""}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const statusBadge = statusBadgeClasses(user.membership_status ?? "pending")
              const planBadge = membershipBadgeClasses(user.plan)
              const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Miembro"
              const lastVisit = user.last_visit ?? user.join_date ?? "2024-01-01T00:00:00.000Z"

              return (
                <tr
                  key={user.id}
                  className="group border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    #{user.id.slice(0, 8)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar} alt={fullName} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-sans text-sm font-semibold text-foreground">{fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.phone ?? "Sin teléfono"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${planBadge}`}
                      >
                        {membershipLabel(user.plan)}
                      </span>
                      <MembershipChip start={user.membership_start} end={user.membership_end} />
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}
                    >
                      {statusLabel(user.membership_status ?? "pending")}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-muted-foreground">
                    {new Date(lastVisit).toLocaleDateString("es-EC", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  {canManage ? (
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onView(user)}
                          aria-label={`Ver perfil de ${fullName}`}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-8 sm:w-8 transition-colors hover:border-primary hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(user)}
                          aria-label={`Editar ${fullName}`}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-8 sm:w-8 transition-colors hover:border-primary hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(user)}
                          aria-label={`Eliminar ${fullName}`}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-8 sm:w-8 transition-colors hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {canAssignRoutine && onAssignRoutine && (
                          <button
                            onClick={() => onAssignRoutine(user)}
                            aria-label={`Crear rutina del miembro ${fullName}`}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-8 sm:w-8 transition-colors hover:border-primary hover:text-primary"
                          >
                            <Dumbbell className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  ) : canAssignRoutine && onAssignRoutine ? (
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAssignRoutine(user)}
                          aria-label={`Crear rutina del miembro ${fullName}`}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-8 sm:w-8 transition-colors hover:border-primary hover:text-primary"
                        >
                          <Dumbbell className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  ) : (
                    <td className="px-4 py-3" />
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}