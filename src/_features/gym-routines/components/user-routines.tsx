"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ArrowLeft,
  CalendarRange,
  Dumbbell,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  User as UserIcon,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import type { Tables } from "@/types/database.types"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import {
  authorBadgeKind,
  useUserRoutines,
  type UserRoutine,
} from "../hooks/useUserRoutines"
import {
  useCreateFullRoutine,
  useUpdateFullRoutine,
} from "../hooks/useFullRoutine"
import {
  useDeleteRoutine,
  useUpdateRoutine,
} from "../hooks/useRoutines"
import {
  buildViewer,
  canCreateRoutineFor,
  canEditRoutine,
  goalLabel,
  type RoutineRow,
} from "../hooks/routine-helpers"
import {
  RoutineFormDialog,
  type DayDraft,
} from "./routine-form-dialog"
import { ConfirmDeleteRoutineDialog } from "./confirm-delete-routine-dialog"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type ProfileRow = Pick<Tables<"users">, "id" | "first_name" | "last_name" | "role" | "coach_id">

const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
]

function authorLabel(routine: UserRoutine) {
  const author = routine.author
  if (!author) return "Autor desconocido"
  const name = `${author.first_name ?? ""} ${author.last_name ?? ""}`.trim()
  if (!name) return "Autor sin nombre"
  return name
}

function AuthorBadge({
  routine,
  viewerId,
}: {
  routine: UserRoutine
  viewerId: string | null | undefined
}) {
  const kind = authorBadgeKind(routine, viewerId)

  if (kind === "self") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
        <Sparkles className="h-3 w-3" />
        Tu rutina
      </span>
    )
  }
  if (kind === "coach") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-yellow-500">
        <Dumbbell className="h-3 w-3" />
        De tu coach
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <UserIcon className="h-3 w-3" />
      Asignada
    </span>
  )
}

