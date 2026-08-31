"use client"

import { useMemo, useState } from "react"
import { CreditCard, Loader2, ShieldAlert } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  type PlanRow,
} from "../hooks/usePlans"
import { PlansStats } from "./plans-stats"
import { PlansToolbar } from "./plans-toolbar"
import { PlansCards } from "./plans-card"
import { PlansTable } from "./plans-table"
import { PlanFormDialog, type PlanFormPayload } from "./plan-form-dialog"
import { PlanConfirmDeleteDialog } from "./plan-confirm-delete-dialog"
import { planSlug } from "./plans-utils"

export function Plans() {
  const { isAdmin, loading: authLoading } = useAuthSession()
  const { data: plans = [], isLoading } = usePlans()
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const [view, setView] = useState<"cards" | "table">("cards")
  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PlanRow | null>(null)
  const [deleting, setDeleting] = useState<PlanRow | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return plans
    return plans.filter((p) => p.name.toLowerCase().includes(q))
  }, [plans, query])

  const stats = useMemo(() => {
    const active = plans.filter((p) => p.is_active).length
    return { total: plans.length, active, inactive: plans.length - active }
  }, [plans])

  const openCreate = () => {
    if (!isAdmin) return
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (plan: PlanRow) => {
    if (!isAdmin) return
    setEditing(plan)
    setFormOpen(true)
  }

  const handleSubmit = async (dto: PlanFormPayload) => {
    if (editing) {
      await updatePlan.mutateAsync({ id: editing.id, dto })
    } else {
      await createPlan.mutateAsync({
        ...dto,
        slug: planSlug(dto.name),
      })
    }
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = async () => {
    if (!deleting || !isAdmin) return
    await deletePlan.mutateAsync(deleting)
    setDeleting(null)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando acceso...
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
            Acceso restringido
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Solo el administrador puede gestionar los planes.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Membresía
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            Planes <span className="text-primary">&amp; Precios</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Gestiona los planes de membresía: precio, duración y disponibilidad.
            Los cambios se reflejan de inmediato en la página de precios.
          </p>
        </header>

        {/* Stats */}
        <PlansStats total={stats.total} active={stats.active} inactive={stats.inactive} />

        {/* Toolbar */}
        <PlansToolbar
          query={query}
          onQueryChange={setQuery}
          view={view}
          onViewChange={setView}
          onCreate={openCreate}
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando planes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-20 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-sans text-lg font-bold text-foreground">Sin planes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query ? "Prueba con otro término de búsqueda." : "Agrega tu primer plan de membresía."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: siempre tarjetas; la tabla solo existe ≥sm */}
            <div className={view === "table" ? "sm:hidden" : undefined}>
              <PlansCards plans={filtered} onEdit={openEdit} onDelete={setDeleting} />
            </div>
            {view === "table" && (
              <div className="hidden sm:block">
                <PlansTable plans={filtered} onEdit={openEdit} onDelete={setDeleting} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <PlanFormDialog
        open={formOpen}
        plan={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />
      <PlanConfirmDeleteDialog
        plan={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </section>
  )
}