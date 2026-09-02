"use client"

import * as React from "react"
import { Package, ShoppingCart, X, Check, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
}

export function ProductDetailModal({ product, open, onClose, onPurchase, purchasePending }: ProductDetailModalProps) {
  const [purchasing, setPurchasing] = React.useState(false)
  const [quantity, setQuantity] = React.useState(1)
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
        className="max-h-[90vh] w-full max-w-[calc(100%-1rem)] overflow-hidden border-border bg-card p-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">{product.product_name}</DialogTitle>

        <button
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Imagen */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
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

        {/* Info + compra — siempre visible, no se pierde al elegir cantidad */}
        <div className="p-5">
          <h2 className="font-sans text-xl font-black uppercase tracking-tight text-foreground text-balance">
            {product.product_name}
          </h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="font-sans text-2xl font-black text-primary">{currency(product.product_price)}</span>
            <span className="text-sm text-muted-foreground">· Stock {product.product_stock} uds</span>
          </div>
          {product.product_description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.product_description}</p>
          ) : null}

          <div className="mt-5">
            {!purchasing ? (
              <Button
                size="lg"
                className="w-full gap-2 rounded-none font-sans font-bold uppercase tracking-wider"
                onClick={() => setPurchasing(true)}
                disabled={!canPurchase}
                title={!onPurchase ? "Inicia sesión para comprar" : isOutOfStock ? "Sin stock" : undefined}
              >
                <ShoppingCart className="h-5 w-5" /> {isOutOfStock ? "Sin stock" : "Comprar"}
              </Button>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
