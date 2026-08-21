"use client"

import { Dumbbell, Pencil, Trash2 } from "lucide-react"
import type { Tables } from "@/types/database.types"
import { currency, stockBadgeClasses, stockLabel, stockLevel } from "./utils"

type Product = Tables<"products">;

interface ProductsTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["ID", "Producto", "Precio", "Stock", "Actualizado", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${
                    i === 2 || i === 3 ? "text-right" : ""
                  } ${i === 5 ? "text-right" : ""}`}
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
                  className="group border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
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
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {new Date(product.product_updated_at).toLocaleDateString("es-EC", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(product)}
                        aria-label={`Editar ${product.product_name}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        aria-label={`Eliminar ${product.product_name}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
