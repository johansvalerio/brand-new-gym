"use client"

import { useEffect, useRef, useState } from "react"
import { X, Package } from "lucide-react"
import type { CreateProductDto, ProductRow } from "@/_features/gym-admin/products/hooks/useProducts"
import type { CategoryRow } from "@/_features/gym-admin/products/hooks/useCategories"

interface ProductFormDialogProps {
  open: boolean
  /** When present, the dialog is in "edit" mode and pre-fills its fields. */
  product?: ProductRow | null
  categories: CategoryRow[]
  onClose: () => void
  onSubmit: (dto: CreateProductDto) => Promise<void>
}

type FormState = {
  product_name: string
  product_description: string
  product_price: string
  product_stock: string
  product_image: string
  category_id: string
}

const emptyForm: FormState = {
  product_name: "",
  product_description: "",
  product_price: "",
  product_stock: "",
  product_image: "",
  category_id: "",
}

export function ProductFormDialog({ open, product, categories, onClose, onSubmit }: ProductFormDialogProps) {
  const isEdit = Boolean(product)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Sync form with the product being edited whenever the dialog opens.
  useEffect(() => {
    if (!open) return
    setErrors({})
    if (product) {
      setForm({
        product_name: product.product_name,
        product_description: product.product_description ?? "",
        product_price: String(product.product_price),
        product_stock: String(product.product_stock),
        product_image: product.product_image ?? "",
        category_id: product.category_id ?? "",
      })
    } else {
      setForm(emptyForm)
    }
    // Focus the first field for keyboard users.
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open, product])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const set = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.product_name.trim()) next.product_name = "El nombre es obligatorio."
    const price = Number(form.product_price)
    if (form.product_price === "" || Number.isNaN(price) || price < 0)
      next.product_price = "Ingresa un precio válido (≥ 0)."
    const stock = Number(form.product_stock)
    if (form.product_stock === "" || !Number.isInteger(stock) || stock < 0)
      next.product_stock = "El stock debe ser un entero ≥ 0."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        product_name: form.product_name.trim(),
        product_description: form.product_description.trim() || null,
        product_price: Number(form.product_price),
        product_stock: Number(form.product_stock),
        product_image: form.product_image.trim() || null,
        category_id: form.category_id || null,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      {/* Overlay */}
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        {/* accent glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <h2 id="product-form-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                {isEdit ? "Editar producto" : "Nuevo producto"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit ? `ID #${product?.product_id}` : "Agregar al catálogo"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <Field label="Nombre" htmlFor="product_name" error={errors.product_name}>
            <input
              ref={firstFieldRef}
              id="product_name"
              value={form.product_name}
              onChange={(e) => set("product_name", e.target.value)}
              placeholder="Whey Protein 2lb"
              className={inputCls(errors.product_name)}
            />
          </Field>

          <Field label="Descripción" htmlFor="product_description">
            <textarea
              id="product_description"
              value={form.product_description}
              onChange={(e) => set("product_description", e.target.value)}
              rows={2}
              placeholder="Proteína de suero de leche, sabor chocolate."
              className={`${inputCls()} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Precio ($)" htmlFor="product_price" error={errors.product_price}>
              <input
                id="product_price"
                inputMode="decimal"
                value={form.product_price}
                onChange={(e) => set("product_price", e.target.value)}
                placeholder="45"
                className={inputCls(errors.product_price)}
              />
            </Field>
            <Field label="Stock" htmlFor="product_stock" error={errors.product_stock}>
              <input
                id="product_stock"
                inputMode="numeric"
                value={form.product_stock}
                onChange={(e) => set("product_stock", e.target.value)}
                placeholder="12"
                className={inputCls(errors.product_stock)}
              />
            </Field>
          </div>

          <Field label="URL de imagen (opcional)" htmlFor="product_image">
            <input
              id="product_image"
              value={form.product_image}
              onChange={(e) => set("product_image", e.target.value)}
              placeholder="https://..."
              className={inputCls()}
            />
          </Field>

          <Field label="Categoría (opcional)" htmlFor="category_id">
            <select
              id="category_id"
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className={inputCls()}
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-3 border-t border-border bg-card px-4 py-3 sm:-mx-6 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              {isSubmitting ? "Guardando..." : (isEdit ? "Guardar cambios" : "Crear producto")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}

function inputCls(error?: string) {
  return [
    "w-full rounded-md border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60",
    "outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30",
    error ? "border-destructive" : "border-border",
  ].join(" ")
}
