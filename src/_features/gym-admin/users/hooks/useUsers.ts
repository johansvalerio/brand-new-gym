"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"

export type UserRow = Tables<"users">
export type CreateUserDto = TablesInsert<"users">
export type UpdateUserDto = TablesUpdate<"users">

export const userKeys = {
  all: ["users"] as const,
  detail: (id: string) => ["users", id] as const,
}

function userDisplayName(user: Pick<UserRow, "first_name" | "last_name">) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "Sin nombre"
}

async function fetchUsers(): Promise<UserRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: fetchUsers,
  })
}

async function fetchUser(id: string): Promise<UserRow | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: Boolean(id),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateUserDto): Promise<UserRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("users")
        .insert(dto)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (user) => {
      toast.success(`Usuario "${userDisplayName(user)}" creado correctamente`)
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo crear el usuario", {
        description: error.message,
      })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string
      dto: UpdateUserDto
    }): Promise<UserRow> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("users")
        .update({ ...dto, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (user) => {
      toast.success(`Usuario "${userDisplayName(user)}" actualizado correctamente`)
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el usuario", {
        description: error.message,
      })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (user: UserRow): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase.from("users").delete().eq("id", user.id)

      if (error) throw error
    },
    onMutate: async (user) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all })
      const previous = queryClient.getQueryData<UserRow[]>(userKeys.all)

      queryClient.setQueryData<UserRow[]>(userKeys.all, (old) =>
        old?.filter((row) => row.id !== user.id) ?? old,
      )

      return { previous }
    },
    onSuccess: (_, user) => {
      toast.success(`Usuario "${userDisplayName(user)}" eliminado correctamente`)
    },
    onError: (error, user, context) => {
      if (context?.previous) {
        queryClient.setQueryData(userKeys.all, context.previous)
      }
      toast.error(`No se pudo eliminar a "${userDisplayName(user)}"`, {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
