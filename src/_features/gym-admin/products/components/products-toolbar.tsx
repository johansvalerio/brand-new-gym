"use client"

import { Filter, Plus, Search } from "lucide-react"
import type { CategoryRow } from "@/_features/gym-admin/products/hooks/useCategories"
import { ViewToggle, type ViewMode } from "@/_features/shared/components/view-toggle"

export function ProductsToolbar({
  query,
  onQueryChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  view,
  onViewChange,
  canCreate,
  onCreate,
}: {
  query: string
  onQueryChange: (v: string) => void
  categoryFilter: string
  onCategoryFilterChange: (slug: string) => void
  categories: CategoryRow[]
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  canCreate: boolean
  onCreate: () => void
}) {
  return (
    <div className="mb-6 flex w-full flex-col gap-y-5">
      {/* Fila A: búsqueda + filtro de categoría */}
      <div className="flex flex-col gap-x-3 gap-y-5 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-56 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            aria-label="Filtrar por categoría"
            className="w-full cursor-pointer appearance-none rounded-md border border-border bg-card py-3 pl-10 pr-8 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Acciones: siempre debajo de los filtros, alineadas a la derecha */}
      <div className="flex items-center justify-end gap-3">
        <ViewToggle value={view} onChange={onViewChange} />

        <button
          onClick={onCreate}
          disabled={!canCreate}
          aria-label="Nuevo producto"
          className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-4 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>
    </div>
  )
}
