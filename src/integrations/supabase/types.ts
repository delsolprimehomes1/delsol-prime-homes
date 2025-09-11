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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_data: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          conversions: number | null
          created_at: string
          date: string
          id: string
          page_path: string
          page_views: number | null
          unique_visitors: number | null
          user_id: string
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          created_at?: string
          date: string
          id?: string
          page_path: string
          page_views?: number | null
          unique_visitors?: number | null
          user_id: string
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          created_at?: string
          date?: string
          id?: string
          page_path?: string
          page_views?: number | null
          unique_visitors?: number | null
          user_id?: string
        }
        Relationships: []
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          expertise_areas: string[] | null
          id: string
          name: string
          profile_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          expertise_areas?: string[] | null
          id?: string
          name: string
          profile_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          expertise_areas?: string[] | null
          id?: string
          name?: string
          profile_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      backlinks: {
        Row: {
          anchor_text: string | null
          created_at: string
          domain_authority: number | null
          first_seen_at: string | null
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          link_type: string | null
          source_url: string
          target_url: string
          user_id: string
        }
        Insert: {
          anchor_text?: string | null
          created_at?: string
          domain_authority?: number | null
          first_seen_at?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          link_type?: string | null
          source_url: string
          target_url: string
          user_id: string
        }
        Update: {
          anchor_text?: string | null
          created_at?: string
          domain_authority?: number | null
          first_seen_at?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          link_type?: string | null
          source_url?: string
          target_url?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          key: string
          language: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          key: string
          language?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          key?: string
          language?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          canonical_url: string | null
          category_key: string
          city_tags: string[] | null
          content: string
          created_at: string
          excerpt: string
          featured_image: string
          id: string
          image_alt: string
          keywords: string[] | null
          language: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          canonical_url?: string | null
          category_key: string
          city_tags?: string[] | null
          content: string
          created_at?: string
          excerpt: string
          featured_image: string
          id?: string
          image_alt: string
          keywords?: string[] | null
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          canonical_url?: string | null
          category_key?: string
          city_tags?: string[] | null
          content?: string
          created_at?: string
          excerpt?: string
          featured_image?: string
          id?: string
          image_alt?: string
          keywords?: string[] | null
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      keyword_rankings: {
        Row: {
          clicks: number | null
          created_at: string
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          keyword_id: string
          position: number | null
          search_volume: number | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          keyword_id: string
          position?: number | null
          search_volume?: number | null
        }
        Update: {
          clicks?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          keyword_id?: string
          position?: number | null
          search_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_rankings_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "seo_keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          conversation_log: Json | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          source: string
          stage: string
          updated_at: string
        }
        Insert: {
          conversation_log?: Json | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          source?: string
          stage?: string
          updated_at?: string
        }
        Update: {
          conversation_log?: Json | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          source?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      qa_articles: {
        Row: {
          city: string
          content: string
          created_at: string
          excerpt: string
          funnel_stage: string
          id: string
          language: string
          last_updated: string
          next_step_text: string | null
          next_step_url: string | null
          slug: string
          tags: string[] | null
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          city?: string
          content: string
          created_at?: string
          excerpt: string
          funnel_stage: string
          id?: string
          language?: string
          last_updated?: string
          next_step_text?: string | null
          next_step_url?: string | null
          slug: string
          tags?: string[] | null
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          city?: string
          content?: string
          created_at?: string
          excerpt?: string
          funnel_stage?: string
          id?: string
          language?: string
          last_updated?: string
          next_step_text?: string | null
          next_step_url?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_console_data: {
        Row: {
          clicks: number | null
          created_at: string
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          page_url: string
          position: number | null
          query: string
          user_id: string
        }
        Insert: {
          clicks?: number | null
          created_at?: string
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          page_url: string
          position?: number | null
          query: string
          user_id: string
        }
        Update: {
          clicks?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          page_url?: string
          position?: number | null
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_keywords: {
        Row: {
          best_position: number | null
          created_at: string
          current_position: number | null
          difficulty_score: number | null
          id: string
          intent: Database["public"]["Enums"]["keyword_intent"] | null
          keyword: string
          search_volume: number | null
          target_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_position?: number | null
          created_at?: string
          current_position?: number | null
          difficulty_score?: number | null
          id?: string
          intent?: Database["public"]["Enums"]["keyword_intent"] | null
          keyword: string
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_position?: number | null
          created_at?: string
          current_position?: number | null
          difficulty_score?: number | null
          id?: string
          intent?: Database["public"]["Enums"]["keyword_intent"] | null
          keyword?: string
          search_volume?: number | null
          target_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          created_at: string
          id: string
          last_crawled_at: string | null
          meta_description: string | null
          page_type: Database["public"]["Enums"]["page_type"] | null
          target_keywords: string[] | null
          title: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_crawled_at?: string | null
          meta_description?: string | null
          page_type?: Database["public"]["Enums"]["page_type"] | null
          target_keywords?: string[] | null
          title?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_crawled_at?: string | null
          meta_description?: string | null
          page_type?: Database["public"]["Enums"]["page_type"] | null
          target_keywords?: string[] | null
          title?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_reports: {
        Row: {
          created_at: string
          data: Json | null
          expires_at: string | null
          generated_at: string | null
          id: string
          report_type: string
          status: Database["public"]["Enums"]["report_status"] | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          report_type: string
          status?: Database["public"]["Enums"]["report_status"] | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          report_type?: string
          status?: Database["public"]["Enums"]["report_status"] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          priority: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: number | null
          title?: string
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
      [_ in never]: never
    }
    Enums: {
      keyword_intent:
        | "informational"
        | "commercial"
        | "transactional"
        | "navigational"
      page_type: "homepage" | "property" | "location" | "blog" | "service"
      report_status: "pending" | "processing" | "completed" | "failed"
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
      keyword_intent: [
        "informational",
        "commercial",
        "transactional",
        "navigational",
      ],
      page_type: ["homepage", "property", "location", "blog", "service"],
      report_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const
