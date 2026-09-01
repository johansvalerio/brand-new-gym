"use client"

import * as React from "react"
import { Dumbbell, Pencil, Trash2, ShoppingCart } from "lucide-react"
import type { ProductRow } from "@/_features/gym-admin/products/hooks/useProducts"
import { currency } from "./utils"
import { cn } from "@/lib/utils"

interface ProductsCardsProps {
  products: ProductRow[]
  onEdit: (product: ProductRow) => void
  onDelete: (product: ProductRow) => void
  onSelect?: (product: ProductRow) => void
  canManage?: boolean
}

function InteractiveCard({
  product,
  onSelect,
  onEdit,
  onDelete,
  canManage,
}: {
  product: ProductRow
  onSelect?: (p: ProductRow) => void
  onEdit: (p: ProductRow) => void
  onDelete: (p: ProductRow) => void
  canManage: boolean
}) {
  const cardRef = React.useRef<HTMLDivElement>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    const rotateX = ((y - height / 2) / (height / 2)) * -6
    const rotateY = ((x - width / 2) / (width / 2)) * 6
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: "transform 0.1s ease-out",
    })
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect?.(product)}
      style={{ ...style, transformStyle: "preserve-3d" } as React.CSSProperties}
      className={cn(
        "group relative flex aspect-[9/12] w-full max-w-[340px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg",
      )}
    >
      {/* Background image */}
      {product.product_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.product_image}
          alt={product.product_name}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "translateZ(-20px) scale(1.08)" }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary">
          <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
        </div>
      )}
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      {/* Content 3D */}
      <div className="absolute inset-0 flex flex-col p-4" style={{ transform: "translateZ(32px)" }}>
        {/* Glass header */}
        <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
          <div className="min-w-0">
            <h3 className="truncate font-sans text-base font-bold leading-tight text-white">{product.product_name}</h3>
            <p className="truncate text-xs text-white/70">{product.category?.name ?? product.product_description?.slice(0, 32) ?? "Gymulate"}</p>
          </div>
          <span className="shrink-0 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            #{String(product.product_id).padStart(3, "0")}
          </span>
        </div>

        {/* Price tag */}
        <div className="absolute left-4 top-[92px]">
          <div className="rounded-full bg-black/45 px-3.5 py-1.5 text-sm font-black text-white backdrop-blur-sm">
            {currency(product.product_price)}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.(product)
            }}
            aria-label={`Ver ${product.product_name}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-black hover:shadow-[0_0_12px_rgba(150,217,6,0.6)]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
          {canManage ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onEdit(product)}
                aria-label={`Editar ${product.product_name}`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-all hover:border-primary hover:bg-primary hover:text-black hover:shadow-[0_0_12px_rgba(150,217,6,0.6)]"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(product)}
                aria-label={`Eliminar ${product.product_name}`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur transition-colors hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* stock/category pill on image */}
      {product.category ? (
        <span className="absolute bottom-14 left-4 max-w-[60%] truncate rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {product.category.name}
        </span>
      ) : null}
    </div>
  )
}

export function ProductsCards({ products, onEdit, onDelete, onSelect, canManage = true }: ProductsCardsProps) {
  return (
    <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <InteractiveCard key={product.product_id} product={product} onSelect={onSelect} onEdit={onEdit} onDelete={onDelete} canManage={canManage} />
      ))}
    </div>
  )
}
