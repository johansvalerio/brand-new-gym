"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types"
import { userFormSchema } from "../../lib/user.schema"

export type UserRow = Tables<"users"> & {
  plan: { id: string; slug: string; name: string } | null
}
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
    .select("*, plan:plans(id, slug, name)")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as UserRow[]
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
    .select("*, plan:plans(id, slug, name)")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data ?? null) as unknown as UserRow | null
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
      const parsed = userFormSchema.safeParse({
        first_name: dto.first_name as string,
        last_name: (dto.last_name as string) ?? null,
        email: dto.email as string,
        phone: (dto.phone as string) ?? null,
        avatar: (dto.avatar as string) ?? null,
        role: (dto.role as string) ?? "user",
        coach_id: (dto.coach_id as string) ?? null,
        membership_status: (dto.membership_status as string) ?? "pending",
        gender: (dto.gender as string) ?? null,
      })
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos")
      const supabase = createClient()
      const { data, error } = await supabase
        .from("users")
        .insert(dto)
        .select("*, plan:plans(id, slug, name)")
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as UserRow
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
      // zod defensivo: si dto trae email/role inválido, falla antes de Supabase (context7 RAISE EXCEPTION pattern)
      if (dto.email !== undefined) {
        const p = userFormSchema.safeParse({
          first_name: (dto.first_name as string) ?? "x",
          last_name: (dto.last_name as string) ?? null,
          email: dto.email as string,
          phone: (dto.phone as string) ?? null,
          avatar: (dto.avatar as string) ?? null,
          role: (dto.role as string) ?? "user",
          coach_id: (dto.coach_id as string) ?? null,
          membership_status: (dto.membership_status as string) ?? "active",
          gender: (dto.gender as string) ?? null,
        })
        if (!p.success) throw new Error(p.error.issues[0]?.message ?? "Datos inválidos")
      }
      const supabase = createClient()
      const { data, error } = await supabase
        .from("users")
        .update({ ...dto, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*, plan:plans(id, slug, name)")
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as UserRow
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

      if (error) throw new Error(error.message)
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
