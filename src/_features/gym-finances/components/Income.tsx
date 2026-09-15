"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Banknote,
  Loader2,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat,
  Scale,
  ShieldAlert,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { useExpenses } from "../hooks/useExpenses"
import {
  useCreateRecurringIncome,
  useDeleteRecurringIncome,
  useRecurringIncomes,
  useToggleRecurringIncome,
  useUpdateRecurringIncome,
  type RecurringIncomeRow,
} from "../hooks/useRecurringIncomes"
import { startOfMonthUtc, useIncome } from "../hooks/useIncome"
import { RecurringIncomeDialog, type RecurringIncomeFormPayload } from "./recurring-income-dialog"
import { RecurringIncomeConfirmDeleteDialog } from "./recurring-income-confirm-delete-dialog"

// Espejo de AdminCharts: misma paleta alto contraste y tooltip dark.
const COLORS = ["#96D906", "#E63946", "#4CC9F0", "#F08C00", "#FFD60A", "#9B5DE5"]

const tip = {
  contentStyle: { background: "#09090b", border: "1px solid #1a1a1a", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#a1a1aa" },
}

function ChartCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">{icon}</span>
        {title}
      </h3>
      <div className="h-[200px]">{children}</div>
    </div>
  )
}

const SOURCE_BADGE: Record<string, string> = {
  membership: "border-primary/30 bg-primary/10 text-primary",
  product: "border-[#F08C00]/30 bg-[#F08C00]/10 text-[#F08C00]",
  rent: "border-[#4CC9F0]/30 bg-[#4CC9F0]/10 text-[#4CC9F0]",
}

const SOURCE_LABEL: Record<string, string> = {
  membership: "Membresía",
  product: "Producto",
  rent: "Renta",
}

