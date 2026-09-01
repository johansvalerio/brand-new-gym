"use client"

import { Package, TrendingUp, Trophy, Clock, Check, X } from "lucide-react"
import { useRecentSales, useSalesStats, useDecideSale, type ProductSaleRow } from "../hooks/useProductSales"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { currency } from "./utils"
import { Button } from "@/components/ui/button"

function buyerName(sale: ProductSaleRow): string {
  const b = sale.buyer
  if (!b) return "—"
  return `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim() || b.email || "Miembro"
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "ahora"
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`
  return new Date(iso).toLocaleDateString("es-CR", { day: "numeric", month: "short" })
}

export function ProductSalesTab() {
  const { data: sales = [], isLoading, error } = useRecentSales(30)
  const { data: stats } = useSalesStats()
  const decide = useDecideSale()
  const { isAdmin, isCoach } = useAuthSession()
  const isStaff = isAdmin || isCoach
  const title = isStaff ? "Ventas recientes" : "Mis compras"
  const emptyText = isStaff ? "Aún no hay ventas registradas." : "Aún no tienes compras registradas."
  const pending = sales.filter((s) => (s as unknown as { status: string }).status === "pending")
  const historyStaff = sales.filter((s) => (s as unknown as { status: string }).status !== "pending")
  const displayList = isStaff ? historyStaff : sales

  return (
    <div className="flex flex-col gap-6">
      {/* Resumen del mes — para member es personal por RLS, para staff es global */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {isStaff ? "Ingresos mes" : "Gastado este mes"}
            </p>
          </div>
          <p className="mt-2 font-sans text-2xl font-black tabular-nums text-foreground">
            {stats ? currency(stats.totalRevenueMonth) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Unidades mes</p>
          </div>
          <p className="mt-2 font-sans text-2xl font-black tabular-nums text-foreground">
            {stats?.unitsMonth ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {isStaff ? "Top del mes" : "Tu top del mes"}
            </p>
          </div>
          {stats?.topProduct ? (
            <>
              <p className="mt-2 truncate font-sans text-sm font-bold text-foreground">
                {stats.topProduct.product_name}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {stats.topProduct.units} uds · {currency(stats.topProduct.revenue)}
              </p>
            </>
          ) : (
            <p className="mt-2 font-mono text-xs text-muted-foreground">Sin datos</p>
          )}
        </div>
      </div>

      {/* Pendientes — solo staff ve la cola de entrega */}
      {isStaff && pending.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-amber-500/30 bg-card">
          <header className="flex items-center justify-between border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <h2 className="flex items-center gap-2 font-sans text-xs font-black uppercase tracking-widest text-amber-600">
              <Clock className="h-3.5 w-3.5" /> Pendientes de entrega
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{pending.length}</span>
          </header>
          <ol>
            {pending.map((sale, i) => (
              <li
                key={sale.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < pending.length - 1 ? "border-b border-border/40" : ""}`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-bold text-foreground">
                    {sale.product?.product_name ?? "Producto"}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">×{sale.quantity}</span>
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {buyerName(sale)} · {timeAgo(sale.sold_at)} · {currency(sale.total)} · SINPE/efectivo
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
        </div>
      )}

      {/* Lista de ventas */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h2 className="font-sans text-xs font-black uppercase tracking-widest text-foreground">
            {title}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {isStaff ? `Últimas ${historyStaff.length} · ${pending.length} pendientes` : `Últimas ${sales.length}`}
          </span>
        </header>

        {isLoading ? (
          <p className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">Cargando ventas…</p>
        ) : error ? (
          <p className="px-4 py-6 text-center font-mono text-xs text-destructive">No se pudieron cargar las ventas.</p>
        ) : sales.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Package className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 font-mono text-xs text-muted-foreground">{emptyText}</p>
          </div>
        ) : isStaff && historyStaff.length === 0 && pending.length > 0 ? (
          <p className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">
            Solo hay solicitudes pendientes arriba.
          </p>
        ) : (
          <ol>
            {displayList.map((sale, i) => {
              const st = (sale as unknown as { status: string }).status
              return (
                <li
                  key={sale.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 ${
                    i < displayList.length - 1 ? "border-b border-border/40" : ""
                  } ${st === "rejected" ? "opacity-60" : ""}`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      st === "approved"
                        ? "bg-primary/15 text-primary"
                        : st === "rejected"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-sm font-bold text-foreground">
                      {sale.product?.product_name ?? "Producto"}
                      <span className="ml-2 font-mono text-xs text-muted-foreground">×{sale.quantity}</span>
                      <span
                        className={`ml-2 rounded-full border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
                          st === "approved"
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : st === "rejected"
                              ? "border-destructive/30 bg-destructive/10 text-destructive"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {st}
                      </span>
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {isStaff ? `${buyerName(sale)} · ${timeAgo(sale.sold_at)}` : timeAgo(sale.sold_at)}
                    </p>
                  </div>
                  <span className="shrink-0 font-sans text-sm font-black tabular-nums text-primary">
                    {currency(sale.total)}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
