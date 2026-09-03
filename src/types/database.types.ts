export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          gym_id: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          gym_id?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          gym_id?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          check_in_date: string
          checked_in_at: string
          gym_id: string
          id: number
          user_id: string
        }
        Insert: {
          check_in_date?: string
          checked_in_at?: string
          gym_id?: string
          id?: never
          user_id: string
        }
        Update: {
          check_in_date?: string
          checked_in_at?: string
          gym_id?: string
          id?: never
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string | null
          id: number
          image_url: string | null
          instructions: string | null
          muscle_group: string
          name: string
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          id?: never
          image_url?: string | null
          instructions?: string | null
          muscle_group: string
          name: string
        }
        Update: {
          created_at?: string
          equipment?: string | null
          id?: never
          image_url?: string | null
          instructions?: string | null
          muscle_group?: string
          name?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          carbs_100: number
          created_at: string
          fat_100: number
          id: number
          image_url: string | null
          kcal_100: number
          name: string
          protein_100: number
        }
        Insert: {
          carbs_100: number
          created_at?: string
          fat_100: number
          id?: never
          image_url?: string | null
          kcal_100: number
          name: string
          protein_100: number
        }
        Update: {
          carbs_100?: number
          created_at?: string
          fat_100?: number
          id?: never
          image_url?: string | null
          kcal_100?: number
          name?: string
          protein_100?: number
        }
        Relationships: []
      }
      gyms: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          primary_color: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          primary_color?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          primary_color?: string
          slug?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          gym_id: string
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
          gym_id?: string
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
          gym_id?: string
          id?: never
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_days: {
        Row: {
          day_index: number
          focus: string
          id: number
          plan_id: number
        }
        Insert: {
          day_index: number
          focus: string
          id?: never
          plan_id: number
        }
        Update: {
          day_index?: number
          focus?: string
          id?: never
          plan_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_meals: {
        Row: {
          day_id: number
          food_id: number
          grams: number
          id: number
          meal: string
          order_index: number
        }
        Insert: {
          day_id: number
          food_id: number
          grams: number
          id?: never
          meal: string
          order_index?: number
        }
        Update: {
          day_id?: number
          food_id?: number
          grams?: number
          id?: never
          meal?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_meals_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "nutrition_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_meals_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          created_at: string
          created_by: string | null
          goal: string
          gym_id: string
          id: number
          is_active: boolean
          is_shared: boolean
          kcal_target: number | null
          name: string
          notes: string | null
          protein_target: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          goal: string
          gym_id?: string
          id?: never
          is_active?: boolean
          is_shared?: boolean
          kcal_target?: number | null
          name: string
          notes?: string | null
          protein_target?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          goal?: string
          gym_id?: string
          id?: never
          is_active?: boolean
          is_shared?: boolean
          kcal_target?: number | null
          name?: string
          notes?: string | null
          protein_target?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_votes: {
        Row: {
          created_at: string
          id: number
          plan_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          plan_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          plan_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_votes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          decided_at: string | null
          decided_by: string | null
          gym_id: string
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
          gym_id?: string
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
          gym_id?: string
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
            foreignKeyName: "payments_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
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
      plans: {
        Row: {
          created_at: string
          duration_days: number
          gym_id: string
          id: string
          is_active: boolean
          name: string
          price: number
          slug: string
        }
        Insert: {
          created_at?: string
          duration_days: number
          gym_id?: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          slug: string
        }
        Update: {
          created_at?: string
          duration_days?: number
          gym_id?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sales: {
        Row: {
          buyer_id: string
          gym_id: string
          id: number
          notes: string | null
          payment_id: string | null
          product_id: number
          quantity: number
          sold_at: string
          sold_by: string | null
          status: string
          total: number
          unit_price: number
        }
        Insert: {
          buyer_id: string
          gym_id?: string
          id?: never
          notes?: string | null
          payment_id?: string | null
          product_id: number
          quantity: number
          sold_at?: string
          sold_by?: string | null
          status?: string
          total: number
          unit_price: number
        }
        Update: {
          buyer_id?: string
          gym_id?: string
          id?: never
          notes?: string | null
          payment_id?: string | null
          product_id?: number
          quantity?: number
          sold_at?: string
          sold_by?: string | null
          status?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sales_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sales_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_sales_sold_by_fkey"
            columns: ["sold_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          gym_id: string
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
          gym_id?: string
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
          gym_id?: string
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
          {
            foreignKeyName: "products_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
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
      routines: {
        Row: {
          created_at: string
          created_by: string | null
          days_per_week: number
          goal: Database["public"]["Enums"]["routine_goal"]
          gym_id: string
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
          created_by?: string | null
          days_per_week?: number
          goal?: Database["public"]["Enums"]["routine_goal"]
          gym_id?: string
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
          created_by?: string | null
          days_per_week?: number
          goal?: Database["public"]["Enums"]["routine_goal"]
          gym_id?: string
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
            foreignKeyName: "routines_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
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
      set_logs: {
        Row: {
          exercise_id: number
          id: number
          is_warmup: boolean
          reps: number
          set_number: number
          weight: number
          workout_log_id: number
        }
        Insert: {
          exercise_id: number
          id?: never
          is_warmup?: boolean
          reps: number
          set_number: number
          weight?: number
          workout_log_id: number
        }
        Update: {
          exercise_id?: number
          id?: never
          is_warmup?: boolean
          reps?: number
          set_number?: number
          weight?: number
          workout_log_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
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
          gender: Database["public"]["Enums"]["user_gender"] | null
          gym_id: string | null
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
          gender?: Database["public"]["Enums"]["user_gender"] | null
          gym_id?: string | null
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
          gender?: Database["public"]["Enums"]["user_gender"] | null
          gym_id?: string | null
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
            foreignKeyName: "users_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
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
      workout_logs: {
        Row: {
          completed_at: string | null
          gym_id: string
          id: number
          notes: string | null
          routine_day_id: number | null
          routine_id: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          gym_id?: string
          id?: never
          notes?: string | null
          routine_day_id?: number | null
          routine_id?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          gym_id?: string
          id?: never
          notes?: string | null
          routine_day_id?: number | null
          routine_id?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_routine_day_id_fkey"
            columns: ["routine_day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_membership: {
        Args: { target_plan_id: string; target_user_id: string }
        Returns: undefined
      }
      can_vote_routine: {
        Args: { target_routine_id: number; target_user_id: string }
        Returns: boolean
      }
      copy_shared_nutrition_plan: {
        Args: { source_plan_id: number }
        Returns: {
          created_at: string
          created_by: string | null
          goal: string
          gym_id: string
          id: number
          is_active: boolean
          is_shared: boolean
          kcal_target: number | null
          name: string
          notes: string | null
          protein_target: number | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "nutrition_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      copy_shared_routine: {
        Args: { source_routine_id: number }
        Returns: {
          created_at: string
          created_by: string | null
          days_per_week: number
          goal: Database["public"]["Enums"]["routine_goal"]
          gym_id: string
          id: number
          is_active: boolean
          is_shared: boolean
          name: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "routines"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finish_workout: {
        Args: { p_notes: string | null; p_workout_log_id: number }
        Returns: {
          completed_at: string | null
          gym_id: string
          id: number
          notes: string | null
          routine_day_id: number | null
          routine_id: number | null
          started_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workout_logs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_or_create_active_workout: {
        Args: { p_routine_day_id: number | null; p_routine_id: number | null }
        Returns: {
          completed_at: string | null
          gym_id: string
          id: number
          notes: string | null
          routine_day_id: number | null
          routine_id: number | null
          started_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workout_logs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      gym_before_update: { Args: { target_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_coach: { Args: never; Returns: boolean }
      my_gym_id: { Args: never; Returns: string }
      notify: {
        Args: {
          p_body?: string
          p_link?: string
          p_title: string
          p_type: string
          target_user_id: string
        }
        Returns: undefined
      }
      save_set: {
        Args: {
          p_exercise_id: number
          p_is_warmup: boolean
          p_reps: number
          p_set_number: number
          p_weight: number
          p_workout_log_id: number
        }
        Returns: {
          exercise_id: number
          id: number
          is_warmup: boolean
          reps: number
          set_number: number
          weight: number
          workout_log_id: number
        }
        SetofOptions: {
          from: "*"
          to: "set_logs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_workout: {
        Args: {
          p_notes: string | null
          p_routine_day_id: number | null
          p_routine_id: number | null
          p_sets: Json
        }
        Returns: {
          completed_at: string | null
          gym_id: string
          id: number
          notes: string | null
          routine_day_id: number | null
          routine_id: number | null
          started_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workout_logs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_workout: {
        Args: { p_routine_day_id: number | null; p_routine_id: number | null }
        Returns: {
          completed_at: string | null
          gym_id: string
          id: number
          notes: string | null
          routine_day_id: number | null
          routine_id: number | null
          started_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workout_logs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
      user_gender: "masculino" | "femenino" | "otro"
      user_role: "admin" | "user" | "coach"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
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
      user_gender: ["masculino", "femenino", "otro"],
      user_role: ["admin", "user", "coach"],
    },
  },
} as const
