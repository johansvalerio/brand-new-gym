"use client"

import { CalendarClock, Plus, Search } from "lucide-react"
import type { PlanRow } from "@/_features/gym-admin/plans/hooks/usePlans"
import { FilterPill } from "@/_features/shared/components/filter-pill"
import { ViewToggle, type ViewMode } from "@/_features/shared/components/view-toggle"

export type MembershipFilter = "all" | "active" | "expiring" | "expired" | "none"

const DAY_MS = 86_400_000

export function UsersToolbar({
  query,
  onQueryChange,
  membershipFilter,
  onMembershipFilterChange,
  planSlugFilter,
  onPlanSlugFilterChange,
  plans,
  view,
  onViewChange,
  canCreate,
  onCreate,
}: {
  query: string
  onQueryChange: (v: string) => void
  membershipFilter: MembershipFilter
  onMembershipFilterChange: (f: MembershipFilter) => void
  planSlugFilter: string
  onPlanSlugFilterChange: (slug: string) => void
  plans: PlanRow[]
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  canCreate: boolean
  onCreate: () => void
}) {
  return (
    <div className="mb-6 flex w-full flex-col gap-y-5">
      {/* Fila A: búsqueda + filtro de membresía */}
      <div className="flex flex-col gap-x-3 gap-y-5 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-56 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar miembro..."
            aria-label="Buscar miembro"
            className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="relative w-full sm:w-64">
          <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={membershipFilter}
            onChange={(e) => onMembershipFilterChange(e.target.value as MembershipFilter)}
            aria-label="Filtrar por membresía"
            className="w-full cursor-pointer appearance-none rounded-md border border-border bg-card px-4 py-3 pl-10 pr-8 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Toda membresía</option>
            <option value="active">Activos</option>
            <option value="expiring">Por vencer (≤7 días)</option>
            <option value="expired">Vencidos</option>
            <option value="none">Sin plan</option>
          </select>
        </div>
      </div>

      {/* Fila B: pills de plan */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Plan
        </span>
        <FilterPill
          active={planSlugFilter === "all"}
          onClick={() => onPlanSlugFilterChange("all")}
        >
          Todos
        </FilterPill>
        {plans.map((plan) => (
          <FilterPill
            key={plan.id}
            active={planSlugFilter === plan.slug}
            onClick={() => onPlanSlugFilterChange(plan.slug)}
          >
            {plan.name}
          </FilterPill>
        ))}
      </div>

      {/* Acciones: siempre debajo de los filtros, alineadas a la derecha */}
      <div className="flex items-center justify-end gap-3">
        <ViewToggle value={view} onChange={onViewChange} />

        <button
          onClick={onCreate}
          disabled={!canCreate}
          aria-label="Nuevo miembro"
          className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-4 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>
    </div>
  )
}
