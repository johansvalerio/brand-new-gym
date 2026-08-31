"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowLeft, Loader2, Plus, ShieldAlert } from "lucide-react"
import type { Tables } from "@/types/database.types"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import { useUserRoutines } from "../../hooks/useUserRoutines"
import { useCreateFullRoutine, useUpdateFullRoutine } from "../../hooks/useFullRoutine"
import { useDeleteRoutine, useUpdateRoutine } from "../../hooks/useRoutines"
import { buildViewer, canCreateRoutineFor, canEditRoutine, type RoutineRow } from "../../hooks/routine-helpers"
import { RoutineFormDialog, type DayDraft } from "../routine-form-dialog"
import { ConfirmDeleteRoutineDialog } from "../confirm-delete-routine-dialog"
import { EmptyState } from "./empty-state"
import { RoutineCard } from "./routine-card"

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
          <button onClick={() => navigate("/")} className="mt-6 cursor-pointer rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90">
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
  const handleSubmit = async ({ metadata, days }: { metadata: import("../routine-form-dialog").RoutineFormPayload; days: DayDraft[] }) => {
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

  return (
    <div ref={sectionRef} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(`/users/profile/${profile.id}`)} className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </button>
        {canCreate ? (
          <button onClick={openCreate} className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90">
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
            toggleActivePending={toggleActive.isPending}
            onToggleShared={() => handleToggleShared(routine)}
            toggleSharedPending={toggleShared.isPending}
          />
        ))
      )}
      <RoutineFormDialog open={formOpen} routine={editing} targetUserId={profile.id} onClose={() => { setFormOpen(false); setEditing(null) }} onSubmit={handleSubmit} />
      <ConfirmDeleteRoutineDialog routine={deleting} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}
