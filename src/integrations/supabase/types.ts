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
      content_import_batches: {
        Row: {
          batch_name: string
          completed_at: string | null
          created_at: string
          id: string
          processed_questions: number | null
          status: string | null
          total_questions: number | null
        }
        Insert: {
          batch_name: string
          completed_at?: string | null
          created_at?: string
          id?: string
          processed_questions?: number | null
          status?: string | null
          total_questions?: number | null
        }
        Update: {
          batch_name?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          processed_questions?: number | null
          status?: string | null
          total_questions?: number | null
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
      qa_article_translations: {
        Row: {
          created_at: string | null
          id: string
          source_article_id: string
          target_language: string
          translated_content: string
          translated_excerpt: string
          translated_title: string
          translation_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_article_id: string
          target_language: string
          translated_content: string
          translated_excerpt: string
          translated_title: string
          translation_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_article_id?: string
          target_language?: string
          translated_content?: string
          translated_excerpt?: string
          translated_title?: string
          translation_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_article_translations_source_article_id_fkey"
            columns: ["source_article_id"]
            isOneToOne: false
            referencedRelation: "qa_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_articles: {
        Row: {
          ai_optimization_score: number | null
          alt_text: string | null
          appointment_booking_enabled: boolean | null
          citation_ready: boolean | null
          city: string
          cluster_id: string | null
          cluster_position: number | null
          cluster_title: string | null
          content: string
          created_at: string
          excerpt: string
          final_cta_type: Database["public"]["Enums"]["cta_type"] | null
          final_cta_url: string | null
          funnel_stage: string
          h1_title: string | null
          h2_title: string | null
          h3_title: string | null
          id: string
          image_url: string | null
          intent: string | null
          language: string
          last_linked_at: string | null
          last_linked_by: string | null
          last_updated: string
          linking_notes: string | null
          location_focus: string | null
          markdown_frontmatter: Json | null
          multilingual_parent_id: string | null
          next_step_text: string | null
          next_step_url: string | null
          parent_id: string | null
          points_to_bofu_id: string | null
          points_to_mofu_id: string | null
          slug: string
          tags: string[] | null
          target_audience: string | null
          title: string
          topic: string
          updated_at: string
          variation_group: string | null
          voice_search_ready: boolean | null
        }
        Insert: {
          ai_optimization_score?: number | null
          alt_text?: string | null
          appointment_booking_enabled?: boolean | null
          citation_ready?: boolean | null
          city?: string
          cluster_id?: string | null
          cluster_position?: number | null
          cluster_title?: string | null
          content: string
          created_at?: string
          excerpt: string
          final_cta_type?: Database["public"]["Enums"]["cta_type"] | null
          final_cta_url?: string | null
          funnel_stage: string
          h1_title?: string | null
          h2_title?: string | null
          h3_title?: string | null
          id?: string
          image_url?: string | null
          intent?: string | null
          language?: string
          last_linked_at?: string | null
          last_linked_by?: string | null
          last_updated?: string
          linking_notes?: string | null
          location_focus?: string | null
          markdown_frontmatter?: Json | null
          multilingual_parent_id?: string | null
          next_step_text?: string | null
          next_step_url?: string | null
          parent_id?: string | null
          points_to_bofu_id?: string | null
          points_to_mofu_id?: string | null
          slug: string
          tags?: string[] | null
          target_audience?: string | null
          title: string
          topic: string
          updated_at?: string
          variation_group?: string | null
          voice_search_ready?: boolean | null
        }
        Update: {
          ai_optimization_score?: number | null
          alt_text?: string | null
          appointment_booking_enabled?: boolean | null
          citation_ready?: boolean | null
          city?: string
          cluster_id?: string | null
          cluster_position?: number | null
          cluster_title?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          final_cta_type?: Database["public"]["Enums"]["cta_type"] | null
          final_cta_url?: string | null
          funnel_stage?: string
          h1_title?: string | null
          h2_title?: string | null
          h3_title?: string | null
          id?: string
          image_url?: string | null
          intent?: string | null
          language?: string
          last_linked_at?: string | null
          last_linked_by?: string | null
          last_updated?: string
          linking_notes?: string | null
          location_focus?: string | null
          markdown_frontmatter?: Json | null
          multilingual_parent_id?: string | null
          next_step_text?: string | null
          next_step_url?: string | null
          parent_id?: string | null
          points_to_bofu_id?: string | null
          points_to_mofu_id?: string | null
          slug?: string
          tags?: string[] | null
          target_audience?: string | null
          title?: string
          topic?: string
          updated_at?: string
          variation_group?: string | null
          voice_search_ready?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_qa_articles_cluster_id"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "qa_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_qa_articles_points_to_bofu"
            columns: ["points_to_bofu_id"]
            isOneToOne: false
            referencedRelation: "qa_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_qa_articles_points_to_mofu"
            columns: ["points_to_mofu_id"]
            isOneToOne: false
            referencedRelation: "qa_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_articles_multilingual_parent_id_fkey"
            columns: ["multilingual_parent_id"]
            isOneToOne: false
            referencedRelation: "qa_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_articles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "qa_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_clusters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          language: string
          sort_order: number | null
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string
          sort_order?: number | null
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string
          sort_order?: number | null
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
      webhook_integrations: {
        Row: {
          configuration: Json | null
          created_at: string
          id: string
          integration_type: string
          is_active: boolean | null
          name: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      link_multilingual_articles: {
        Args: { english_id: string; translation_ids: string[] }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      cta_type:
        | "booking"
        | "consultation"
        | "download"
        | "newsletter"
        | "custom"
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
      cta_type: ["booking", "consultation", "download", "newsletter", "custom"],
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
