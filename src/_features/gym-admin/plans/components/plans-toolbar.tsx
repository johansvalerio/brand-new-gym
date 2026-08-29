"use client"

import { Plus, Search } from "lucide-react"
import { ViewToggle, type ViewMode } from "@/_features/shared/components/view-toggle"

export function PlansToolbar({
  query,
  onQueryChange,
  view,
  onViewChange,
  onCreate,
}: {
  query: string
  onQueryChange: (v: string) => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  onCreate: () => void
}) {
  return (
    <div className="mb-6 flex w-full flex-col gap-y-5">
      <div className="flex flex-col gap-x-3 gap-y-5 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-auto sm:flex-1 sm:min-w-56 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar plan..."
            aria-label="Buscar plan"
            className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <ViewToggle value={view} onChange={onViewChange} />
        <button
          onClick={onCreate}
          aria-label="Nuevo plan"
          className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-4 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>
    </div>
  )
}