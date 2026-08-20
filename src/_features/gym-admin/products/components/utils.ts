export const currency = (value: number) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(value)

export type StockLevel = "out" | "low" | "ok"

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return "out"
  if (stock <= 10) return "low"
  return "ok"
}

/** Tailwind classes for a stock badge based on its level. */
export function stockBadgeClasses(level: StockLevel) {
  switch (level) {
    case "out":
      return "border-destructive/40 bg-destructive/10 text-destructive"
    case "low":
      return "border-primary/40 bg-primary/10 text-primary"
    default:
      return "border-border bg-secondary text-muted-foreground"
  }
}

export function stockLabel(stock: number) {
  const level = stockLevel(stock)
  if (level === "out") return "Agotado"
  if (level === "low") return `Bajo · ${stock}`
  return `${stock} uds`
}
