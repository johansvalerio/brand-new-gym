"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export type FoodRow = {
  id: number
  name: string
  kcal_100: number
  protein_100: number
  carbs_100: number
  fat_100: number
  image_url: string | null
}

export const foodKeys = {
  all: ["foods"] as const,
}

async function fetchFoods(): Promise<FoodRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("foods").select("*").order("name")
  if (error) throw new Error(error.message)
  return (data ?? []) as FoodRow[]
}

export function useFoods() {
  return useQuery({ queryKey: foodKeys.all, queryFn: fetchFoods })
}
