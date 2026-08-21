"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

export type ProductRow = Tables<"products">
export type CreateProductDto = TablesInsert<"products">
export type UpdateProductDto = TablesUpdate<"products">

export const productKeys = {
  all: ["products"] as const,
  detail: (id: number) => ["products", id] as const,
}

async function fetchProducts(): Promise<ProductRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("product_id", { ascending: false })

  if (error) throw error
  return data ?? []
}

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: fetchProducts,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateProductDto): Promise<ProductRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .insert(dto)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (product) => {
      toast.success(`Producto "${product.product_name}" creado correctamente`)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo crear el producto", {
        description: error.message,
      })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: number
      dto: UpdateProductDto
    }): Promise<ProductRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .update({ ...dto, product_updated_at: new Date().toISOString() })
        .eq("product_id", id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (product) => {
      toast.success(`Producto "${product.product_name}" actualizado correctamente`)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el producto", {
        description: error.message,
      })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (product: ProductRow): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("product_id", product.product_id)

      if (error) throw error
    },
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all })
      const previous = queryClient.getQueryData<ProductRow[]>(productKeys.all)

      queryClient.setQueryData<ProductRow[]>(productKeys.all, (old) =>
        old?.filter((row) => row.product_id !== product.product_id) ?? old,
      )

      return { previous }
    },
    onSuccess: (_, product) => {
      toast.success(`Producto "${product.product_name}" eliminado correctamente`)
    },
    onError: (error, product, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productKeys.all, context.previous)
      }
      toast.error(`No se pudo eliminar "${product.product_name}"`, {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
