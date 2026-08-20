"use client"

import { useMemo, useState } from "react"
import { LayoutGrid, Table2, Plus, Search, User as UserIcon } from "lucide-react"
import type { CreateUserDto, User } from "@/_features/gym-admin/users/types"
import { mockUsers } from "@/_features/gym-admin/users/data/mock"
import { UsersCards } from "./users-card"
import { UsersTable } from "./users-table"
import { UserFormDialog } from "./user-form-dialog"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"

type ViewMode = "cards" | "table"

export function Users() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [view, setView] = useState<ViewMode>("cards")
  const [query, setQuery] = useState("")

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.user_first_name.toLowerCase().includes(q) ||
        u.user_last_name.toLowerCase().includes(q) ||
        u.user_email.toLowerCase().includes(q),
    )
  }, [users, query])

  const stats = useMemo(() => {
    const active = users.filter((u) => u.user_membership_status === "active").length
    const premium = users.filter((u) => u.user_membership_plan === "premium" || u.user_membership_plan === "elite").length
    return { total: users.length, active, premium }
  }, [users])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    setFormOpen(true)
  }

  const handleSubmit = (dto: CreateUserDto) => {
    const now = new Date().toISOString()
    if (editing) {
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editing.user_id ? { ...u, ...dto, user_updated_at: now } : u,
        ),
      )
    } else {
      const nextId = users.reduce((max, u) => Math.max(max, u.user_id), 0) + 1
      setUsers((prev) => [
        { user_id: nextId, ...dto, user_created_at: now, user_updated_at: now },
        ...prev,
      ])
    }
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = () => {
    if (!deleting) return
    setUsers((prev) => prev.filter((u) => u.user_id !== deleting.user_id))
    setDeleting(null)
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

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-20 text-center">
            <UserIcon className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-sans text-lg font-bold text-foreground">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query ? "Prueba con otro término de búsqueda." : "Agrega tu primer miembro."}
            </p>
          </div>
        ) : view === "cards" ? (
          <UsersCards users={filtered} onEdit={openEdit} onDelete={setDeleting} />
        ) : (
          <UsersTable users={filtered} onEdit={openEdit} onDelete={setDeleting} />
        )}
      </div>

      <UserFormDialog
        open={formOpen}
        user={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />
      <ConfirmDeleteDialog user={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
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
      className={`flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}