export function UserRoutines({ profile }: { profile: ProfileRow }) {
  const { profile: sessionProfile } = useAuthSession()
  const { navigate } = usePageTransition()
  const viewerId = sessionProfile?.id ?? null
  const viewer = buildViewer(sessionProfile)

  const {
    data: routines = [],
    isLoading,
    error,
  } = useUserRoutines(profile.id)

  const createRoutine = useCreateFullRoutine()
  const updateRoutine = useUpdateFullRoutine()
  const deleteRoutine = useDeleteRoutine()
  const toggleActive = useUpdateRoutine()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RoutineRow | null>(null)
  const [deleting, setDeleting] = useState<RoutineRow | null>(null)

  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = sectionRef.current
    if (!container || routines.length === 0) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(container.querySelectorAll("[data-routine-card]"), {
        clearProps: "all",
      })
      return
    }

    const cards = container.querySelectorAll("[data-routine-card]")
    const tl = gsap.timeline({
      scrollTrigger: { trigger: container, start: "top 85%" },
    })

    tl.fromTo(
      cards,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out" },
    )

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [routines.length])

  const canCreate = canCreateRoutineFor(
    profile.id,
    viewer,
    (profile as Tables<"users">).coach_id ?? null,
  )

  // Guard de vista: propio perfil, admin o coach. RLS protege los datos;
  // esto evita el estado "Sin rutinas" engañoso para quienes no deberían ver nada.
  const canView = viewer.id === profile.id || viewer.role === "admin" || viewer.role === "coach"

  if (!canView) {
    return (
      <div className="relative flex min-h-[40vh] items-center justify-center px-4">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted/50">
            <ShieldAlert className="h-6 w-6 text-muted-foreground/60" />
          </span>
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
            Acceso restringido
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Solo el miembro, su coach o un administrador pueden ver esta rutina.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 cursor-pointer rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const openCreate = () => {
    if (!canCreate) return
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (routine: RoutineRow) => {
    if (!canEditRoutine(routine, viewer)) return
    setEditing(routine)
    setFormOpen(true)
  }

  const handleSubmit = async ({
    metadata,
    days,
  }: {
    metadata: import("./routine-form-dialog").RoutineFormPayload
    days: DayDraft[]
  }) => {
    if (editing) {
      await updateRoutine.mutateAsync({
        routineId: editing.id,
        metadata,
        days,
        userId: profile.id,
      })
    } else {
      if (!sessionProfile?.id) return
      await createRoutine.mutateAsync({
        metadata,
        days,
        targetUserId: profile.id,
        authorId: sessionProfile.id,
      })
    }
    setFormOpen(false)
    setEditing(null)
  }

  const handleToggleActive = async (routine: RoutineRow) => {
    if (!canEditRoutine(routine, viewer)) return
    await toggleActive.mutateAsync({
      id: routine.id,
      dto: { is_active: !routine.is_active },
    })
  }

  const handleDelete = async () => {
    if (!deleting) return
    if (!canEditRoutine(deleting, viewer)) return
    await deleteRoutine.mutateAsync(deleting)
    setDeleting(null)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando rutinas…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <p>{error instanceof Error ? error.message : "Error al cargar rutinas"}</p>
      </div>
    )
  }

  return (
    <div ref={sectionRef} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(`/users/profile/${profile.id}`)}
          className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </button>

        {canCreate ? (
          <button
            onClick={openCreate}
            className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nueva rutina
          </button>
        ) : null}
      </div>

      {routines.length === 0 ? (
        <EmptyState profile={profile} viewerId={viewerId} navigate={navigate} />
      ) : (
        routines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            viewerId={viewerId}
            canEdit={canEditRoutine(routine, viewer)}
            onEdit={() => openEdit(routine)}
            onDelete={() => setDeleting(routine)}
            onToggleActive={() => handleToggleActive(routine)}
            togglePending={toggleActive.isPending}
          />
        ))
      )}

      <RoutineFormDialog
        open={formOpen}
        routine={editing}
        targetUserId={profile.id}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteRoutineDialog
        routine={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function EmptyState({
  profile,
  viewerId,
  navigate,
}: {
  profile: ProfileRow
  viewerId: string | null | undefined
  navigate: (href: string) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
          <CalendarRange className="h-6 w-6" />
        </span>
        <h3 className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
          Sin rutinas todavía
        </h3>
        <p className="font-mono text-sm leading-relaxed text-muted-foreground">
          {viewerId === profile.id
            ? "Tu coach aún no te ha asignado una rutina. Cuando lo haga, aparecerá aquí."
            : "Este miembro no tiene rutinas asignadas por ahora."}
        </p>
        <button
          onClick={() => navigate(`/users/profile/${profile.id}`)}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </button>
      </div>
    </div>
  )
}

function RoutineCard({
  routine,
  viewerId,
  canEdit,
  onEdit,
  onDelete,
  onToggleActive,
  togglePending,
}: {
  routine: UserRoutine
  viewerId: string | null | undefined
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  togglePending: boolean
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

  const routineRow: RoutineRow = {
    id: routine.id,
    name: routine.name,
    goal: routine.goal,
    days_per_week: routine.days_per_week,
    notes: routine.notes,
    is_active: routine.is_active,
    created_at: routine.created_at,
    updated_at: routine.updated_at,
    created_by: routine.created_by,
    user_id: routine.user_id,
  }

  return (
    <article
      data-routine-card
      className={`group relative overflow-hidden rounded-lg border bg-card transition-colors duration-300 ${
        routine.is_active
          ? "border-border hover:border-primary/40"
          : "border-border/40 opacity-60 hover:opacity-90"
      }`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <header className="relative flex flex-col gap-4 border-b border-border/60 p-6 sm:flex-row sm:items-start sm:justify-between">
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                Inactiva
              </span>
            ) : null}
          </div>
          <h2 className="font-sans text-2xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-3xl">
            {routine.name}
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            Creada por{" "}
            <span className="text-foreground">{authorLabel(routine)}</span>
            {" · "}
            {new Date(routine.created_at).toLocaleDateString("es-CR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          {routine.notes ? (
            <p className="mt-1 font-mono text-sm leading-relaxed text-muted-foreground">
              {routine.notes}
            </p>
          ) : null}
        </div>

        {canEdit ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label="Acciones de rutina"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-md border border-border bg-card shadow-2xl"
              >
                <MenuItem
                  icon={<Pencil className="h-4 w-4" />}
                  label="Editar"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit()
                  }}
                />
                <MenuItem
                  icon={<Power className="h-4 w-4" />}
                  label={routine.is_active ? "Desactivar" : "Activar"}
                  disabled={togglePending}
                  onClick={() => {
                    setMenuOpen(false)
                    onToggleActive()
                  }}
                />
                <MenuItem
                  icon={<Trash2 className="h-4 w-4" />}
                  label="Eliminar"
                  variant="destructive"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="relative grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        {routine.routine_days.map((day) => (
          <DayPanel key={day.id} day={day} />
        ))}
      </div>
    </article>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
  disabled,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 font-sans text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === "destructive"
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-primary hover:text-primary-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function DayPanel({
  day,
}: {
  day: UserRoutine["routine_days"][number]
}) {
  const dayName = DAY_NAMES[day.day_index - 1] ?? `Día ${day.day_index}`

  return (
    <div className="overflow-hidden rounded-md border border-border/70 bg-secondary/30">
      <header className="flex items-center justify-between border-b border-border/60 bg-secondary/60 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {dayName}
          </p>
          <h3 className="font-sans text-base font-black uppercase tracking-tight text-foreground">
            {day.focus}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {day.routine_exercises.length} ejercicios
        </span>
      </header>

      {day.routine_exercises.length === 0 ? (
        <p className="px-4 py-6 font-mono text-xs text-muted-foreground">
          Sin ejercicios en este día.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/40">
                {["Ejercicio", "Sets", "Reps", "Descanso"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {day.routine_exercises.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border/30 last:border-0"
                >
                  <td className="px-3 py-2">
                    <p className="font-sans text-sm font-semibold text-foreground">
                      {item.exercise.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {item.exercise.muscle_group}
                      {item.exercise.equipment
                        ? ` · ${item.exercise.equipment}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-3 py-2 font-sans text-sm font-bold text-primary">
                    {item.sets}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm text-foreground">
                    {item.reps}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {item.rest_seconds}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Mantener imports no usados fuera del bundle
void useQueryClient
