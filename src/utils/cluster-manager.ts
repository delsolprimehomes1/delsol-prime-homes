// Cluster Management Utilities for QA System
import { supabase } from '@/integrations/supabase/client';

export interface QACluster {
  id: string;
  title: string;
  description?: string;
  topic: string;
  language: string;
  sort_order: number;
  is_active: boolean;
  articles?: ClusteredQAArticle[];
}

export interface ClusteredQAArticle {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  funnel_stage: string;
  topic: string;
  language: string;
  cluster_id?: string | null;
  cluster_title?: string | null;
  cluster_position?: number | null;
  h1_title?: string | null;
  h2_title?: string | null;
  h3_title?: string | null;
  variation_group?: string | null;
  points_to_mofu_id?: string | null;
  points_to_bofu_id?: string | null;
  appointment_booking_enabled?: boolean | null;
  tags?: string[] | null;
  next_step_url?: string | null;
  next_step_text?: string | null;
  // Additional database fields
  ai_optimization_score?: number | null;
  alt_text?: string | null;
  citation_ready?: boolean | null;
  city?: string;
  created_at?: string;
  updated_at?: string;
  last_updated?: string;
  parent_id?: string | null;
  markdown_frontmatter?: any;
  voice_search_ready?: boolean | null;
  multilingual_parent_id?: string | null;
  image_url?: string | null;
  target_audience?: string | null;
  intent?: string | null;
  location_focus?: string | null;
}

export class ClusterManager {
  /**
   * Fetch all clusters with their articles
   */
  static async getAllClustersWithArticles(language: string = 'en'): Promise<QACluster[]> {
    try {
      const { data: clusters, error: clustersError } = await supabase
        .from('qa_clusters')
        .select('*')
        .eq('language', language)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (clustersError) throw clustersError;

      const clustersWithArticles = await Promise.all(
        (clusters || []).map(async (cluster) => {
          const { data: articles, error: articlesError } = await supabase
            .from('qa_articles')
            .select('*')
            .eq('cluster_id', cluster.id)
            .order('cluster_position', { ascending: true });

          if (articlesError) {
            console.error('Error fetching articles for cluster:', cluster.id, articlesError);
            return { ...cluster, articles: [] };
          }

          return {
            ...cluster,
            articles: (articles || []) as ClusteredQAArticle[]
          };
        })
      );

      return clustersWithArticles;
    } catch (error) {
      console.error('Error fetching clusters:', error);
      return [];
    }
  }

  /**
   * Create a new cluster with the 3→2→1 structure
   */
  static async createCluster(
    title: string,
    topic: string,
    language: string = 'en',
    description?: string
  ): Promise<string | null> {
    try {
      const { data: cluster, error } = await supabase
        .from('qa_clusters')
        .insert([{
          title,
          description,
          topic,
          language,
          sort_order: await this.getNextSortOrder(language)
        }])
        .select()
        .single();

      if (error) throw error;
      return cluster.id;
    } catch (error) {
      console.error('Error creating cluster:', error);
      return null;
    }
  }

  /**
   * Add article to cluster at specific position
   */
  static async addArticleToCluster(
    articleId: string,
    clusterId: string,
    position: number,
    h1Title: string,
    h2Title: string,
    h3Title: string,
    variationGroup?: string,
    pointsToMofuId?: string,
    pointsToBofuId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('qa_articles')
        .update({
          cluster_id: clusterId,
          cluster_position: position,
          h1_title: h1Title,
          h2_title: h2Title,
          h3_title: h3Title,
          variation_group: variationGroup,
          points_to_mofu_id: pointsToMofuId,
          points_to_bofu_id: pointsToBofuId,
          appointment_booking_enabled: position === 6 // BOFU articles enable booking
        })
        .eq('id', articleId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding article to cluster:', error);
      return false;
    }
  }

  /**
   * Get cluster by ID with articles
   */
  static async getClusterWithArticles(clusterId: string): Promise<QACluster | null> {
    try {
      const { data: cluster, error: clusterError } = await supabase
        .from('qa_clusters')
        .select('*')
        .eq('id', clusterId)
        .single();

      if (clusterError) throw clusterError;

      const { data: articles, error: articlesError } = await supabase
        .from('qa_articles')
        .select('*')
        .eq('cluster_id', clusterId)
        .order('cluster_position', { ascending: true });

      if (articlesError) throw articlesError;

      return {
        ...cluster,
        articles: (articles || []) as ClusteredQAArticle[]
      };
    } catch (error) {
      console.error('Error fetching cluster:', error);
      return null;
    }
  }