export function Income() {
  const { isStaff, loading: authLoading } = useAuthSession()
  const { data: income, isLoading: incomeLoading } = useIncome()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses()
  const { data: rents = [], isLoading: rentsLoading } = useRecurringIncomes()
  const createRent = useCreateRecurringIncome()
  const updateRent = useUpdateRecurringIncome()
  const toggleRent = useToggleRecurringIncome()
  const deleteRent = useDeleteRecurringIncome()

  const [rentOpen, setRentOpen] = useState(false)
  const [editingRent, setEditingRent] = useState<RecurringIncomeRow | null>(null)
  const [deletingRent, setDeletingRent] = useState<RecurringIncomeRow | null>(null)

  // Balance = ingresos − egresos del mes (corte SIEMPRE UTC).
  const balance = useMemo(() => {
    const monthStart = startOfMonthUtc(0).slice(0, 10)
    const expensesMonth = expenses
      .filter((e) => e.expense_date >= monthStart)
      .reduce((s, e) => s + Number(e.amount), 0)
    const totalMonth = income?.totalMonth ?? 0
    return { expensesMonth, totalMonth, value: totalMonth - expensesMonth }
  }, [expenses, income])

  const handleRentSubmit = async (dto: RecurringIncomeFormPayload) => {
    if (editingRent) {
      await updateRent.mutateAsync({ id: editingRent.id, dto })
    } else {
      await createRent.mutateAsync(dto)
    }
    setRentOpen(false)
    setEditingRent(null)
  }

  const confirmDeleteRent = async () => {
    if (!deletingRent || !isStaff) return
    await deleteRent.mutateAsync(deletingRent)
    setDeletingRent(null)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando acceso...
      </div>
    )
  }

  if (!isStaff) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">Acceso restringido</p>
          <p className="mt-2 text-sm text-muted-foreground">Solo el staff puede ver los ingresos.</p>
        </div>
      </section>
    )
  }

  const revenue = income?.revenueByMonth ?? []
  const bySource = income?.bySource ?? []
  const byMethod = income?.byMethod ?? []
  const recent = income?.recent ?? []

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
            Finanzas
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            Ingresos <span className="text-primary">del Gym</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Membresías aprobadas + ventas de mostrador + rentas fijas activas.
          </p>
        </header>

        {/* Stats: total mes, total histórico, balance */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total mes</p>
            </div>
            <p className="mt-2 font-sans text-2xl font-black tabular-nums text-foreground">
              {incomeLoading ? "—" : currency(balance.totalMonth)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total histórico</p>
            </div>
            <p className="mt-2 font-sans text-2xl font-black tabular-nums text-foreground">
              {incomeLoading ? "—" : currency(income?.totalHistoric ?? 0)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Balance del mes</p>
            </div>
            <p
              className={`mt-2 font-sans text-2xl font-black tabular-nums ${balance.value < 0 ? "text-destructive" : "text-foreground"}`}
            >
              {incomeLoading || expensesLoading ? "—" : currency(balance.value)}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">ingresos − egresos</p>
          </div>
        </div>

        {/* Gráficas espejo AdminCharts */}
        {incomeLoading ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando ingresos...
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Ingresos · últimos 6 meses" icon={<TrendingUp className="h-4 w-4" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(v: number) => `₡${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip {...tip} formatter={(value) => (typeof value === "number" ? currency(value) : "")} />
                  <Bar dataKey="memberships" stackId="a" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Membresías" />
                  <Bar dataKey="products" stackId="a" fill={COLORS[3]} radius={[4, 4, 0, 0]} name="Productos" />
                  <Bar dataKey="rents" stackId="a" fill={COLORS[2]} radius={[4, 4, 0, 0]} name="Rentas" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Ingresos · por fuente" icon={<Banknote className="h-4 w-4" />}>
              {bySource.length === 0 ? (
                <p className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">Sin ingresos</p>
              ) : (
                <div className="flex h-full items-center gap-4">
                  <div className="h-full min-w-0 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={bySource} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                          {bySource.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip {...tip} formatter={(value) => (typeof value === "number" ? currency(value) : "")} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="flex flex-col gap-2.5 pr-2">
                    {bySource.map((s, i) => (
                      <li key={s.name} className="flex items-center gap-2.5">
                        <span className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-sans text-sm text-foreground">{s.name}</span>
                        <span className="ml-auto font-mono text-xs font-bold tabular-nums text-muted-foreground">
                          {currency(s.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </ChartCard>
          </div>
        )}

        {/* Chips por método (membresías SINPE/efectivo) */}
        {byMethod.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {byMethod.map((m) => (
              <span
                key={m.method}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground"
              >
                <span className="font-bold uppercase tracking-wider text-foreground">{m.method}</span>
                <span className="tabular-nums text-primary">{currency(m.total)}</span>
              </span>
            ))}
          </div>
        ) : null}

        {/* Lista reciente con badge de fuente */}
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <h2 className="font-sans text-xs font-black uppercase tracking-widest text-foreground">Movimientos recientes</h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Últimos {recent.length}
            </span>
          </header>
          {incomeLoading ? (
            <p className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">Cargando movimientos…</p>
          ) : recent.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 font-mono text-xs text-muted-foreground">Aún no hay ingresos registrados.</p>
            </div>
          ) : (
            <ol>
              {recent.map((r, i) => (
                <li
                  key={r.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 ${i < recent.length - 1 ? "border-b border-border/40" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-bold text-foreground">
                      {r.title}
                      <span className={`ml-2 rounded-full border px-1.5 py-0.5 font-mono text-[10px] uppercase ${SOURCE_BADGE[r.source]}`}>
                        {SOURCE_LABEL[r.source]}
                      </span>
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {r.subtitle}
                      {r.at
                        ? ` · ${new Date(r.at).toLocaleDateString("es-CR", { day: "numeric", month: "short" })}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 font-sans text-sm font-black tabular-nums text-primary">{currency(r.amount)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Rentas fijas */}
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
          <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <h2 className="flex items-center gap-2 font-sans text-xs font-black uppercase tracking-widest text-foreground">
              <Repeat className="h-4 w-4 text-primary" />
              Rentas fijas
            </h2>
            <button
              onClick={() => {
                setEditingRent(null)
                setRentOpen(true)
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-none bg-primary px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </button>
          </header>
          {rentsLoading ? (
            <p className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">Cargando rentas…</p>
          ) : rents.length === 0 ? (
            <p className="px-4 py-8 text-center font-mono text-xs text-muted-foreground">
              Sin rentas fijas. Ej: alquiler del salón para eventos.
            </p>
          ) : (
            <ol>
              {rents.map((rent, i) => (
                <li
                  key={rent.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < rents.length - 1 ? "border-b border-border/40" : ""} ${rent.is_active ? "" : "opacity-60"}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-bold text-foreground">
                      {rent.description}
                      <span
                        className={`ml-2 rounded-full border px-1.5 py-0.5 font-mono text-[10px] uppercase ${rent.is_active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"}`}
                      >
                        {rent.is_active ? "Activa" : "Pausada"}
                      </span>
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">{currency(Number(rent.amount))} / mes</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => toggleRent.mutate({ id: rent.id, is_active: !rent.is_active })}
                      disabled={toggleRent.isPending}
                      aria-label={rent.is_active ? `Pausar ${rent.description}` : `Reanudar ${rent.description}`}
                      title={rent.is_active ? "Pausar" : "Reanudar"}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {rent.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRent(rent)
                        setRentOpen(true)
                      }}
                      aria-label={`Editar ${rent.description}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingRent(rent)}
                      aria-label={`Eliminar ${rent.description}`}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <RecurringIncomeDialog
        open={rentOpen}
        income={editingRent}
        onClose={() => {
          setRentOpen(false)
          setEditingRent(null)
        }}
        onSubmit={handleRentSubmit}
      />
      <RecurringIncomeConfirmDeleteDialog
        income={deletingRent}
        onCancel={() => setDeletingRent(null)}
        onConfirm={confirmDeleteRent}
      />
    </section>
  )
}
