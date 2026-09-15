"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useGym } from "@/app/providers/gym-provider"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { productFormSchema } from "../../lib/product.schema"

export type ProductRow = Tables<"products"> & {
  category: { id: string; slug: string; name: string } | null
}
export type CreateProductDto = TablesInsert<"products">
export type UpdateProductDto = TablesUpdate<"products">

export const productKeys = {
  all: ["products"] as const,
  /** Catálogo por gym: sin gym en la key, el caché mezclaría gyms. */
  byGym: (gymId: string) => ["products", gymId] as const,
  detail: (id: number) => ["products", id] as const,
}

async function fetchProducts(gymId: string): Promise<ProductRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, slug, name)")
    .eq("gym_id", gymId)
    .order("product_id", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ProductRow[]
}

export function useProducts() {
  const gym = useGym()
  const gymId = gym?.id ?? "none"
  return useQuery({
    queryKey: productKeys.byGym(gymId),
    queryFn: () => fetchProducts(gymId),
    enabled: !!gym?.id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateProductDto): Promise<ProductRow> => {
      const parsed = productFormSchema.safeParse({
        product_name: dto.product_name as string,
        product_description: (dto.product_description as string) ?? null,
        product_price: dto.product_price as number,
        product_stock: dto.product_stock as number,
        product_image: (dto.product_image as string) ?? null,
        category_id: (dto.category_id as string) ?? null,
      })
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos")
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .insert(dto)
        .select("*, category:categories(id, slug, name)")
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as ProductRow
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
        .select("*, category:categories(id, slug, name)")
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as ProductRow
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

      if (error) throw new Error(error.message)
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
