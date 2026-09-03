"use client"

import { Dumbbell, Pencil, Trash2, MoreVertical } from "lucide-react"
import type { ProductRow } from "@/_features/gym-admin/products/hooks/useProducts"
import { currency, stockBadgeClasses, stockLabel, stockLevel } from "./utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProductsTableProps {
  products: ProductRow[]
  onEdit: (product: ProductRow) => void
  onDelete: (product: ProductRow) => void
  onSelect?: (product: ProductRow) => void
  canManage?: boolean
}

export function ProductsTable({ products, onEdit, onDelete, onSelect, canManage = true }: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["ID", "Producto", "Precio", "Stock", "Categoría", "Actualizado", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${
                    i === 2 || i === 3 ? "text-right" : ""
                  } ${i === 6 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const level = stockLevel(product.product_stock)
              return (
                <tr
                  key={product.product_id}
                  onClick={() => onSelect?.(product)}
                  className="group cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                    #{String(product.product_id).padStart(3, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
                        {product.product_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.product_image || "/placeholder.svg"}
                            alt={product.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Dumbbell className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-sans text-sm font-semibold text-foreground">
                          {product.product_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {product.product_description ?? "Sin descripción."}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-sans text-sm font-bold text-primary">
                    {currency(product.product_price)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${stockBadgeClasses(level)}`}
                    >
                      {stockLabel(product.product_stock)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {product.category ? (
                      <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">
                        —
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {new Date(product.product_updated_at).toLocaleDateString("es-EC", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  {canManage ? (
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Más acciones de ${product.product_name}`}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors sm:h-8 sm:w-8 hover:border-foreground hover:text-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            side="bottom"
                            sideOffset={4}
                            className="z-[60] w-44 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => onEdit(product)}
                              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 font-sans text-sm font-medium text-foreground hover:bg-secondary"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onDelete(product)}
                              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 font-sans text-sm font-medium"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
