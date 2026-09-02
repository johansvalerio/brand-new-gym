"use client"

import { useEffect, useMemo, useState } from "react"
import { PackageOpen, Loader2, Package, ShoppingBag } from "lucide-react"
import type { CreateProductDto, ProductRow } from "../hooks/useProducts"
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/useProducts"
import { useCategories } from "../hooks/useCategories"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { ProductsCards } from "./products-card"
import { ProductsTable } from "./products-table"
import { ProductFormDialog } from "./product-form-dialog"
import { ConfirmDeleteDialog } from "./confirm-delete-dialog"
import { ProductsStats } from "./products-stats"
import { ProductsToolbar } from "./products-toolbar"
import { ProductDetailModal } from "@/components/ui/product-detail-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductSalesTab } from "./product-sales-tab"
import { useCreateSale, useOfflineSalesSync } from "../hooks/useProductSales"

type ViewMode = "cards" | "table"

export function Products() {
  useOfflineSalesSync()
  const { data: products = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const createSale = useCreateSale()
  const { isAdmin, isCoach, profile, loading: authLoading } = useAuthSession()
  const isStaff = isAdmin || isCoach

  const [view, setView] = useState<ViewMode>("cards")
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")

  // Dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [deleting, setDeleting] = useState<ProductRow | null>(null)
  const [selected, setSelected] = useState<ProductRow | null>(null)

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
    const revenue = products.reduce((sum, p) => sum + p.product_price * p.product_stock, 0)
    return { count: products.length, units, revenue }
  }, [products])

  // ─── CRUD ───
  const openCreate = () => {
    if (!isAdmin) return
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (product: ProductRow) => {
    if (!isAdmin) return
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
    if (!deleting || !isAdmin) return
    await deleteProduct.mutateAsync(deleting)
    setDeleting(null)
  }

  // Compra self-service: cualquier usuario autenticado compra para sí mismo.
  // Admin puede seguir comprando (queda registrado como buyer=sold_by=admin).
  // Futuro: selector de miembro para venta mostrador (buyerId distinto).
  const handlePurchase = async (product: ProductRow, quantity: number) => {
    if (!profile) return
    await createSale.mutateAsync({
      productId: product.product_id,
      buyerId:   profile.id,
      soldBy:    profile.id,
      unitPrice: product.product_price,
      quantity,
    })
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando acceso...
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
        <ProductsStats isAdmin={isAdmin} count={stats.count} units={stats.units} revenue={stats.revenue} />

        <Tabs defaultValue="inventory" className="flex flex-col gap-4">
          <TabsList className="self-start">
            <TabsTrigger value="inventory">
              <Package /> Inventario
            </TabsTrigger>
            <TabsTrigger value="sales">
              <ShoppingBag /> {isStaff ? "Ventas" : "Mis compras"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-0">
            {/* Toolbar (filtros arriba de la lista de productos) */}
            <ProductsToolbar
              query={query}
              onQueryChange={setQuery}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categories={categories}
              view={view}
              onViewChange={setView}
              canCreate={isAdmin}
              onCreate={openCreate}
            />

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-20 text-center">
                <PackageOpen className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 font-sans text-lg font-bold text-foreground">Sin resultados</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {query ? "Prueba con otro término de búsqueda." : "Agrega tu primer producto."}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6 backdrop-blur supports-[backdrop-filter]:bg-card/30">
                {/* Mobile: siempre tarjetas; la tabla solo existe ≥sm */}
                <div className={view === "table" ? "sm:hidden" : undefined}>
                  <ProductsCards products={filtered} onEdit={openEdit} onDelete={setDeleting} onSelect={setSelected} canManage={isAdmin} />
                </div>
                {view === "table" && (
                  <div className="hidden sm:block">
                    <ProductsTable
                      products={filtered}
                      onEdit={openEdit}
                      onDelete={setDeleting}
                      onSelect={setSelected}
                      canManage={isAdmin}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales" className="mt-0">
            <ProductSalesTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ProductDetailModal
        product={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onPurchase={profile ? handlePurchase : undefined}
        purchasePending={createSale.isPending}
      />
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
