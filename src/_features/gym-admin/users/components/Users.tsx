"use client"

import { useMemo, useState } from "react"
import { LayoutGrid, Table2, Plus, Search, User as UserIcon, Loader2 } from "lucide-react"
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/_features/gym-admin/users/hooks/useUsers"
import type { UserRow } from "@/_features/gym-admin/users/hooks/useUsers"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useCoaches } from "@/_features/gym-admin/users/hooks/useCoaches"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import { UsersCards } from "./users-card"
import { UsersTable } from "./users-table"
import { UserFormDialog, type UserFormPayload } from "./user-form-dialog"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"

type ViewMode = "cards" | "table"

export function Users() {
  const { data: users = [], isLoading, error } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const { isAdmin, isCoach, loading: authLoading } = useAuthSession()
  const { data: coaches = [] } = useCoaches()
  const { navigate } = usePageTransition()
  const [view, setView] = useState<ViewMode>("cards")
  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState<UserRow | null>(null)
  
  const canViewUsers = isAdmin || isCoach
  const canManageUsers = isAdmin
  const canAssignRoutine = isAdmin || isCoach

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users

    return users.filter((user) => {
      const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim().toLowerCase()
      return (
        fullName.includes(q) ||
        (user.email ?? "").toLowerCase().includes(q) ||
        (user.phone ?? "").toLowerCase().includes(q)
      )
    })
  }, [users, query])

  const stats = useMemo(() => {
    const active = users.filter((u) => u.membership_status === "active").length
    const premium = users.filter(
      (u) => u.membership_plan === "premium" || u.membership_plan === "elite",
    ).length

    return { total: users.length, active, premium }
  }, [users])

  const openCreate = () => {
    if (!canManageUsers) return
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (user: UserRow) => {
    if (!canManageUsers) return
    setEditing(user)
    setFormOpen(true)
  }

  const handleSubmit = async (payload: UserFormPayload) => {
    if (!canManageUsers) return
    if (editing) {
      await updateUser.mutateAsync({
        id: editing.id,
        dto: {
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          phone: payload.phone,
          avatar: payload.avatar,
          role: payload.role,
          coach_id: payload.coach_id,
          membership_status: payload.membership_status,
          membership_plan: payload.membership_plan,
        },
      })
    } else {
      await createUser.mutateAsync({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        avatar: payload.avatar,
        role: payload.role,
        coach_id: payload.coach_id,
        membership_status: payload.membership_status,
        membership_plan: payload.membership_plan,
        join_date: new Date().toISOString(),
        last_visit: new Date().toISOString(),
      })
    }
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = async () => {
    if (!canManageUsers || !deleting) return
    await deleteUser.mutateAsync(deleting)
    setDeleting(null)
  }

  if (authLoading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando acceso del administrador...
      </section>
    )
  }

  if (!canViewUsers) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-background">
        <div className="relative z-10 mx-auto flex max-w-4xl items-center justify-center px-4 py-20 text-center">
          <div className="rounded-lg border border-border bg-card px-8 py-10 shadow-sm">
            <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">Acceso restringido</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Solo los usuarios con rol <span className="font-semibold text-primary">admin o coach</span> pueden ver los miembros.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Members
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            Gym <span className="text-primary">Members</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Gestiona los miembros del gimnasio. Cambia entre vista de tarjetas y tabla
            para comparar cuál te sirve mejor.
          </p>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-3 sm:max-w-xl">
          <Stat label="Total" value={String(stats.total)} />
          <Stat label="Activos" value={String(stats.active)} />
          <Stat label="Premium" value={String(stats.premium)} />
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar miembro..."
              aria-label="Buscar miembro"
              className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-3">
            <div
              role="tablist"
              aria-label="Cambiar vista"
              className="flex items-center gap-1 rounded-md border border-border bg-card p-1"
            >
              <ToggleBtn active={view === "cards"} onClick={() => setView("cards")} label="Tarjetas">
                <LayoutGrid className="h-4 w-4" />
              </ToggleBtn>
              <ToggleBtn active={view === "table"} onClick={() => setView("table")} label="Tabla">
                <Table2 className="h-4 w-4" />
              </ToggleBtn>
            </div>

            <button
              onClick={openCreate}
              className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-4 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : String(error)}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-6 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando miembros desde Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-20 text-center">
            <UserIcon className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-sans text-lg font-bold text-foreground">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query ? "Prueba con otro término de búsqueda." : "Agrega tu primer miembro."}
            </p>
          </div>
        ) : view === "cards" ? (
          <UsersCards 
            users={filtered} 
            onEdit={openEdit} 
            onDelete={setDeleting} 
            onView={(u) => navigate(`/users/profile/${u.id}`)} 
            onAssignRoutine={(u) => navigate(`/users/profile/${u.id}/routine`)}
            canManage={canManageUsers} 
            canAssignRoutine={canAssignRoutine}
          />
        ) : (
          <UsersTable 
            users={filtered} 
            onEdit={openEdit} 
            onDelete={setDeleting} 
            onView={(u) => navigate(`/users/profile/${u.id}`)} 
            onAssignRoutine={(u) => navigate(`/users/profile/${u.id}/routine`)}
            canManage={canManageUsers} 
            canAssignRoutine={canAssignRoutine}
          />
        )}
      </div>

      <UserFormDialog
        open={formOpen}
        user={editing}
        coaches={coaches}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        user={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-sans text-xl font-black text-foreground">{value}</p>
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={label}
      className={`flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {children}
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}