"use client"

import { Dumbbell, Pencil, Trash2 } from "lucide-react"
import type { ProductRow } from "@/_features/gym-admin/products/hooks/useProducts"
import { currency, stockBadgeClasses, stockLabel, stockLevel } from "./utils"

interface ProductsCardsProps {
  products: ProductRow[]
  onEdit: (product: ProductRow) => void
  onDelete: (product: ProductRow) => void
}

export function ProductsCards({ products, onEdit, onDelete }: ProductsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const level = stockLevel(product.product_stock)
        return (
          <article
            key={product.product_id}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
          >
            {/* hover glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

            {/* image / placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
              {product.product_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.product_image || "/placeholder.svg"}
                  alt={product.product_name}
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Dumbbell className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              <span
                className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${stockBadgeClasses(level)}`}
              >
                {stockLabel(product.product_stock)}
              </span>
            </div>

            {/* body */}
            <div className="relative flex flex-1 flex-col p-4">
              <span className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                #{String(product.product_id).padStart(3, "0")}
              </span>
              <h3 className="font-sans text-base font-bold leading-tight text-foreground text-balance">
                {product.product_name}
              </h3>
              <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {product.product_description ?? "Sin descripción."}
              </p>

              <div className="mt-4 flex items-end justify-between">
                <span className="font-sans text-2xl font-black leading-none text-primary">
                  {currency(product.product_price)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(product)}
                    aria-label={`Editar ${product.product_name}`}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    aria-label={`Eliminar ${product.product_name}`}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
