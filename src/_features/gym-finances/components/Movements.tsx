"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Filter, Loader2, ShieldAlert, ClipboardList } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { currency } from "@/_features/gym-admin/products/components/utils"
import {
  useAuditLog,
  diffAudit,
  summarizeAuditRow,
  type AuditFilter,
  type AuditLogRow,
} from "../hooks/useAuditLog"

const ACTION_LABEL: Record<string, string> = {
  insert: "Insertó",
  update: "Actualizó",
  delete: "Eliminó",
}
const ACTION_ICON: Record<string, string> = {
  insert: "bg-primary/15 text-primary border-primary/30",
  update: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  delete: "bg-destructive/15 text-destructive border-destructive/30",
}

const TABLES = ["users", "plans", "products", "categories", "payments", "product_sales", "expenses", "recurring_incomes"] as const
const TABLE_LABEL: Record<string, string> = {
  users: "Usuarios",
  plans: "Planes",
  products: "Productos",
  categories: "Categorías",
  payments: "Membresías",
  product_sales: "Ventas",
  expenses: "Egresos",
  recurring_incomes: "Rentas fijas",
}

function pickAmount(data: unknown): number | null {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const a = (data as Record<string, unknown>).amount
    if (typeof a === "number") return a
    if (typeof a === "string") {
      const n = parseFloat(a)
      if (Number.isFinite(n)) return n
    }
  }
  return null
}

function AuditRow({ row, open, onToggle }: { row: AuditLogRow; open: boolean; onToggle: () => void }) {
  const actor = `${row.actor?.first_name ?? "Sistema"} ${row.actor?.last_name ?? ""}`.trim() || "Sistema"
  const target = summarizeAuditRow(row.table_name, row)
  const amount = pickAmount(row.new_data) ?? pickAmount(row.old_data)
  const changes = row.action === "update" ? diffAudit(row.old_data as Record<string, unknown> | null, row.new_data as Record<string, unknown> | null) : []

  return (
    <li className="border-b border-border/40 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-[9px] font-bold uppercase tracking-wider ${ACTION_ICON[row.action] ?? "bg-secondary text-muted-foreground border-border"}`}
        >
          {row.action}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-bold text-foreground">
            <span className="text-primary">{actor}</span> {ACTION_LABEL[row.action] ?? row.action}{" "}
            {TABLE_LABEL[row.table_name] ?? row.table_name}
            <span className="ml-2 font-mono text-[10px] text-muted-foreground">· {target}</span>
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {new Date(row.created_at).toLocaleString("es-CR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            {amount != null ? ` · ${currency(Number(amount))}` : ""}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="border-t border-border/40 bg-secondary/20 px-4 py-3">
          {changes.length > 0 ? (
            <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {changes.map((c) => (
                <div key={c.field} className="flex items-baseline gap-2">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{c.field}</dt>
                  <dd className="truncate font-mono text-xs text-foreground">
                    <span className="text-muted-foreground/70">{c.before}</span> <span className="text-primary">→</span>{" "}
                    <span className="font-bold">{c.after}</span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="font-mono text-xs text-muted-foreground">
              {row.action === "insert"
                ? "Registro nuevo."
                : row.action === "delete"
                  ? "Registro eliminado."
                  : "Sin campos modificados."}
            </p>
          )}
        </div>
      ) : null}
    </li>
  )
}

export function Movements() {
  const { isAdmin, loading: authLoading } = useAuthSession()
  const { rows, hasMore, loadMore, filter, setFilter, isLoading, error } = useAuditLog()
  const [openId, setOpenId] = useState<string | null>(null)

  const actorOptions = useMemo(() => {
    const seen = new Map<string, string>()
    // saca actores únicos del log actual (mejor UX sin consulta extra)
    for (const r of rows) {
      const name = `${r.actor?.first_name ?? ""} ${r.actor?.last_name ?? ""}`.trim()
      if (name) seen.set(r.actor_user_id ?? name, name)
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }))
  }, [rows])

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
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">Acceso restringido</p>
          <p className="mt-2 text-sm text-muted-foreground">Solo el administrador puede ver los movimientos.</p>
        </div>
      </section>
    )
  }

  const setF = (k: keyof AuditFilter) => (v: string) => setFilter({ ...filter, [k]: v })

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-6">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Auditoría
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            Movi<span className="text-primary">mientos</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Bitácora inmutable: quién hizo qué y cuándo. Solo el administrador la ve.
          </p>
        </header>

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <select
              aria-label="Filtrar por acción"
              value={filter.action}
              onChange={(e) => setF("action")(e.target.value)}
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-2 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="">Acción</option>
              <option value="insert">Insertó</option>
              <option value="update">Actualizó</option>
              <option value="delete">Eliminó</option>
            </select>
          </div>
          <select
            aria-label="Filtrar por tabla"
            value={filter.table}
            onChange={(e) => setF("table")(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="">Tabla</option>
            {TABLES.map((t) => (
              <option key={t} value={t}>
                {TABLE_LABEL[t]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por usuario"
            value={filter.actor}
            onChange={(e) => setF("actor")(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="">Quién</option>
            {actorOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <input
            value={filter.search}
            onChange={(e) => setF("search")(e.target.value)}
            placeholder="Buscar en el diff…"
            className="col-span-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary sm:col-span-1"
          />
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : String(error)}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-6 py-20 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando movimientos...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-20 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-sans text-lg font-bold text-foreground">Sin movimientos</p>
            <p className="mt-1 text-sm text-muted-foreground">Aún no hay cambios registrados en la auditoría.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <ol>
              {rows.map((r) => (
                <AuditRow key={r.id} row={r} open={openId === r.id} onToggle={() => setOpenId(openId === r.id ? null : r.id)} />
              ))}
            </ol>
            {hasMore ? (
              <div className="border-t border-border/40 px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="cursor-pointer font-mono text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  Cargar más
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