  /**
   * Validate cluster structure (3 TOFU → 2 MOFU → 1 BOFU)
   */
  static validateClusterStructure(articles: ClusteredQAArticle[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (articles.length !== 6) {
      errors.push(`Cluster must have exactly 6 articles, found ${articles.length}`);
    }

    const stages = articles.reduce((acc, article) => {
      acc[article.funnel_stage] = (acc[article.funnel_stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (stages.TOFU !== 3) {
      errors.push(`Must have exactly 3 TOFU articles, found ${stages.TOFU || 0}`);
    }

    if (stages.MOFU !== 2) {
      errors.push(`Must have exactly 2 MOFU articles, found ${stages.MOFU || 0}`);
    }

    if (stages.BOFU !== 1) {
      errors.push(`Must have exactly 1 BOFU article, found ${stages.BOFU || 0}`);
    }

    // Check positioning
    const tofuArticles = articles.filter(a => a.funnel_stage === 'TOFU').sort((a, b) => (a.cluster_position || 0) - (b.cluster_position || 0));
    const mofuArticles = articles.filter(a => a.funnel_stage === 'MOFU').sort((a, b) => (a.cluster_position || 0) - (b.cluster_position || 0));
    const bofuArticles = articles.filter(a => a.funnel_stage === 'BOFU').sort((a, b) => (a.cluster_position || 0) - (b.cluster_position || 0));

    if (tofuArticles.some((article, index) => article.cluster_position !== index + 1)) {
      errors.push('TOFU articles must be in positions 1, 2, 3');
    }

    if (mofuArticles.some((article, index) => article.cluster_position !== index + 4)) {
      errors.push('MOFU articles must be in positions 4, 5');
    }

    if (bofuArticles.length > 0 && bofuArticles[0].cluster_position !== 6) {
      errors.push('BOFU article must be in position 6');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Auto-organize existing articles into clusters
   */
  static async autoOrganizeIntoClusters(language: string = 'en'): Promise<{
    clustersCreated: number;
    articlesOrganized: number;
    errors: string[];
  }> {
    try {
      const { data: articles, error } = await supabase
        .from('qa_articles')
        .select('*')
        .eq('language', language)
        .is('cluster_id', null)
        .order('topic', { ascending: true });

      if (error) throw error;

      const errors: string[] = [];
      let clustersCreated = 0;
      let articlesOrganized = 0;

      // Group articles by topic
      const articlesByTopic = (articles || []).reduce((acc, article) => {
        if (!acc[article.topic]) acc[article.topic] = [];
        acc[article.topic].push(article);
        return acc;
      }, {} as Record<string, ClusteredQAArticle[]>);

      // Create clusters for each topic
      for (const [topic, topicArticles] of Object.entries(articlesByTopic)) {
        const tofuArticles = topicArticles.filter(a => a.funnel_stage === 'TOFU');
        const mofuArticles = topicArticles.filter(a => a.funnel_stage === 'MOFU');
        const bofuArticles = topicArticles.filter(a => a.funnel_stage === 'BOFU');

        // Create clusters based on available articles
        const maxClusters = Math.floor(Math.min(tofuArticles.length / 3, mofuArticles.length / 2, bofuArticles.length));

        for (let i = 0; i < maxClusters; i++) {
          const clusterId = await this.createCluster(
            `${topic} - Cluster ${i + 1}`,
            topic,
            language,
            `Auto-generated cluster for ${topic} topic`
          );

          if (!clusterId) {
            errors.push(`Failed to create cluster for topic: ${topic}`);
            continue;
          }

          // Add 3 TOFU articles
          for (let j = 0; j < 3; j++) {
            const article = tofuArticles[i * 3 + j];
            if (article) {
              await this.addArticleToCluster(
                article.id,
                clusterId,
                j + 1,
                `${topic} - Cluster ${i + 1}`,
                'TOFU - Top of Funnel',
                article.title,
                `tofu-group-${i + 1}`
              );
              articlesOrganized++;
            }
          }

          // Add 2 MOFU articles
          for (let j = 0; j < 2; j++) {
            const article = mofuArticles[i * 2 + j];
            if (article) {
              await this.addArticleToCluster(
                article.id,
                clusterId,
                j + 4,
                `${topic} - Cluster ${i + 1}`,
                'MOFU - Middle of Funnel',
                article.title
              );
              articlesOrganized++;
            }
          }

          // Add 1 BOFU article
          const bofuArticle = bofuArticles[i];
          if (bofuArticle) {
            await this.addArticleToCluster(
              bofuArticle.id,
              clusterId,
              6,
              `${topic} - Cluster ${i + 1}`,
              'BOFU - Bottom of Funnel',
              bofuArticle.title
            );
            articlesOrganized++;
          }

          clustersCreated++;
        }
      }

      return {
        clustersCreated,
        articlesOrganized,
        errors
      };
    } catch (error) {
      console.error('Error auto-organizing clusters:', error);
      return {
        clustersCreated: 0,
        articlesOrganized: 0,
        errors: ['Failed to auto-organize clusters']
      };
    }
  }

  private static async getNextSortOrder(language: string): Promise<number> {
    const { data, error } = await supabase
      .from('qa_clusters')
      .select('sort_order')
      .eq('language', language)
      .order('sort_order', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return 0;
    return (data[0].sort_order || 0) + 1;
  }
}