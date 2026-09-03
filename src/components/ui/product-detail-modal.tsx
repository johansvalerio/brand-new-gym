"use client"

import * as React from "react"
import { Check, ChevronRight, Minus, Package, Plus, ShoppingCart, Tag, X, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { ProductRow } from "@/_features/gym-admin/products/hooks/useProducts"
import { currency, stockLabel, stockBadgeClasses, stockLevel } from "@/_features/gym-admin/products/components/utils"

interface ProductDetailModalProps {
  product: ProductRow | null
  open: boolean
  onClose: () => void
  onPurchase?: (product: ProductRow, quantity: number) => void | Promise<void>
  purchasePending?: boolean
  /** Productos similares (misma categoría primero) — sección "También te puede interesar". */
  similar?: ProductRow[]
  onSelectProduct?: (product: ProductRow) => void
}

export function ProductDetailModal({ product, open, onClose, onPurchase, purchasePending, similar = [], onSelectProduct }: ProductDetailModalProps) {
  const [purchasing, setPurchasing] = React.useState(false)
  const [quantity, setQuantity] = React.useState(1)
  const similarRef = React.useRef<HTMLDivElement>(null)
  useBodyScrollLock(open)

  // Reset al cerrar (no an effect sync de props) — MASTER.md anti set-state-in-effect.
  const handleClose = () => {
    setPurchasing(false)
    setQuantity(1)
    onClose()
  }

  if (!product) return null

  const level = stockLevel(product.product_stock)
  const isOutOfStock = product.product_stock <= 0
  const canPurchase = Boolean(onPurchase) && !isOutOfStock

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-h-[90vh] w-full max-w-[calc(100%-1rem)] overflow-y-auto border-border bg-card p-0 sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">{product.product_name}</DialogTitle>

        {/* Breadcrumbs + cerrar */}
        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border/60 bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
          <nav aria-label="Ruta de navegación" className="flex min-w-0 items-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <button onClick={handleClose} className="cursor-pointer transition-colors hover:text-primary">
              Productos
            </button>
            <ChevronRight className="mx-1 h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-foreground">{product.product_name}</span>
          </nav>
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido estilo product-detail-page: foto | detalle */}
        <main className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 sm:gap-8 sm:p-6">
          {/* Foto única */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border bg-secondary">
            {product.product_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.product_image} alt={product.product_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                stockBadgeClasses(level)
              )}
            >
              {stockLabel(product.product_stock)}
            </span>
          </div>

          {/* Detalle */}
          <div className="flex min-w-0 flex-col">
            <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-foreground text-balance sm:text-3xl">
              {product.product_name}
            </h2>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="font-sans text-3xl font-black tabular-nums text-primary sm:text-4xl">
                {currency(product.product_price)}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                Stock {product.product_stock} uds
              </span>
            </div>

            {/* Comprar / similares — el panel de cantidad reemplaza los botones como antes */}
            <div className="my-5">
              {!purchasing ? (
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    className="flex-1 gap-2 rounded-none font-sans font-bold uppercase tracking-wider"
                    onClick={() => setPurchasing(true)}
                    disabled={!canPurchase}
                    title={!onPurchase ? "Inicia sesión para comprar" : isOutOfStock ? "Sin stock" : undefined}
                  >
                    <ShoppingCart className="h-5 w-5" /> {isOutOfStock ? "Sin stock" : "Comprar"}
                  </Button>
                  {similar.length > 0 ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 rounded-none font-sans font-bold uppercase tracking-wider"
                      onClick={() => similarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    >
                      <ArrowDown className="h-5 w-5" /> Similares
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="flex w-full flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary">¿Cuántas unidades?</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Restar"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={product.product_stock}
                      value={quantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        const clamped = Number.isFinite(v) ? Math.max(1, Math.min(product.product_stock, v)) : 1
                        setQuantity(clamped)
                      }}
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-center font-sans text-base font-black tabular-nums text-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Sumar"
                      onClick={() => setQuantity((q) => Math.min(product.product_stock, q + 1))}
                      disabled={quantity >= product.product_stock}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                    <span>Total</span>
                    <span className="font-sans text-base font-black tabular-nums text-primary">
                      {currency(product.product_price * quantity)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 rounded-none font-sans font-bold uppercase tracking-wider"
                      onClick={() => setPurchasing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 gap-2 rounded-none font-sans font-bold uppercase tracking-wider"
                      disabled={purchasePending}
                      onClick={async () => {
                        if (!onPurchase) return
                        await onPurchase(product, quantity)
                        setPurchasing(false)
                      }}
                    >
                      {purchasePending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Confirmar
                    </Button>
                  </div>
                </div>
              )}
              {!canPurchase && !isOutOfStock && !onPurchase && (
                <p className="mt-2 text-center font-mono text-[11px] text-muted-foreground">Inicia sesión para comprar</p>
              )}
            </div>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
              {product.category ? (
                <Badge variant="secondary" className="gap-1.5 py-1 font-mono text-[11px] font-normal uppercase tracking-wider">
                  <Tag className="h-3.5 w-3.5" />
                  {product.category.name}
                </Badge>
              ) : null}
              <Badge variant="secondary" className="gap-1.5 py-1 font-mono text-[11px] font-normal uppercase tracking-wider">
                <Package className="h-3.5 w-3.5" />
                {stockLabel(product.product_stock)}
              </Badge>
            </div>

            {/* Descripción */}
            {product.product_description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{product.product_description}</p>
            ) : null}
          </div>
        </main>

        {/* También te puede interesar */}
        {similar.length > 0 && onSelectProduct ? (
          <div ref={similarRef} className="scroll-mt-20 border-t border-border/60 px-4 py-5 sm:px-6">
            <h3 className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
              También te puede interesar
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {similar.map((item) => (
                <button
                  key={item.product_id}
                  type="button"
                  onClick={() => onSelectProduct(item)}
                  aria-label={`Ver ${item.product_name}`}
                  className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-background text-left transition-all hover:-translate-y-0.5 hover:border-primary/60"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                    {item.product_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate font-sans text-xs font-bold text-foreground">
                      {item.product_name}
                    </p>
                    <p className="mt-0.5 font-sans text-xs font-black tabular-nums text-primary">
                      {currency(item.product_price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
