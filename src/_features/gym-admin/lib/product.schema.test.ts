import { describe, expect, it } from "vitest"
import { productFormSchema } from "./product.schema"

const valid = {
  product_name: "Creatina 500g",
  product_description: null,
  product_price: 15000,
  product_stock: 10,
  product_image: null,
  category_id: null,
}

describe("productFormSchema", () => {
  it("acepta un producto válido", () => {
    expect(productFormSchema.safeParse({ ...valid }).success).toBe(true)
  })

  it("rechaza nombre vacío", () => {
    expect(productFormSchema.safeParse({ ...valid, product_name: " " }).success).toBe(false)
  })

  it("rechaza precio negativo", () => {
    expect(productFormSchema.safeParse({ ...valid, product_price: -100 }).success).toBe(false)
  })

  it("convierte precio string numérico (coerce)", () => {
    const r = productFormSchema.safeParse({ ...valid, product_price: "15000" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.product_price).toBe(15000)
  })

  it("rechaza stock negativo o con decimales", () => {
    expect(productFormSchema.safeParse({ ...valid, product_stock: -1 }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, product_stock: 2.5 }).success).toBe(false)
  })

  it("acepta imagen vacía y rechaza URL inválida", () => {
    expect(productFormSchema.safeParse({ ...valid, product_image: "" }).success).toBe(true)
    expect(productFormSchema.safeParse({ ...valid, product_image: "foto" }).success).toBe(false)
  })
})
