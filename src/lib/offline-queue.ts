"use client"

export type QueuedSale = {
  productId: number
  buyerId: string
  unitPrice: number
  quantity: number
  soldBy: string
  notes?: string | null
  queuedAt: string
}

const KEY = "offline_product_sales"

export function queueSale(sale: Omit<QueuedSale, "queuedAt">) {
  if (typeof window === "undefined") return
  const raw = localStorage.getItem(KEY)
  const list: QueuedSale[] = raw ? JSON.parse(raw) : []
  list.push({ ...sale, queuedAt: new Date().toISOString() })
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function peekQueue(): QueuedSale[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

export function clearQueue() {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEY)
}

export function dequeueOne(): QueuedSale | null {
  const list = peekQueue()
  if (list.length === 0) return null
  const [first, ...rest] = list
  localStorage.setItem(KEY, JSON.stringify(rest))
  return first
}

export function queueLength(): number {
  return peekQueue().length
}
