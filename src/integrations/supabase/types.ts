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
    PostgrestVersion: "12.2.3 (519615d)"
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
      faq_analytics: {
        Row: {
          clicks_to_detail: number | null
          created_at: string
          date: string
          faq_id: string | null
          funnel_conversions: number | null
          id: string
          time_spent: number | null
          views: number | null
        }
        Insert: {
          clicks_to_detail?: number | null
          created_at?: string
          date?: string
          faq_id?: string | null
          funnel_conversions?: number | null
          id?: string
          time_spent?: number | null
          views?: number | null
        }
        Update: {
          clicks_to_detail?: number | null
          created_at?: string
          date?: string
          faq_id?: string | null
          funnel_conversions?: number | null
          id?: string
          time_spent?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_analytics_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          key: string
          language: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          key: string
          language: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          key?: string
          language?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_category_enhancements: {
        Row: {
          category_key: string
          created_at: string
          funnel_description: Json | null
          hero_text: string | null
          id: string
          language: string
          seo_description: string | null
          seo_title: string | null
          speakable_intro: string | null
          updated_at: string
        }
        Insert: {
          category_key: string
          created_at?: string
          funnel_description?: Json | null
          hero_text?: string | null
          id?: string
          language: string
          seo_description?: string | null
          seo_title?: string | null
          speakable_intro?: string | null
          updated_at?: string
        }
        Update: {
          category_key?: string
          created_at?: string
          funnel_description?: Json | null
          hero_text?: string | null
          id?: string
          language?: string
          seo_description?: string | null
          seo_title?: string | null
          speakable_intro?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faq_relations: {
        Row: {
          created_at: string | null
          faq_id: string | null
          id: string
          related_faq_id: string | null
          relation_type: string | null
        }
        Insert: {
          created_at?: string | null
          faq_id?: string | null
          id?: string
          related_faq_id?: string | null
          relation_type?: string | null
        }
        Update: {
          created_at?: string | null
          faq_id?: string | null
          id?: string
          related_faq_id?: string | null
          relation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_relations_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faq_relations_related_faq_id_fkey"
            columns: ["related_faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer_long: string | null
          answer_short: string
          author_name: string | null
          author_url: string | null
          category: string
          created_at: string | null
          funnel_stage: string | null
          id: string
          internal_links: Json | null
          is_featured: boolean | null
          is_speakable: boolean | null
          keywords: string[] | null
          language: string
          location: string | null
          meta_description: string | null
          meta_title: string | null
          property_types: string[] | null
          question: string
          related_faqs: string[] | null
          reviewed_at: string | null
          slug: string
          sort_order: number | null
          tags: string[] | null
          target_areas: string[] | null
          updated_at: string | null
          view_count: number | null
          voice_queries: string[] | null
        }
        Insert: {
          answer_long?: string | null
          answer_short: string
          author_name?: string | null
          author_url?: string | null
          category: string
          created_at?: string | null
          funnel_stage?: string | null
          id?: string
          internal_links?: Json | null
          is_featured?: boolean | null
          is_speakable?: boolean | null
          keywords?: string[] | null
          language: string
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          property_types?: string[] | null
          question: string
          related_faqs?: string[] | null
          reviewed_at?: string | null
          slug: string
          sort_order?: number | null
          tags?: string[] | null
          target_areas?: string[] | null
          updated_at?: string | null
          view_count?: number | null
          voice_queries?: string[] | null
        }
        Update: {
          answer_long?: string | null
          answer_short?: string
          author_name?: string | null
          author_url?: string | null
          category?: string
          created_at?: string | null
          funnel_stage?: string | null
          id?: string
          internal_links?: Json | null
          is_featured?: boolean | null
          is_speakable?: boolean | null
          keywords?: string[] | null
          language?: string
          location?: string | null
          meta_description?: string | null
          meta_title?: string | null
          property_types?: string[] | null
          question?: string
          related_faqs?: string[] | null
          reviewed_at?: string | null
          slug?: string
          sort_order?: number | null
          tags?: string[] | null
          target_areas?: string[] | null
          updated_at?: string | null
          view_count?: number | null
          voice_queries?: string[] | null
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
      get_related_faqs: {
        Args: {
          current_faq_id: string
          current_language?: string
          limit_count?: number
        }
        Returns: {
          answer_short: string
          category: string
          funnel_stage: string
          id: string
          question: string
          slug: string
        }[]
      }
      increment_faq_view_count: {
        Args: { faq_slug: string }
        Returns: undefined
      }
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
