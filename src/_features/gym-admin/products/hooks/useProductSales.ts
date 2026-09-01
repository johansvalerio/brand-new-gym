"use client"

import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"
import { productKeys } from "./useProducts"
import { queueSale, peekQueue, clearQueue } from "@/lib/offline-queue"

export type ProductSaleRow = Tables<"product_sales"> & {
  buyer: { id: string; first_name: string | null; last_name: string | null; email: string | null } | null
  product: { product_id: number; product_name: string; product_image: string | null } | null
}

export type CreateSaleInput = {
  productId: number
  buyerId: string
  unitPrice: number
  quantity: number
  soldBy: string
  notes?: string | null
}

function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export const salesKeys = {
  all:    ["product-sales"] as const,
  recent: (limit: number) => ["product-sales", "recent", limit] as const,
  stats:  (ym = monthKey()) => ["product-sales", "stats", ym] as const,
}

async function fetchRecentSales(limit: number): Promise<ProductSaleRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("product_sales")
    .select(`
      id, product_id, buyer_id, quantity, unit_price, total, sold_by, payment_id, sold_at, notes, status,
      buyer:users!product_sales_buyer_id_fkey ( id, first_name, last_name, email ),
      product:products!product_sales_product_id_fkey ( product_id, product_name, product_image )
    `)
    .order("sold_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ProductSaleRow[]
}

export type SalesStats = {
  totalRevenueMonth: number
  unitsMonth: number
  topProduct: { product_id: number; product_name: string; units: number; revenue: number } | null
}

async function fetchSalesStats(): Promise<SalesStats> {
  const supabase = createClient()
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("product_sales")
    .select("quantity, total, product_id, product:products!product_sales_product_id_fkey ( product_name )")
    .eq("status", "approved")
    .gte("sold_at", startOfMonth.toISOString())

  if (error) throw new Error(error.message)
  const rows = (data ?? []) as unknown as {
    quantity: number
    total: number
    product_id: number
    product: { product_name: string } | null
  }[]

  const totalRevenueMonth = rows.reduce((s, r) => s + r.total, 0)
  const unitsMonth = rows.reduce((s, r) => s + r.quantity, 0)

  const productMap = new Map<number, { product_name: string; units: number; revenue: number }>()
  for (const r of rows) {
    const cur = productMap.get(r.product_id) ?? {
      product_name: r.product?.product_name ?? "Producto",
      units: 0,
      revenue: 0,
    }
    cur.units += r.quantity
    cur.revenue += r.total
    productMap.set(r.product_id, cur)
  }
  const sorted = [...productMap.entries()].sort((a, b) => b[1].units - a[1].units)
  const top = sorted[0]
  const topProduct = top
    ? { product_id: top[0], product_name: top[1].product_name, units: top[1].units, revenue: top[1].revenue }
    : null

  return { totalRevenueMonth, unitsMonth, topProduct }
}

export function useRecentSales(limit = 20) {
  return useQuery({
    queryKey: salesKeys.recent(limit),
    queryFn: () => fetchRecentSales(limit),
  })
}

export function useSalesStats() {
  const ym = monthKey()
  return useQuery({
    queryKey: salesKeys.stats(ym),
    queryFn: fetchSalesStats,
    staleTime: 60_000,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()

  return useMutation<ProductSaleRow, Error, CreateSaleInput>({
    mutationFn: async (input) => {
      if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
        throw new Error("Cantidad debe ser un entero mayor a 0.")
      }
      if (input.unitPrice < 0) throw new Error("Precio inválido.")
      // Red offline: si no hay conexión, encola en localStorage (B incremental offline)
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        queueSale(input)
        // Devuelve un stub para que onSuccess muestre toast offline y no falle
        throw new Error("OFFLINE_QUEUED")
      }
      const supabase = createClient()
      const { data, error } = await supabase
        .from("product_sales")
        .insert({
          product_id: input.productId,
          buyer_id:   input.buyerId,
          sold_by:    input.soldBy,
          quantity:   input.quantity,
          unit_price: input.unitPrice,
          total:      input.unitPrice * input.quantity,
          notes:      input.notes ?? null,
          status:     "pending",
        })
        .select(`
          id, product_id, buyer_id, quantity, unit_price, total, sold_by, payment_id, sold_at, notes, status,
          buyer:users!product_sales_buyer_id_fkey ( id, first_name, last_name, email ),
          product:products!product_sales_product_id_fkey ( product_id, product_name, product_image )
        `)
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as ProductSaleRow
    },
    onSuccess: (sale) => {
      const qty = sale.quantity
      const name = sale.product?.product_name ?? "producto"
      toast.success("Solicitud enviada", {
        description: `${qty}× ${name} — pendiente de entrega en el gym (SINPE/efectivo)`,
      })
    },
    onError: (error) => {
      if (error.message === "OFFLINE_QUEUED") {
        toast.info("Sin conexión — solicitud guardada", {
          description: "Se enviará automáticamente al reconectar.",
        })
        return
      }
      toast.error("No se pudo registrar la solicitud", {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all })
    },
  })
}

export function useOfflineSalesSync() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const flush = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return
      const queued = peekQueue()
      if (queued.length === 0) return
      const supabase = createClient()
      let sent = 0
      for (const q of queued) {
        const { error } = await supabase.from("product_sales").insert({
          product_id: q.productId,
          buyer_id: q.buyerId,
          sold_by: q.soldBy,
          quantity: q.quantity,
          unit_price: q.unitPrice,
          total: q.unitPrice * q.quantity,
          notes: q.notes ?? null,
          status: "pending",
        })
        if (!error) sent++
        else break
      }
      if (sent > 0) {
        // conserva los no enviados
        if (sent < queued.length) {
          const remaining = queued.slice(sent)
          if (typeof window !== "undefined") localStorage.setItem("offline_product_sales", JSON.stringify(remaining))
        } else {
          clearQueue()
          toast.success(`Sincronizadas ${sent} solicitudes offline`)
        }
        queryClient.invalidateQueries({ queryKey: salesKeys.all })
      }
    }
    window.addEventListener("online", flush)
    flush()
    return () => window.removeEventListener("online", flush)
  }, [queryClient])
}

export function useDecideSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("product_sales")
        .update({ status })
        .eq("id", id)
        .select(`
          id, product_id, buyer_id, quantity, unit_price, total, sold_by, payment_id, sold_at, notes, status,
          buyer:users!product_sales_buyer_id_fkey ( id, first_name, last_name, email ),
          product:products!product_sales_product_id_fkey ( product_id, product_name, product_image )
        `)
        .single()
      if (error) throw new Error(error.message)
      return data as unknown as ProductSaleRow
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.status === "approved" ? "Venta aprobada — stock descontado" : "Venta rechazada")
      queryClient.invalidateQueries({ queryKey: salesKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error: Error) => {
      toast.error("No se pudo actualizar la venta", { description: error.message })
    },
  })
}
