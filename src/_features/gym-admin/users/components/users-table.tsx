"use client"

import { User, Pencil, Trash2, Shield, Clock } from "lucide-react"
import type { User as UserType } from "@/_features/gym-admin/users/types"
import { membershipBadgeClasses, membershipLabel, statusBadgeClasses, statusLabel } from "./utils"

interface UsersTableProps {
  users: UserType[]
  onEdit: (user: UserType) => void
  onDelete: (user: UserType) => void
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["ID", "Miembro", "Email", "Plan", "Estado", "Última visita", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${
                    i === 5 ? "text-right" : ""
                  } ${i === 6 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const statusBadge = statusBadgeClasses(user.user_membership_status)
              const planBadge = membershipBadgeClasses(user.user_membership_plan)
              return (
                <tr
                  key={user.user_id}
                  className="group border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    #{String(user.user_id).padStart(3, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
                        {user.user_avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.user_avatar}
                            alt={`${user.user_first_name} ${user.user_last_name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-sans text-sm font-semibold text-foreground">
                          {user.user_first_name} {user.user_last_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.user_phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.user_email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${planBadge}`}
                    >
                      {membershipLabel(user.user_membership_plan)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}
                    >
                      {statusLabel(user.user_membership_status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-muted-foreground">
                    {new Date(user.user_last_visit).toLocaleDateString("es-EC", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(user)}
                        aria-label={`Editar ${user.user_first_name} ${user.user_last_name}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        aria-label={`Eliminar ${user.user_first_name} ${user.user_last_name}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}