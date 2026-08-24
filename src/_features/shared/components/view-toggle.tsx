"use client"

import { LayoutGrid, Table2 } from "lucide-react"

export type ViewMode = "cards" | "table"

const btnCls =
  "flex cursor-pointer items-center gap-2 rounded p-2.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors sm:px-3 sm:py-1.5"

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (v: ViewMode) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Cambiar vista"
      className="hidden items-center gap-1 rounded-md border border-border bg-card p-1 sm:flex"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "cards"}
        title="Tarjetas"
        onClick={() => onChange("cards")}
        className={`${btnCls} ${
          value === "cards"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden md:inline">Tarjetas</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "table"}
        title="Tabla"
        onClick={() => onChange("table")}
        className={`${btnCls} ${
          value === "table"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Table2 className="h-4 w-4" />
        <span className="hidden md:inline">Tabla</span>
      </button>
    </div>
  )
}
