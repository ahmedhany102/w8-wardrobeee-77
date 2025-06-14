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
      ads: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean | null
          position: number | null
          redirect_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          position?: number | null
          redirect_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          position?: number | null
          redirect_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          product_id: string
          quantity: number
          size: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          product_id: string
          quantity?: number
          size?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          product_id?: string
          quantity?: number
          size?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_settings: {
        Row: {
          address: string | null
          created_at: string | null
          developer_name: string | null
          developer_url: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          map_url: string | null
          phone: string | null
          store_name: string | null
          terms_and_conditions: string | null
          twitter: string | null
          updated_at: string | null
          website: string | null
          working_hours: string | null
          youtube: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          developer_name?: string | null
          developer_url?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          map_url?: string | null
          phone?: string | null
          store_name?: string | null
          terms_and_conditions?: string | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          working_hours?: string | null
          youtube?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          developer_name?: string | null
          developer_url?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          map_url?: string | null
          phone?: string | null
          store_name?: string | null
          terms_and_conditions?: string | null
          twitter?: string | null
          updated_at?: string | null
          website?: string | null
          working_hours?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expiration_date: string | null
          id: string
          is_active: boolean | null
          minimum_amount: number | null
          updated_at: string
          usage_limit: number | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          minimum_amount?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          coupon_info: Json | null
          created_at: string | null
          customer_info: Json
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_info: Json | null
          payment_status: string
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          coupon_info?: Json | null
          created_at?: string | null
          customer_info: Json
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          payment_info?: Json | null
          payment_status?: string
          status?: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          coupon_info?: Json | null
          created_at?: string | null
          customer_info?: Json
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_info?: Json | null
          payment_status?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          category_id: string | null
          colors: Json | null
          created_at: string | null
          description: string | null
          discount: number | null
          featured: boolean | null
          id: string
          image_url: string | null
          images: Json | null
          inventory: number | null
          main_image: string | null
          name: string | null
          price: number | null
          rating: number | null
          sizes: Json | null
          stock: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          colors?: Json | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          inventory?: number | null
          main_image?: string | null
          name?: string | null
          price?: number | null
          rating?: number | null
          sizes?: Json | null
          stock?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          colors?: Json | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          inventory?: number | null
          main_image?: string | null
          name?: string | null
          price?: number | null
          rating?: number | null
          sizes?: Json | null
          stock?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          ip_address: string | null
          is_admin: boolean | null
          is_blocked: boolean | null
          is_super_admin: boolean | null
          last_login: string | null
          name: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          ip_address?: string | null
          is_admin?: boolean | null
          is_blocked?: boolean | null
          is_super_admin?: boolean | null
          last_login?: string | null
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_admin?: boolean | null
          is_blocked?: boolean | null
          is_super_admin?: boolean | null
          last_login?: string | null
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_orders: {
        Args: { user_uuid: string }
        Returns: {
          coupon_info: Json | null
          created_at: string | null
          customer_info: Json
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_info: Json | null
          payment_status: string
          status: string
          total_amount: number
          updated_at: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
