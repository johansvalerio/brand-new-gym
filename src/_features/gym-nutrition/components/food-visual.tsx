"use client"

import { Utensils } from "lucide-react"
import type { FoodRow } from "../hooks/useFoods"

export function FoodVisual({ food, className = "h-9 w-9" }: { food: FoodRow | null | undefined; className?: string }) {
  if (food?.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={food.image_url} alt={food.name} className={`${className} shrink-0 rounded-md border border-border bg-secondary object-cover`} />
  }
  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-md border border-border bg-primary/10 text-primary`}>
      <Utensils className="h-5 w-5" />
    </span>
  )
}
