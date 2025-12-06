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
    PostgrestVersion: "13.0.4"
  }
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
          variant_id: string | null
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
          variant_id?: string | null
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
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          product_count: number | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          product_count?: number | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          product_count?: number | null
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
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string | null
          id: string
          order_id: string | null
          redeemed_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          discount_kind: string
          discount_percent: number | null
          discount_value: number
          expiration_date: string | null
          expires_at: string | null
          expiry_date: string | null
          id: string
          max_discount: number | null
          max_uses: number | null
          minimum_amount: number | null
          usage_limit: number | null
          usage_limit_global: number | null
          usage_limit_per_user: number | null
          used_count: number | null
          uses: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_kind?: string
          discount_percent?: number | null
          discount_value: number
          expiration_date?: string | null
          expires_at?: string | null
          expiry_date?: string | null
          id?: string
          max_discount?: number | null
          max_uses?: number | null
          minimum_amount?: number | null
          usage_limit?: number | null
          usage_limit_global?: number | null
          usage_limit_per_user?: number | null
          used_count?: number | null
          uses?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_kind?: string
          discount_percent?: number | null
          discount_value?: number
          expiration_date?: string | null
          expires_at?: string | null
          expiry_date?: string | null
          id?: string
          max_discount?: number | null
          max_uses?: number | null
          minimum_amount?: number | null
          usage_limit?: number | null
          usage_limit_global?: number | null
          usage_limit_per_user?: number | null
          used_count?: number | null
          uses?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          size: string | null
          status: string
          total_price: number
          unit_price: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          quantity?: number
          size?: string | null
          status?: string
          total_price: number
          unit_price: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          status?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      product_color_variant_options: {
        Row: {
          color_variant_id: string
          created_at: string
          id: string
          price: number
          size: string
          stock: number
          updated_at: string
        }
        Insert: {
          color_variant_id: string
          created_at?: string
          id?: string
          price?: number
          size: string
          stock?: number
          updated_at?: string
        }
        Update: {
          color_variant_id?: string
          created_at?: string
          id?: string
          price?: number
          size?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_color_variant_options_color_variant_id_fkey"
            columns: ["color_variant_id"]
            isOneToOne: false
            referencedRelation: "product_color_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_color_variants: {
        Row: {
          color: string
          created_at: string
          id: string
          image: string | null
          product_id: string
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          image?: string | null
          product_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          image?: string | null
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_color_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          hex_code: string | null
          id: string
          image_url: string
          is_default: boolean | null
          label: string | null
          position: number | null
          price_adjustment: number | null
          product_id: string
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          hex_code?: string | null
          id?: string
          image_url: string
          is_default?: boolean | null
          label?: string | null
          position?: number | null
          price_adjustment?: number | null
          product_id: string
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          hex_code?: string | null
          id?: string
          image_url?: string
          is_default?: boolean | null
          label?: string | null
          position?: number | null
          price_adjustment?: number | null
          product_id?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
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
          status: string
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
          status?: string
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
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          address: string | null
          created_at: string
          id: string
          logo_url: string | null
          phone: string | null
          status: string
          store_description: string | null
          store_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          status?: string
          store_description?: string | null
          store_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          phone?: string | null
          status?: string
          store_description?: string | null
          store_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_coupon_atomic:
        | {
            Args: {
              p_coupon_id: string
              p_usage_limit_global?: number
              p_usage_limit_per_user?: number
              p_user_id?: string
            }
            Returns: string
          }
        | { Args: { coupon_code: string; user_uuid: string }; Returns: Json }
      approve_vendor: {
        Args: { target_vendor_profile_id: string }
        Returns: boolean
      }
      assign_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      can_manage_vendor_resources: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_user_authenticate: { Args: { _user_id: string }; Returns: boolean }
      cancel_user_order: { Args: { order_id: string }; Returns: boolean }
      check_ban_status: { Args: never; Returns: undefined }
      claim_coupon: {
        Args: { p_code: string }
        Returns: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          discount_kind: string
          discount_percent: number | null
          discount_value: number
          expiration_date: string | null
          expires_at: string | null
          expiry_date: string | null
          id: string
          max_discount: number | null
          max_uses: number | null
          minimum_amount: number | null
          usage_limit: number | null
          usage_limit_global: number | null
          usage_limit_per_user: number | null
          used_count: number | null
          uses: number | null
        }
        SetofOptions: {
          from: "*"
          to: "coupons"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_promotional_banner: {
        Args: { banner_id: string }
        Returns: boolean
      }
      delete_user_account: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      get_current_user_role: { Args: never; Returns: string }
      get_user_highest_role: { Args: { _user_id: string }; Returns: string }
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
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_vendor_order_items: {
        Args: { _order_id: string; _vendor_id?: string }
        Returns: {
          color: string
          item_id: string
          item_status: string
          product_id: string
          product_image: string
          product_name: string
          quantity: number
          size: string
          total_price: number
          unit_price: number
          vendor_id: string
        }[]
      }
      get_vendor_orders: {
        Args: { _status_filter?: string; _vendor_id?: string }
        Returns: {
          customer_email: string
          customer_name: string
          customer_phone: string
          item_count: number
          order_date: string
          order_id: string
          order_number: string
          order_status: string
          vendor_total: number
        }[]
      }
      get_vendor_products: {
        Args: { _status_filter?: string; _vendor_id?: string }
        Returns: {
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
          status: string | null
          stock: number | null
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_vendor_profiles_with_users: {
        Args: { status_filter?: string }
        Returns: {
          address: string
          created_at: string
          id: string
          logo_url: string
          phone: string
          status: string
          store_description: string
          store_name: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_vendor_admin: { Args: { _user_id: string }; Returns: boolean }
      update_order_item_status: {
        Args: { _item_id: string; _new_status: string }
        Returns: boolean
      }
      update_product_status: {
        Args: { _new_status: string; _product_id: string }
        Returns: boolean
      }
      update_user_status: {
        Args: { new_status: string; target_user_id: string }
        Returns: boolean
      }
      update_vendor_status: {
        Args: { new_status: string; target_vendor_profile_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "super_admin" | "user" | "vendor_admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "super_admin", "user", "vendor_admin"],
    },
  },
} as const
