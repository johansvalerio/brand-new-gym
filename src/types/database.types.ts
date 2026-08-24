export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: number
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: never
          link?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: never
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string | null
          id: number
          muscle_group: string
          name: string
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          id?: never
          muscle_group: string
          name: string
        }
        Update: {
          created_at?: string
          equipment?: string | null
          id?: never
          muscle_group?: string
          name?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          duration_days: number
          id: string
          is_active: boolean
          name: string
          price: number
          slug: string
        }
        Insert: {
          created_at?: string
          duration_days: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
          slug: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          product_created_at: string
          product_description: string | null
          product_id: number
          product_image: string | null
          product_name: string
          product_price: number
          product_stock: number
          product_updated_at: string
        }
        Insert: {
          category_id?: string | null
          product_created_at?: string
          product_description?: string | null
          product_id?: number
          product_image?: string | null
          product_name: string
          product_price?: number
          product_stock?: number
          product_updated_at?: string
        }
        Update: {
          category_id?: string | null
          product_created_at?: string
          product_description?: string | null
          product_id?: number
          product_image?: string | null
          product_name?: string
          product_price?: number
          product_stock?: number
          product_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          decided_at: string | null
          decided_by: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          plan_id: string
          requested_at: string
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount?: number
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          plan_id: string
          requested_at?: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          plan_id?: string
          requested_at?: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_days: {
        Row: {
          day_index: number
          focus: string
          id: number
          routine_id: number
        }
        Insert: {
          day_index: number
          focus: string
          id?: never
          routine_id: number
        }
        Update: {
          day_index?: number
          focus?: string
          id?: never
          routine_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "routine_days_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_exercises: {
        Row: {
          day_id: number
          exercise_id: number
          id: number
          notes: string | null
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
        }
        Insert: {
          day_id: number
          exercise_id: number
          id?: never
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
        }
        Update: {
          day_id?: number
          exercise_id?: number
          id?: never
          notes?: string | null
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          created_by: string
          days_per_week: number
          goal: Database["public"]["Enums"]["routine_goal"]
          id: number
          is_active: boolean
          is_shared: boolean
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          days_per_week?: number
          goal?: Database["public"]["Enums"]["routine_goal"]
          id?: never
          is_active?: boolean
          is_shared?: boolean
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          days_per_week?: number
          goal?: Database["public"]["Enums"]["routine_goal"]
          id?: never
          is_active?: boolean
          is_shared?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routines_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_votes: {
        Row: {
          created_at: string
          id: number
          routine_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          routine_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          routine_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_votes_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          auth_id: string | null
          avatar: string | null
          coach_id: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          join_date: string | null
          last_name: string | null
          last_visit: string | null
          membership_end: string | null
          membership_start: string | null
          membership_status:
            | Database["public"]["Enums"]["membership_status"]
            | null
          phone: string | null
          phone_verified: boolean | null
          plan_id: string | null
          provider: string | null
          provider_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          auth_id?: string | null
          avatar?: string | null
          coach_id?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          join_date?: string | null
          last_name?: string | null
          last_visit?: string | null
          membership_end?: string | null
          membership_start?: string | null
          membership_status?:
            | Database["public"]["Enums"]["membership_status"]
            | null
          phone?: string | null
          phone_verified?: boolean | null
          plan_id?: string | null
          provider?: string | null
          provider_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          auth_id?: string | null
          avatar?: string | null
          coach_id?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          join_date?: string | null
          last_name?: string | null
          last_visit?: string | null
          membership_end?: string | null
          membership_start?: string | null
          membership_status?:
            | Database["public"]["Enums"]["membership_status"]
            | null
          phone?: string | null
          phone_verified?: boolean | null
          plan_id?: string | null
          provider?: string | null
          provider_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      is_coach: { Args: Record<string, never>; Returns: boolean }
      expire_stale_memberships: { Args: Record<string, never>; Returns: undefined }
    }
    Enums: {
      membership_status: "active" | "inactive" | "pending" | "expired"
      payment_method: "sinpe" | "efectivo"
      payment_status: "pending" | "approved" | "rejected"
      routine_goal:
        | "fuerza"
        | "hipertrofia"
        | "resistencia"
        | "perdida_de_grasa"
        | "movilidad"
      user_role: "admin" | "user" | "coach"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<
  TableName extends keyof PublicSchema["Tables"],
  Table extends PublicSchema["Tables"][TableName] = PublicSchema["Tables"][TableName],
> = Table["Row"]

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"],
  Table extends PublicSchema["Tables"][TableName] = PublicSchema["Tables"][TableName],
> = Table["Insert"]

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"],
  Table extends PublicSchema["Tables"][TableName] = PublicSchema["Tables"][TableName],
> = Table["Update"]

export type Enums<
  EnumName extends keyof PublicSchema["Enums"],
> = PublicSchema["Enums"][EnumName]

export const Constants = {
  public: {
    Enums: {
      membership_status: ["active", "inactive", "pending", "expired"],
      payment_method: ["sinpe", "efectivo"],
      payment_status: ["pending", "approved", "rejected"],
      routine_goal: [
        "fuerza",
        "hipertrofia",
        "resistencia",
        "perdida_de_grasa",
        "movilidad",
      ],
      user_role: ["admin", "user", "coach"],
    },
  },
} as const
