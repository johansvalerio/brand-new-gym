"use client"

import { ArrowRight, Check, Clock, Loader2, ShieldAlert, X } from "lucide-react"
import {
  useDecideSale,
  type ProductSaleRow,
} from "@/_features/gym-admin/products/hooks/useProductSales"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { Button } from "@/components/ui/button"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `${hours}h`
}

function buyerName(sale: ProductSaleRow): string {
  const b = sale.buyer as unknown as {
    first_name?: string | null
    last_name?: string | null
    email?: string | null
  } | null
  return (
    `${b?.first_name ?? ""} ${b?.last_name ?? ""}`.trim() || b?.email || "Miembro"
  )
}

/** Cola de entrega del mostrador — solo se renderiza si hay pendientes. */
export function PendingSales({
  rows,
  loading,
  error,
}: {
  rows: ProductSaleRow[]
  loading: boolean
  error: string | null
}) {
  const decide = useDecideSale()
  const { navigate } = usePageTransition()

  if (rows.length === 0 && !loading && !error) return null

  return (
    <section className="relative overflow-hidden rounded-lg border border-amber-500/30 bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-amber-600">
          <Clock className="h-4 w-4" />
          Pendientes de entrega
        </h3>
        <button
          onClick={() => navigate("/products")}
          aria-label="Ver ventas de productos"
          className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Ver ventas
          <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando...
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" />
          {error}
        </p>
      ) : (
        <ol>
          {rows.map((sale, i) => (
            <li
              key={sale.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < rows.length - 1 ? "border-b border-border/40" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-bold text-foreground">
                  {(sale.product as unknown as { product_name?: string } | null)?.product_name ?? "Producto"}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    ×{sale.quantity}
                  </span>
                </p>
                <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {buyerName(sale)} · hace {timeAgo(sale.sold_at)} · {currency(sale.total)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  size="sm"
                  disabled={decide.isPending}
                  onClick={() => decide.mutate({ id: sale.id, status: "approved" })}
                  className="h-7 gap-1 rounded-none px-2.5 text-xs"
                >
                  <Check className="h-3.5 w-3.5" /> Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={decide.isPending}
                  onClick={() => decide.mutate({ id: sale.id, status: "rejected" })}
                  className="h-7 rounded-none px-2.5 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
