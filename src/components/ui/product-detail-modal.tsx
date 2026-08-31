"use client"

import * as React from "react"
import { ChevronRight, Star, Tag, Package, Users, Info, Heart, Share2, ShoppingCart, Send, Camera, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { ProductRow } from "@/_features/gym-admin/products/hooks/useProducts"
import { currency, stockLabel, stockBadgeClasses, stockLevel } from "@/_features/gym-admin/products/components/utils"

interface ProductDetailModalProps {
  product: ProductRow | null
  open: boolean
  onClose: () => void
}

// Determinista: mismo product_id → mismo seller, mismos tags, mismas breadcrumbs
const SELLER = {
  name: "Gymulate Store",
  avatarUrl: "/placeholder.svg",
  rating: 4.9,
} as const

function getBreadcrumbs(product: ProductRow) {
  return [
    { label: "Catálogo", href: "/products" },
    { label: product.category?.name ?? "General", href: `/products?category=${product.category?.slug ?? ""}` },
    { label: product.product_name, href: "#" },
  ]
}

function getTags(product: ProductRow) {
  const level = stockLevel(product.product_stock)
  return [
    { label: product.category?.name ?? "General", icon: Tag },
    { label: `#${String(product.product_id).padStart(3, "0")}`, icon: Package },
    { label: stockLabel(product.product_stock), icon: Info },
    { label: level === "ok" ? "Disponible" : level === "low" ? "Últimas unidades" : "Agotado", icon: Users },
  ]
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={cn("h-4 w-4", i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")} />
    ))}
    <span className="ml-2 text-sm font-medium text-muted-foreground">{rating.toFixed(1)}</span>
  </div>
)

export function ProductDetailModal({ product, open, onClose }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  useBodyScrollLock(open)

  React.useEffect(() => {
    if (open) setCurrentImageIndex(0)
  }, [open, product?.product_id])

  if (!product) return null

  const images = product.product_image ? [product.product_image, product.product_image, product.product_image] : []
  const breadcrumbs = getBreadcrumbs(product)
  const tags = getTags(product)
  const level = stockLevel(product.product_stock)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-h-[90vh] w-full max-w-[calc(100%-1rem)] overflow-hidden border-border bg-card p-0 sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">{product.product_name}</DialogTitle>
        {/* close */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm text-muted-foreground">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <a href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </a>
                  {index < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
                </React.Fragment>
              ))}
            </nav>

            <div className="flex justify-between items-center mb-4">
              <div />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Image Gallery */}
              <div className="flex flex-col gap-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${product.product_id}-${currentImageIndex}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-secondary"
                  >
                    {images[currentImageIndex] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[currentImageIndex]} alt={product.product_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <span className={cn("absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", stockBadgeClasses(level))}>
                      {stockLabel(product.product_stock)}
                    </span>
                  </motion.div>
                </AnimatePresence>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn("h-2 w-2 rounded-full transition-colors", currentImageIndex === index ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50")}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                    {images.length === 0 ? <span className="h-2 w-2 rounded-full bg-muted" /> : null}
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full">
                    <Camera className="h-4 w-4" /> Ver similar
                  </Button>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <h2 className="font-sans text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground text-balance">{product.product_name}</h2>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="font-sans text-3xl font-black text-primary">{currency(product.product_price)}</span>
                  <span className="text-sm text-muted-foreground">· Stock {product.product_stock} unidades</span>
                </div>

                <div className="my-5 flex gap-2">
                  <Button size="lg" className="flex-1 gap-2 rounded-none font-sans font-bold uppercase tracking-wider">
                    <ShoppingCart className="h-5 w-5" /> Comprar
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1 gap-2 rounded-none font-sans font-bold uppercase tracking-wider">
                    <Send className="h-5 w-5" /> Consultar
                  </Button>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-wider">
                      {tag.icon && <tag.icon className="h-3.5 w-3.5" />}
                      {tag.label}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.product_description ?? "Sin descripción. Producto oficial de la tienda Gymulate, seleccionado para tu rendimiento."}
                  <a href="#" className="ml-2 font-medium text-primary hover:underline">
                    Ver más
                  </a>
                </p>

                <div className="mt-6 border-t border-border pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage src={SELLER.avatarUrl} alt={SELLER.name} />
                        <AvatarFallback className="bg-primary/15 text-primary font-bold">{SELLER.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{SELLER.name}</p>
                        <StarRating rating={SELLER.rating} />
                      </div>
                    </div>
                    <Button variant="link" className="text-primary">
                      Ver tienda →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* You might also like — determinista por categoría */}
          <div className="border-t border-border bg-secondary/20 px-4 py-6 md:px-6">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-muted-foreground">También te puede gustar</h3>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg border border-border bg-card">
                  {product.product_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.product_image} alt="" className="h-full w-full object-cover opacity-60 grayscale" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Package className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
