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
      articles: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          feed_id: string
          guid: string | null
          id: string
          image_url: string | null
          published_at: string
          read_time: number | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          feed_id: string
          guid?: string | null
          id?: string
          image_url?: string | null
          published_at: string
          read_time?: number | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          feed_id?: string
          guid?: string | null
          id?: string
          image_url?: string | null
          published_at?: string
          read_time?: number | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      feeds: {
        Row: {
          article_count: number | null
          category: string
          created_at: string
          description: string | null
          id: string
          last_fetched_at: string | null
          last_updated: string | null
          name: string
          status: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          article_count?: number | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          last_fetched_at?: string | null
          last_updated?: string | null
          name: string
          status?: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          article_count?: number | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          last_fetched_at?: string | null
          last_updated?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      super_users: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_articles: {
        Row: {
          article_id: string
          created_at: string
          id: string
          is_pinned: boolean
          is_read: boolean
          read_at: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          is_read?: boolean
          read_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          is_read?: boolean
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feeds: {
        Row: {
          created_at: string
          feed_id: string
          id: string
          is_followed: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          feed_id: string
          id?: string
          is_followed?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          feed_id?: string
          id?: string
          is_followed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feeds_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_super_user: {
        Args: { user_email?: string }
        Returns: boolean
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
