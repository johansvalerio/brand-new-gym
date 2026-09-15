import { beforeEach, describe, expect, it } from "vitest"
import { clearQueue, dequeueOne, peekQueue, queueLength, queueSale } from "./offline-queue"

// offline-queue opera sobre window.localStorage; en vitest (node) se simula.
const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  ;(globalThis as unknown as Record<string, unknown>).window = {}
  ;(globalThis as unknown as Record<string, unknown>).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
    removeItem: (k: string) => {
      store.delete(k)
    },
  }
})

const sale = {
  productId: 1,
  buyerId: "123e4567-e89b-12d3-a456-426614174000",
  unitPrice: 2500,
  quantity: 2,
  soldBy: "123e4567-e89b-12d3-a456-426614174001",
  notes: null,
}

describe("offline-queue", () => {
  it("encola ventas con fecha y las lista en orden", () => {
    queueSale(sale)
    queueSale({ ...sale, quantity: 1 })
    expect(queueLength()).toBe(2)
    const [first] = peekQueue()
    expect(first.quantity).toBe(2)
    expect(typeof first.queuedAt).toBe("string")
  })

  it("dequeueOne saca la primera (FIFO) y clearQueue vacía", () => {
    queueSale(sale)
    queueSale({ ...sale, quantity: 5 })
    expect(dequeueOne()?.quantity).toBe(2)
    expect(queueLength()).toBe(1)
    clearQueue()
    expect(queueLength()).toBe(0)
    expect(dequeueOne()).toBeNull()
  })
})
