"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarRange, Dumbbell, MoreVertical, Pencil, Share2, Sparkles, Target, Trash2, User as UserIcon } from "lucide-react"
import { authorBadgeKind, type UserRoutine } from "../../hooks/useUserRoutines"
import { goalLabel, type RoutineRow } from "../../hooks/routine-helpers"
import { DayPanel } from "./day-panel"
import { MenuItem, ToggleRow } from "./card-menu"

function authorLabel(routine: UserRoutine) {
  const author = routine.author
  if (!author) return "Autor desconocido"
  const name = `${author.first_name ?? ""} ${author.last_name ?? ""}`.trim()
  if (!name) return "Autor sin nombre"
  return name
}

function AuthorBadge({ routine, viewerId }: { routine: UserRoutine; viewerId: string | null | undefined }) {
  const kind = authorBadgeKind(routine, viewerId)
  if (kind === "self")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
        <Sparkles className="h-3 w-3" />
        Tu rutina
      </span>
    )
  if (kind === "coach")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-yellow-500">
        <Dumbbell className="h-3 w-3" />
        De tu coach
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <UserIcon className="h-3 w-3" />
      Asignada
    </span>
  )
}

export function RoutineCard({
  routine,
  viewerId,
  canEdit,
  onEdit,
  onDelete,
  onToggleActive,
  toggleActivePending,
  onToggleShared,
  toggleSharedPending,
}: {
  routine: UserRoutine
  viewerId: string | null | undefined
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  toggleActivePending: boolean
  onToggleShared: () => void
  toggleSharedPending: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener("mousedown", onClick)
    return () => window.removeEventListener("mousedown", onClick)
  }, [menuOpen])

  const isAuthor = Boolean(viewerId) && routine.created_by === viewerId
  const showMenu = canEdit || isAuthor
  const routineRow: RoutineRow = {
    id: routine.id,
    name: routine.name,
    goal: routine.goal,
    days_per_week: routine.days_per_week,
    notes: routine.notes,
    is_active: routine.is_active,
    is_shared: routine.is_shared,
    created_at: routine.created_at,
    updated_at: routine.updated_at,
    created_by: routine.created_by,
    user_id: routine.user_id,
    gym_id: routine.gym_id,
  }
  void routineRow

  return (
    <article
      data-routine-card
      className={`group relative overflow-hidden rounded-lg border bg-card transition-colors duration-300 ${routine.is_active ? "border-border hover:border-primary/40" : "border-border/40 opacity-60 hover:opacity-90"}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
      <header className="relative flex flex-col gap-4 border-b border-border/60 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <AuthorBadge routine={routine} viewerId={viewerId} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Target className="h-3 w-3" />
              {goalLabel(routine.goal)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <CalendarRange className="h-3 w-3" />
              {routine.days_per_week} días/semana
            </span>
            {!routine.is_active ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-yellow-500">Inactiva</span>
            ) : null}
            {routine.is_shared ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
                <Share2 className="h-3 w-3" />
                Compartida
              </span>
            ) : null}
          </div>
          <h2 className="font-sans text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-3xl">{routine.name}</h2>
          <p className="font-mono text-xs text-muted-foreground">
            Creada por <span className="text-foreground">{authorLabel(routine)}</span> ·{" "}
            {new Date(routine.created_at).toLocaleDateString("es-CR", { year: "numeric", month: "short", day: "numeric" })}
          </p>
          {routine.notes ? <p className="mt-1 font-mono text-sm leading-relaxed text-muted-foreground">{routine.notes}</p> : null}
        </div>
        {showMenu ? (
          <div className="relative" ref={menuRef}>
            <button type="button" onClick={() => setMenuOpen((o) => !o)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9" aria-label="Acciones de rutina" aria-expanded={menuOpen}>
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div role="menu" className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-md border border-border bg-card shadow-2xl">
                {canEdit ? <MenuItem icon={<Pencil className="h-4 w-4" />} label="Editar" onClick={() => { setMenuOpen(false); onEdit() }} /> : null}
                {canEdit ? <ToggleRow label="Activa" checked={routine.is_active} disabled={toggleActivePending} onToggle={onToggleActive} /> : null}
                {isAuthor ? <ToggleRow label="Compartida" checked={routine.is_shared} disabled={toggleSharedPending} onToggle={onToggleShared} /> : null}
                {canEdit ? (
                  <>
                    <div role="separator" className="my-1 h-px bg-border" />
                    <MenuItem icon={<Trash2 className="h-4 w-4" />} label="Eliminar" variant="destructive" onClick={() => { setMenuOpen(false); onDelete() }} />
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </header>
      <div className="relative grid grid-cols-1 gap-4 p-4 md:grid-cols-2 sm:p-6">
        {routine.routine_days.map((day) => (
          <DayPanel key={day.id} day={day} />
        ))}
      </div>
    </article>
  )
}
