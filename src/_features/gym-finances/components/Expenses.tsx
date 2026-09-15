"use client"

import { useMemo, useState } from "react"
import { Loader2, MoreVertical, Pencil, Plus, Receipt, Search, ShieldAlert, Trash2 } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { currency } from "@/_features/gym-admin/products/components/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
  type ExpenseRow,
} from "../hooks/useExpenses"
import { EXPENSE_CATEGORY_LABELS } from "../lib/expense.schema"
import { startOfMonthUtc } from "../hooks/useIncome"
import { ExpenseFormDialog, type ExpenseFormPayload } from "./expense-form-dialog"
import { ExpenseConfirmDeleteDialog } from "./expense-confirm-delete-dialog"

function ExpenseStats({
  monthTotal,
  historicTotal,
  topCategory,
}: {
  monthTotal: number
  historicTotal: number
  topCategory: { label: string; total: number } | null
}) {
  const cards = [
    { label: "Egresos mes", value: currency(monthTotal) },
    { label: "Total histórico", value: currency(historicTotal) },
    {
      label: "Top categoría",
      value: topCategory ? topCategory.label : "—",
      sub: topCategory ? currency(topCategory.total) : undefined,
    },
  ]
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-border bg-card px-4 py-3.5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</p>
          <p className="mt-2 truncate font-sans text-2xl font-black tabular-nums text-foreground">{c.value}</p>
          {c.sub ? <p className="font-mono text-[10px] text-muted-foreground">{c.sub}</p> : null}
        </div>
      ))}
    </div>
  )
}

function ExpenseRowMenu({ expense, onEdit, onDelete }: { expense: ExpenseRow; onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Acciones de ${expense.description}`}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} variant="destructive" className="cursor-pointer">
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Expenses() {
  const { isAdmin, loading: authLoading } = useAuthSession()
  const { data: expenses = [], isLoading, error } = useExpenses()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ExpenseRow | null>(null)
  const [deleting, setDeleting] = useState<ExpenseRow | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return expenses
    return expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        (EXPENSE_CATEGORY_LABELS[e.category as keyof typeof EXPENSE_CATEGORY_LABELS] ?? e.category)
          .toLowerCase()
          .includes(q),
    )
  }, [expenses, query])

  const stats = useMemo(() => {
    // Corte de mes SIEMPRE UTC — expense_date es date (YYYY-MM-DD).
    const monthStart = startOfMonthUtc(0).slice(0, 10)
    const monthTotal = expenses.filter((e) => e.expense_date >= monthStart).reduce((s, e) => s + Number(e.amount), 0)
    const historicTotal = expenses.reduce((s, e) => s + Number(e.amount), 0)
    const byCat = new Map<string, number>()
    expenses.forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + Number(e.amount)))
    const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0]
    return {
      monthTotal,
      historicTotal,
      topCategory: top
        ? { label: EXPENSE_CATEGORY_LABELS[top[0] as keyof typeof EXPENSE_CATEGORY_LABELS] ?? top[0], total: top[1] }
        : null,
    }
  }, [expenses])

  const openCreate = () => {
    if (!isAdmin) return
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (expense: ExpenseRow) => {
    if (!isAdmin) return
    setEditing(expense)
    setFormOpen(true)
  }

  const handleSubmit = async (dto: ExpenseFormPayload) => {
    if (editing) {
      await updateExpense.mutateAsync({ id: editing.id, dto })
    } else {
      await createExpense.mutateAsync(dto)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = async () => {
    if (!deleting || !isAdmin) return
    await deleteExpense.mutateAsync(deleting)
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
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">Acceso restringido</p>
          <p className="mt-2 text-sm text-muted-foreground">Solo el administrador puede ver los egresos.</p>
        </div>
      </section>
    )
  }

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
            Egresos <span className="text-primary">del Gym</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Registra los gastos operativos: renta, salarios, servicios y mantenimiento.
          </p>
        </header>

        <ExpenseStats monthTotal={stats.monthTotal} historicTotal={stats.historicTotal} topCategory={stats.topCategory} />

        <div className="mb-6 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por descripción o categoría..."
              className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <button
            onClick={openCreate}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-none bg-primary px-4 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nuevo egreso
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : String(error)}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando egresos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-20 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-sans text-lg font-bold text-foreground">Sin egresos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query ? "Prueba con otro término de búsqueda." : "Registra el primer gasto del gym."}
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-2">
            {filtered.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-bold text-foreground">{expense.description}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {EXPENSE_CATEGORY_LABELS[expense.category as keyof typeof EXPENSE_CATEGORY_LABELS] ?? expense.category} ·{" "}
                    {new Date(`${expense.expense_date}T00:00:00`).toLocaleDateString("es-CR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="shrink-0 font-sans text-sm font-black tabular-nums text-foreground">
                  {currency(Number(expense.amount))}
                </span>
                <ExpenseRowMenu expense={expense} onEdit={() => openEdit(expense)} onDelete={() => setDeleting(expense)} />
              </li>
            ))}
          </ol>
        )}
      </div>

      <ExpenseFormDialog
        open={formOpen}
        expense={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />
      <ExpenseConfirmDeleteDialog expense={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </section>
  )
}
