"use client"

import { useMemo, useState } from "react"
import { LayoutGrid, Table2, Plus, Search, PackageOpen, Loader2, Filter } from "lucide-react"
import type { CreateProductDto, ProductRow } from "@/_features/gym-admin/products/hooks/useProducts"
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/_features/gym-admin/products/hooks/useProducts"
import { useCategories } from "@/_features/gym-admin/products/hooks/useCategories"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { ProductsCards } from "./products-card"
import { ProductsTable } from "./products-table"
import { ProductFormDialog } from "./product-form-dialog"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import { currency } from "./utils"

type ViewMode = "cards" | "table"

export function Products() {
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const { isAdmin, loading: authLoading } = useAuthSession()

  const [view, setView] = useState<ViewMode>("cards")
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")

  // Dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [deleting, setDeleting] = useState<ProductRow | null>(null)

  const filtered = useMemo(() => {
    let result = products

    if (categoryFilter) {
      result = result.filter((p) => p.category?.slug === categoryFilter)
    }

    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (p) =>
          p.product_name.toLowerCase().includes(q) ||
          (p.product_description ?? "").toLowerCase().includes(q),
      )
    }

    return result
  }, [products, query, categoryFilter])

  const stats = useMemo(() => {
    const units = products.reduce((sum, p) => sum + p.product_stock, 0)
    const value = products.reduce((sum, p) => sum + p.product_price * p.product_stock, 0)
    return { count: products.length, units, value }
  }, [products])

  // ─── CRUD ───
  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (product: ProductRow) => {
    setEditing(product)
    setFormOpen(true)
  }

  const handleSubmit = async (dto: CreateProductDto) => {
    if (editing) {
      await updateProduct.mutateAsync({ id: editing.product_id, dto })
    } else {
      await createProduct.mutateAsync(dto)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    await deleteProduct.mutateAsync(deleting)
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando productos...
      </div>
    )
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Catálogo
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            Productos <span className="text-primary">&amp; Suplementos</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Gestiona el inventario de la tienda del gimnasio. Cambia entre vista de tarjetas y tabla
            para comparar cuál te sirve mejor.
          </p>
        </header>

        {/* Stats */}
        <div className={`mb-8 grid gap-3 sm:max-w-xl ${isAdmin ? "grid-cols-3" : "grid-cols-1"}`}>
          <Stat label="Productos" value={String(stats.count)} />
          {isAdmin ? (
            <>
              <Stat label="Unidades" value={String(stats.units)} />
              <Stat label="Valor inv." value={currency(stats.value)} />
            </>
          ) : null}
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto..."
              aria-label="Buscar producto"
              className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filtrar por categoría"
                className="w-full appearance-none rounded-md border border-border bg-card py-2.5 pl-9 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div
              role="tablist"
              aria-label="Cambiar vista"
              className="flex items-center gap-1 rounded-md border border-border bg-card p-1"
            >
              <ToggleBtn active={view === "cards"} onClick={() => setView("cards")} label="Tarjetas">
                <LayoutGrid className="h-4 w-4" />
              </ToggleBtn>
              <ToggleBtn active={view === "table"} onClick={() => setView("table")} label="Tabla">
                <Table2 className="h-4 w-4" />
              </ToggleBtn>
            </div>

            {isAdmin ? (
              <button
                onClick={openCreate}
                className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-4 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-20 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-4 font-sans text-lg font-bold text-foreground">Sin resultados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query ? "Prueba con otro término de búsqueda." : "Agrega tu primer producto."}
            </p>
          </div>
        ) : view === "cards" ? (
          <ProductsCards products={filtered} onEdit={openEdit} onDelete={setDeleting} canManage={isAdmin} />
        ) : (
          <ProductsTable products={filtered} onEdit={openEdit} onDelete={setDeleting} canManage={isAdmin} />
        )}
      </div>

      {/* Dialogs */}
      <ProductFormDialog
        open={formOpen}
        product={editing}
        categories={categories}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
      />
      <ConfirmDeleteDialog product={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-sans text-xl font-black text-foreground">{value}</p>
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={label}
      className={`flex cursor-pointer items-center gap-2 rounded px-3 py-1.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}
