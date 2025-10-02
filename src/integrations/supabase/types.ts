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
      blog_images: {
        Row: {
          alt: string
          blog_post_id: string
          caption: string | null
          created_at: string
          description: string | null
          exif: Json | null
          filename: string
          id: string
          sort_order: number | null
        }
        Insert: {
          alt: string
          blog_post_id: string
          caption?: string | null
          created_at?: string
          description?: string | null
          exif?: Json | null
          filename: string
          id?: string
          sort_order?: number | null
        }
        Update: {
          alt?: string
          blog_post_id?: string
          caption?: string | null
          created_at?: string
          description?: string | null
          exif?: Json | null
          filename?: string
          id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_images_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_links: {
        Row: {
          blog_post_id: string
          created_at: string
          id: string
          relation: string
          target_id: string
          target_type: string
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          id?: string
          relation: string
          target_id: string
          target_type: string
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          id?: string
          relation?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_links_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          ai_generated_image: boolean | null
          ai_score: number | null
          area_served: string[] | null
          author: string | null
          author_id: string | null
          canonical_url: string | null
          category_key: string
          city_tags: string[] | null
          content: string
          created_at: string
          custom_cta_text: string | null
          custom_cta_url: string | null
          excerpt: string
          external_links_ai: Json[] | null
          featured_image: string
          frontmatter_yaml: string | null
          funnel_stage: string | null
          geo_coordinates: Json | null
          github_path: string | null
          hero_image: Json | null
          id: string
          image_alt: string
          internal_links: Json[] | null
          keywords: string[] | null
          language: string
          markdown_hash: string | null
          meta_description: string | null
          meta_title: string | null
          next_step: Json | null
          published: boolean | null
          published_at: string | null
          reading_time_minutes: number | null
          reviewer: Json | null
          reviewer_id: string | null
          seo: Json | null
          slug: string
          speakable_answer: string | null
          speakable_questions: Json | null
          status: string | null
          tags: string[] | null
          title: string
          toc_data: Json | null
          updated_at: string
        }
        Insert: {
          ai_generated_image?: boolean | null
          ai_score?: number | null
          area_served?: string[] | null
          author?: string | null
          author_id?: string | null
          canonical_url?: string | null
          category_key: string
          city_tags?: string[] | null
          content: string
          created_at?: string
          custom_cta_text?: string | null
          custom_cta_url?: string | null
          excerpt: string
          external_links_ai?: Json[] | null
          featured_image: string
          frontmatter_yaml?: string | null
          funnel_stage?: string | null
          geo_coordinates?: Json | null
          github_path?: string | null
          hero_image?: Json | null
          id?: string
          image_alt: string
          internal_links?: Json[] | null
          keywords?: string[] | null
          language?: string
          markdown_hash?: string | null
          meta_description?: string | null
          meta_title?: string | null
          next_step?: Json | null
          published?: boolean | null
          published_at?: string | null
          reading_time_minutes?: number | null
          reviewer?: Json | null
          reviewer_id?: string | null
          seo?: Json | null
          slug: string
          speakable_answer?: string | null
          speakable_questions?: Json | null
          status?: string | null
          tags?: string[] | null
          title: string
          toc_data?: Json | null
          updated_at?: string
        }
        Update: {
          ai_generated_image?: boolean | null
          ai_score?: number | null
          area_served?: string[] | null
          author?: string | null
          author_id?: string | null
          canonical_url?: string | null
          category_key?: string
          city_tags?: string[] | null
          content?: string
          created_at?: string
          custom_cta_text?: string | null
          custom_cta_url?: string | null
          excerpt?: string
          external_links_ai?: Json[] | null
          featured_image?: string
          frontmatter_yaml?: string | null
          funnel_stage?: string | null
          geo_coordinates?: Json | null
          github_path?: string | null
          hero_image?: Json | null
          id?: string
          image_alt?: string
          internal_links?: Json[] | null
          keywords?: string[] | null
          language?: string
          markdown_hash?: string | null
          meta_description?: string | null
          meta_title?: string | null
          next_step?: Json | null
          published?: boolean | null
          published_at?: string | null
          reading_time_minutes?: number | null
          reviewer?: Json | null
          reviewer_id?: string | null
          seo?: Json | null
          slug?: string
          speakable_answer?: string | null
          speakable_questions?: Json | null
          status?: string | null
          tags?: string[] | null
          title?: string
          toc_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "content_authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "content_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      content_authors: {
        Row: {
          bio: string | null
          created_at: string
          credentials: string | null
          id: string
          name: string
          profile_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          credentials?: string | null
          id?: string
          name: string
          profile_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          credentials?: string | null
          id?: string
          name?: string
          profile_url?: string | null
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
      content_reviewers: {
        Row: {
          created_at: string
          credentials: string | null
          id: string
          name: string
          review_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials?: string | null
          id?: string
          name: string
          review_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials?: string | null
          id?: string
          name?: string
          review_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      external_links: {
        Row: {
          ai_confidence: number | null
          anchor_text: string
          approved_at: string | null
          approved_by: string | null
          article_id: string
          article_type: string
          authority_score: number | null
          context_snippet: string | null
          created_at: string | null
          id: string
          insertion_method: string | null
          position_in_text: number | null
          rejected: boolean | null
          rejected_reason: string | null
          relevance_score: number | null
          updated_at: string | null
          url: string
          verified: boolean | null
        }
        Insert: {
          ai_confidence?: number | null
          anchor_text: string
          approved_at?: string | null
          approved_by?: string | null
          article_id: string
          article_type: string
          authority_score?: number | null
          context_snippet?: string | null
          created_at?: string | null
          id?: string
          insertion_method?: string | null
          position_in_text?: number | null
          rejected?: boolean | null
          rejected_reason?: string | null
          relevance_score?: number | null
          updated_at?: string | null
          url: string
          verified?: boolean | null
        }
        Update: {
          ai_confidence?: number | null
          anchor_text?: string
          approved_at?: string | null
          approved_by?: string | null
          article_id?: string
          article_type?: string
          authority_score?: number | null
          context_snippet?: string | null
          created_at?: string | null
          id?: string
          insertion_method?: string | null
          position_in_text?: number | null
          rejected?: boolean | null
          rejected_reason?: string | null
          relevance_score?: number | null
          updated_at?: string | null
          url?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      image_metadata: {
        Row: {
          alt_text: Json
          article_id: string | null
          article_type: string | null
          caption: Json | null
          created_at: string | null
          description: string | null
          exif_latitude: number | null
          exif_location_name: string | null
          exif_longitude: number | null
          file_size: number | null
          height: number | null
          id: string
          mime_type: string | null
          storage_path: string
          title: string | null
          updated_at: string | null
          uploaded_at: string | null
          width: number | null
        }
        Insert: {
          alt_text?: Json
          article_id?: string | null
          article_type?: string | null
          caption?: Json | null
          created_at?: string | null
          description?: string | null
          exif_latitude?: number | null
          exif_location_name?: string | null
          exif_longitude?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          storage_path: string
          title?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: Json
          article_id?: string | null
          article_type?: string | null
          caption?: Json | null
          created_at?: string | null
          description?: string | null
          exif_latitude?: number | null
          exif_location_name?: string | null
          exif_longitude?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          storage_path?: string
          title?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          width?: number | null
        }
        Relationships: []
      }
      internal_links: {
        Row: {
          anchor_text: string
          approved_at: string | null
          approved_by: string | null
          context_snippet: string | null
          created_at: string | null
          id: string
          position_in_text: number | null
          rejected: boolean | null
          rejected_reason: string | null
          relevance_score: number | null
          source_article_id: string
          source_article_type: string
          target_article_id: string
          target_article_type: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          anchor_text: string
          approved_at?: string | null
          approved_by?: string | null
          context_snippet?: string | null
          created_at?: string | null
          id?: string
          position_in_text?: number | null
          rejected?: boolean | null
          rejected_reason?: string | null
          relevance_score?: number | null
          source_article_id: string
          source_article_type: string
          target_article_id: string
          target_article_type: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          anchor_text?: string
          approved_at?: string | null
          approved_by?: string | null
          context_snippet?: string | null
          created_at?: string | null
          id?: string
          position_in_text?: number | null
          rejected?: boolean | null
          rejected_reason?: string | null
          relevance_score?: number | null
          source_article_id?: string
          source_article_type?: string
          target_article_id?: string
          target_article_type?: string
          updated_at?: string | null
          verified?: boolean | null
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
      link_generation_batches: {
        Row: {
          batch_name: string
          completed_at: string | null
          created_at: string | null
          error_log: Json | null
          failed_articles: number | null
          id: string
          link_type: string
          processed_articles: number | null
          started_at: string | null
          status: string | null
          successful_links: number | null
          total_articles: number | null
        }
        Insert: {
          batch_name: string
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_articles?: number | null
          id?: string
          link_type: string
          processed_articles?: number | null
          started_at?: string | null
          status?: string | null
          successful_links?: number | null
          total_articles?: number | null
        }
        Update: {
          batch_name?: string
          completed_at?: string | null
          created_at?: string | null
          error_log?: Json | null
          failed_articles?: number | null
          id?: string
          link_type?: string
          processed_articles?: number | null
          started_at?: string | null
          status?: string | null
          successful_links?: number | null
          total_articles?: number | null
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
          ai_score: number | null
          alt_text: string | null
          appointment_booking_enabled: boolean | null
          area_served: string[] | null
          author: Json | null
          author_id: string | null
          citation_ready: boolean | null
          city: string
          cluster_id: string | null
          cluster_position: number | null
          cluster_title: string | null
          content: string
          created_at: string
          excerpt: string
          external_links_ai: Json[] | null
          final_cta_type: Database["public"]["Enums"]["cta_type"] | null
          final_cta_url: string | null
          frontmatter_yaml: string | null
          funnel_stage: string
          geo_coordinates: Json | null
          github_path: string | null
          h1_title: string | null
          h2_title: string | null
          h3_title: string | null
          hero_image: Json | null
          id: string
          image_url: string | null
          intent: string | null
          internal_links: Json[] | null
          language: string
          last_linked_at: string | null
          last_linked_by: string | null
          last_updated: string
          linking_notes: string | null
          location_focus: string | null
          markdown_frontmatter: Json | null
          markdown_hash: string | null
          multilingual_parent_id: string | null
          next_step: Json | null
          next_step_text: string | null
          next_step_url: string | null
          parent_id: string | null
          points_to_bofu_id: string | null
          points_to_mofu_id: string | null
          published: boolean | null
          reviewer: Json | null
          reviewer_id: string | null
          seo: Json | null
          slug: string
          speakable_answer: string | null
          speakable_questions: Json | null
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
          ai_score?: number | null
          alt_text?: string | null
          appointment_booking_enabled?: boolean | null
          area_served?: string[] | null
          author?: Json | null
          author_id?: string | null
          citation_ready?: boolean | null
          city?: string
          cluster_id?: string | null
          cluster_position?: number | null
          cluster_title?: string | null
          content: string
          created_at?: string
          excerpt: string
          external_links_ai?: Json[] | null
          final_cta_type?: Database["public"]["Enums"]["cta_type"] | null
          final_cta_url?: string | null
          frontmatter_yaml?: string | null
          funnel_stage: string
          geo_coordinates?: Json | null
          github_path?: string | null
          h1_title?: string | null
          h2_title?: string | null
          h3_title?: string | null
          hero_image?: Json | null
          id?: string
          image_url?: string | null
          intent?: string | null
          internal_links?: Json[] | null
          language?: string
          last_linked_at?: string | null
          last_linked_by?: string | null
          last_updated?: string
          linking_notes?: string | null
          location_focus?: string | null
          markdown_frontmatter?: Json | null
          markdown_hash?: string | null
          multilingual_parent_id?: string | null
          next_step?: Json | null
          next_step_text?: string | null
          next_step_url?: string | null
          parent_id?: string | null
          points_to_bofu_id?: string | null
          points_to_mofu_id?: string | null
          published?: boolean | null
          reviewer?: Json | null
          reviewer_id?: string | null
          seo?: Json | null
          slug: string
          speakable_answer?: string | null
          speakable_questions?: Json | null
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
          ai_score?: number | null
          alt_text?: string | null
          appointment_booking_enabled?: boolean | null
          area_served?: string[] | null
          author?: Json | null
          author_id?: string | null
          citation_ready?: boolean | null
          city?: string
          cluster_id?: string | null
          cluster_position?: number | null
          cluster_title?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          external_links_ai?: Json[] | null
          final_cta_type?: Database["public"]["Enums"]["cta_type"] | null
          final_cta_url?: string | null
          frontmatter_yaml?: string | null
          funnel_stage?: string
          geo_coordinates?: Json | null
          github_path?: string | null
          h1_title?: string | null
          h2_title?: string | null
          h3_title?: string | null
          hero_image?: Json | null
          id?: string
          image_url?: string | null
          intent?: string | null
          internal_links?: Json[] | null
          language?: string
          last_linked_at?: string | null
          last_linked_by?: string | null
          last_updated?: string
          linking_notes?: string | null
          location_focus?: string | null
          markdown_frontmatter?: Json | null
          markdown_hash?: string | null
          multilingual_parent_id?: string | null
          next_step?: Json | null
          next_step_text?: string | null
          next_step_url?: string | null
          parent_id?: string | null
          points_to_bofu_id?: string | null
          points_to_mofu_id?: string | null
          published?: boolean | null
          reviewer?: Json | null
          reviewer_id?: string | null
          seo?: Json | null
          slug?: string
          speakable_answer?: string | null
          speakable_questions?: Json | null
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
            foreignKeyName: "qa_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "content_authors"
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
          {
            foreignKeyName: "qa_articles_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "content_reviewers"
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
      user_preferences: {
        Row: {
          created_at: string
          currency: string
          date_format: string
          id: string
          language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          date_format?: string
          id?: string
          language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          date_format?: string
          id?: string
          language?: string
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
      link_multilingual_articles: {
        Args: { english_id: string; translation_ids: string[] }
        Returns: undefined
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
