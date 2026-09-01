"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowLeft, Loader2, Plus, ShieldAlert } from "lucide-react"
import type { Tables } from "@/types/database.types"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import { useUserRoutines, type UserRoutine } from "../hooks/useUserRoutines"
import { useCreateFullRoutine, useUpdateFullRoutine } from "../hooks/useFullRoutine"
import { useDeleteRoutine, useUpdateRoutine } from "../hooks/useRoutines"
import { buildViewer, canCreateRoutineFor, canEditRoutine, type RoutineRow } from "../hooks/routine-helpers"
import { RoutineFormDialog, type DayDraft } from "./routine-form-dialog"
import { ConfirmDeleteRoutineDialog } from "./confirm-delete-routine-dialog"
import { EmptyState } from "./user-routines/empty-state"
import { Calendar } from "@/_features/shared/components/Calendar"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type ProfileRow = Pick<Tables<"users">, "id" | "first_name" | "last_name" | "role" | "coach_id">

export function UserRoutines({ profile }: { profile: ProfileRow }) {
  const { profile: sessionProfile } = useAuthSession()
  const { navigate } = usePageTransition()
  const viewerId = sessionProfile?.id ?? null
  const viewer = buildViewer(sessionProfile)
  const { data: routines = [], isLoading, error } = useUserRoutines(profile.id)
  const createRoutine = useCreateFullRoutine()
  const updateRoutine = useUpdateFullRoutine()
  const deleteRoutine = useDeleteRoutine()
  const toggleActive = useUpdateRoutine()
  const toggleShared = useUpdateRoutine()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RoutineRow | null>(null)
  const [deleting, setDeleting] = useState<RoutineRow | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = sectionRef.current
    if (!container || routines.length === 0) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(container.querySelectorAll("[data-routine-card]"), { clearProps: "all" })
      return
    }
    const cards = container.querySelectorAll("[data-routine-card]")
    const tl = gsap.timeline({ scrollTrigger: { trigger: container, start: "top 85%" } })
    tl.fromTo(cards, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out" })
    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [routines.length])

  const canCreate = canCreateRoutineFor(profile.id, viewer, (profile as Tables<"users">).coach_id ?? null)
  const canView = viewer.id === profile.id || viewer.role === "admin" || viewer.role === "coach"

  if (!canView) {
    return (
      <div className="relative flex min-h-[40vh] items-center justify-center px-4">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted/50">
            <ShieldAlert className="h-6 w-6 text-muted-foreground/60" />
          </span>
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">Acceso restringido</p>
          <p className="mt-2 text-sm text-muted-foreground">Solo el miembro, su coach o un administrador pueden ver esta rutina.</p>
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
  const handleSubmit = async ({ metadata, days }: { metadata: import("./routine-form-dialog").RoutineFormPayload; days: DayDraft[] }) => {
    if (editing) {
      await updateRoutine.mutateAsync({ routineId: editing.id, metadata, days, userId: profile.id })
    } else {
      if (!sessionProfile?.id) return
      await createRoutine.mutateAsync({ metadata, days, targetUserId: profile.id, authorId: sessionProfile.id })
    }
    setFormOpen(false)
    setEditing(null)
  }
  const handleToggleActive = async (routine: RoutineRow) => {
    if (!canEditRoutine(routine, viewer)) return
    await toggleActive.mutateAsync({ id: routine.id, dto: { is_active: !routine.is_active } })
  }
  const handleToggleShared = async (routine: RoutineRow) => {
    if (routine.created_by !== viewer.id) return
    await toggleShared.mutateAsync({ id: routine.id, dto: { is_shared: !routine.is_shared } })
  }
  const handleDelete = async () => {
    if (!deleting) return
    if (!canEditRoutine(deleting, viewer)) return
    await deleteRoutine.mutateAsync(deleting)
    setDeleting(null)
  }

  if (isLoading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando rutinas…
      </div>
    )
  if (error)
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <p>{error instanceof Error ? error.message : "Error al cargar rutinas"}</p>
      </div>
    )

  // Agrupa días por day_index para el calendario semanal (Drive-style 7 cols)
  const daysByIndex = new Map<number, Array<{ routine: UserRoutine; day: UserRoutine["routine_days"][number] }>>()
  for (const r of routines as UserRoutine[]) {
    for (const d of r.routine_days) {
      const arr = daysByIndex.get(d.day_index) ?? []
      arr.push({ routine: r, day: d })
      daysByIndex.set(d.day_index, arr)
    }
  }

  return (
    <div ref={sectionRef} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
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
        <Calendar
          renderDay={(dayIndex) => {
            const entries = daysByIndex.get(dayIndex) ?? []
            if (entries.length === 0) {
              return <span className="flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground/30">—</span>
            }
            return (
              <div className="flex flex-col gap-1.5">
                {entries.map(({ routine, day }) => (
                  <button
                    key={`${routine.id}-${day.id}`}
                    onClick={() => canEditRoutine(routine, viewer) && openEdit(routine)}
                    className="w-full cursor-pointer rounded-md border border-border bg-card px-2 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 text-xs"
                    title={`${routine.name} · ${day.focus}`}
                  >
                    <p className="truncate font-sans text-[11px] font-bold uppercase tracking-wide text-foreground">{routine.name}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">{day.focus} · {day.routine_exercises.length} ej.</p>
                  </button>
                ))}
              </div>
            )
          }}
        />
      )}
      {/* Lista detallada se mantiene colapsada bajo calendario para acciones (activar/compartir/borrar) */}
      {routines.length > 0 && (
        <div className="flex flex-col gap-2">
          {routines.map((routine) => (
            <div key={`actions-${routine.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <span className="truncate font-sans text-xs font-bold text-foreground">{routine.name}</span>
              <span className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(routine)}
                  disabled={!canEditRoutine(routine, viewer) || toggleActive.isPending}
                  className="rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  {routine.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => handleToggleShared(routine)}
                  disabled={routine.created_by !== viewer.id || toggleShared.isPending}
                  className="rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  {routine.is_shared ? "Privar" : "Compartir"}
                </button>
                <button
                  onClick={() => canEditRoutine(routine, viewer) && openEdit(routine)}
                  className="rounded-md bg-primary px-2 py-1 font-mono text-[10px] uppercase text-primary-foreground hover:opacity-90"
                >
                  Editar
                </button>
                <button
                  onClick={() => canEditRoutine(routine, viewer) && setDeleting(routine)}
                  className="rounded-md border border-destructive/40 px-2 py-1 font-mono text-[10px] uppercase text-destructive hover:bg-destructive/10"
                >
                  Borrar
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
      <RoutineFormDialog open={formOpen} routine={editing} targetUserId={profile.id} onClose={() => { setFormOpen(false); setEditing(null) }} onSubmit={handleSubmit} />
      <ConfirmDeleteRoutineDialog routine={deleting} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}
