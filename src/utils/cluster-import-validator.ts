// Enhanced Cluster Import & Validation System
import { supabase } from '@/integrations/supabase/client';
import { ClusterManager, ClusteredQAArticle } from './cluster-manager';

export interface ClusterImportData {
  articles: Array<{
    title: string;
    content: string;
    excerpt: string;
    funnel_stage: 'TOFU' | 'MOFU' | 'BOFU';
    slug: string;
    topic: string;
    tags?: string[];
  }>;
}

export interface ClusterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  structure: {
    tofu: number;
    mofu: number;
    bofu: number;
  };
  linkingFlow: {
    tofuToMofu: boolean;
    mofuToBofu: boolean;
    validVariations: boolean;
  };
}

export interface ClusterJourneyMap {
  tofuArticles: string[]; // IDs of 3 TOFU variations
  mofuArticles: string[]; // IDs of 2 MOFU articles
  bofuArticle: string;    // ID of 1 BOFU article
  variationGroup: string; // Group identifier for TOFU variations
}

export class ClusterImportValidator {
  /**
   * Detect if content is a valid 3-2-1 cluster
   */
  static detectClusterStructure(articles: ClusterImportData['articles']): ClusterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const structure = {
      tofu: articles.filter(a => a.funnel_stage === 'TOFU').length,
      mofu: articles.filter(a => a.funnel_stage === 'MOFU').length,
      bofu: articles.filter(a => a.funnel_stage === 'BOFU').length,
    };

    // Validate exactly 6 articles
    if (articles.length !== 6) {
      errors.push(`Cluster must have exactly 6 articles, found ${articles.length}`);
    }

    // Validate 3-2-1 structure
    if (structure.tofu !== 3) {
      errors.push(`Must have exactly 3 TOFU articles, found ${structure.tofu}`);
    }
    if (structure.mofu !== 2) {
      errors.push(`Must have exactly 2 MOFU articles, found ${structure.mofu}`);
    }
    if (structure.bofu !== 1) {
      errors.push(`Must have exactly 1 BOFU article, found ${structure.bofu}`);
    }

    // Check topic consistency
    const topics = [...new Set(articles.map(a => a.topic))];
    if (topics.length > 1) {
      warnings.push(`Articles span multiple topics: ${topics.join(', ')}. Consider using a single topic per cluster.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      structure,
      linkingFlow: {
        tofuToMofu: structure.tofu === 3 && structure.mofu >= 1,
        mofuToBofu: structure.mofu === 2 && structure.bofu === 1,
        validVariations: structure.tofu === 3
      }
    };
  }

  /**
   * Import and create cluster with automatic linking
   */
  static async importClusterWithLinking(
    clusterTitle: string,
    clusterDescription: string,
    articles: ClusterImportData['articles'],
    language: string = 'en'
  ): Promise<{
    success: boolean;
    clusterId?: string;
    articleIds?: ClusterJourneyMap;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Validate structure first
      const validation = this.detectClusterStructure(articles);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Extract topic (use most common or first)
      const topic = articles[0].topic;

      // Create cluster
      const clusterId = await ClusterManager.createCluster(
        clusterTitle,
        topic,
        language,
        clusterDescription
      );

      if (!clusterId) {
        return {
          success: false,
          errors: ['Failed to create cluster']
        };
      }

      // Separate articles by funnel stage
      const tofuArticles = articles.filter(a => a.funnel_stage === 'TOFU');
      const mofuArticles = articles.filter(a => a.funnel_stage === 'MOFU');
      const bofuArticles = articles.filter(a => a.funnel_stage === 'BOFU');

      // Insert all articles into database first
      const insertedArticles: Record<string, string> = {};
      const variationGroup = `${topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      // Insert TOFU articles (positions 1-3)
      for (let i = 0; i < tofuArticles.length; i++) {
        const article = tofuArticles[i];
        const { data, error } = await supabase
          .from('qa_articles')
          .insert([{
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            funnel_stage: article.funnel_stage,
            topic: article.topic,
            language,
            tags: article.tags || [],
            cluster_id: clusterId,
            cluster_position: i + 1,
            h1_title: clusterTitle,
            h2_title: 'TOFU - Top of Funnel',
            h3_title: article.title,
            variation_group: variationGroup,
            ai_optimization_score: 85,
            voice_search_ready: true,
            citation_ready: true
          }])
          .select()
          .single();

        if (error) {
          errors.push(`Failed to insert TOFU article ${i + 1}: ${error.message}`);
        } else if (data) {
          insertedArticles[`tofu_${i}`] = data.id;
        }
      }

      // Insert MOFU articles (positions 4-5)
      for (let i = 0; i < mofuArticles.length; i++) {
        const article = mofuArticles[i];
        const { data, error } = await supabase
          .from('qa_articles')
          .insert([{
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            funnel_stage: article.funnel_stage,
            topic: article.topic,
            language,
            tags: article.tags || [],
            cluster_id: clusterId,
            cluster_position: i + 4,
            h1_title: clusterTitle,
            h2_title: 'MOFU - Middle of Funnel',
            h3_title: article.title,
            ai_optimization_score: 90,
            voice_search_ready: true,
            citation_ready: true
          }])
          .select()
          .single();

        if (error) {
          errors.push(`Failed to insert MOFU article ${i + 1}: ${error.message}`);
        } else if (data) {
          insertedArticles[`mofu_${i}`] = data.id;
        }
      }

      // Insert BOFU article (position 6)
      const bofuArticle = bofuArticles[0];
      const { data: bofuData, error: bofuError } = await supabase
        .from('qa_articles')
        .insert([{
          title: bofuArticle.title,
          slug: bofuArticle.slug,
          content: bofuArticle.content,
          excerpt: bofuArticle.excerpt,
          funnel_stage: bofuArticle.funnel_stage,
          topic: bofuArticle.topic,
          language,
          tags: bofuArticle.tags || [],
          cluster_id: clusterId,
          cluster_position: 6,
          h1_title: clusterTitle,
          h2_title: 'BOFU - Bottom of Funnel',
          h3_title: bofuArticle.title,
          appointment_booking_enabled: true,
          ai_optimization_score: 95,
          voice_search_ready: true,
          citation_ready: true
        }])
        .select()
        .single();

      if (bofuError) {
        errors.push(`Failed to insert BOFU article: ${bofuError.message}`);
      } else if (bofuData) {
        insertedArticles['bofu_0'] = bofuData.id;
      }

      // Now update linking: All TOFU → both MOFU, both MOFU → BOFU
      const mofuId1 = insertedArticles['mofu_0'];
      const mofuId2 = insertedArticles['mofu_1'];
      const bofuId = insertedArticles['bofu_0'];

      // Update all 3 TOFU to point to both MOFU articles (using first as primary)
      for (let i = 0; i < 3; i++) {
        const tofuId = insertedArticles[`tofu_${i}`];
        if (tofuId && mofuId1) {
          await supabase
            .from('qa_articles')
            .update({ 
              points_to_mofu_id: mofuId1,
              next_step_url: `/qa/${mofuArticles[0].slug}`,
              next_step_text: 'Learn more about this'
            })
            .eq('id', tofuId);
        }
      }

      // Update both MOFU to point to BOFU
      if (mofuId1 && bofuId) {
        await supabase
          .from('qa_articles')
          .update({ 
            points_to_bofu_id: bofuId,
            next_step_url: `/qa/${bofuArticle.slug}`,
            next_step_text: 'Get personalized advice'
          })
          .eq('id', mofuId1);
      }
      if (mofuId2 && bofuId) {
        await supabase
          .from('qa_articles')
          .update({ 
            points_to_bofu_id: bofuId,
            next_step_url: `/qa/${bofuArticle.slug}`,
            next_step_text: 'Get personalized advice'
          })
          .eq('id', mofuId2);
      }

      return {
        success: true,
        clusterId,
        articleIds: {
          tofuArticles: [insertedArticles['tofu_0'], insertedArticles['tofu_1'], insertedArticles['tofu_2']],
          mofuArticles: [mofuId1, mofuId2],
          bofuArticle: bofuId,
          variationGroup
        },
        errors
      };

    } catch (error) {
      console.error('Cluster import error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error during import']
      };
    }
  }

  /**
   * Validate journey flow of existing cluster
   */
  static async validateClusterJourney(clusterId: string): Promise<{
    isValid: boolean;
    errors: string[];
    journeyMap?: ClusterJourneyMap;
  }> {
    try {
      const cluster = await ClusterManager.getClusterWithArticles(clusterId);
      if (!cluster || !cluster.articles) {
        return {
          isValid: false,
          errors: ['Cluster not found or has no articles']
        };
      }

      const errors: string[] = [];
      const articles = cluster.articles;

      // Validate structure
      const validation = ClusterManager.validateClusterStructure(articles);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }

      // Validate linking flow
      const tofuArticles = articles.filter(a => a.funnel_stage === 'TOFU');
      const mofuArticles = articles.filter(a => a.funnel_stage === 'MOFU');
      const bofuArticles = articles.filter(a => a.funnel_stage === 'BOFU');

      // Check all TOFU point to same MOFU
      const tofuTargets = new Set(tofuArticles.map(a => a.points_to_mofu_id).filter(Boolean));
      if (tofuTargets.size === 0) {
        errors.push('TOFU articles are not linked to MOFU');
      } else if (tofuTargets.size > 1) {
        errors.push('TOFU articles point to different MOFU articles - they should all point to the same MOFU');
      }

      // Check all MOFU point to same BOFU
      const mofuTargets = new Set(mofuArticles.map(a => a.points_to_bofu_id).filter(Boolean));
      if (mofuTargets.size === 0) {
        errors.push('MOFU articles are not linked to BOFU');
      } else if (mofuTargets.size > 1) {
        errors.push('MOFU articles point to different BOFU articles - they should all point to the same BOFU');
      }

      // Check TOFU variations use same variation_group
      const variationGroups = new Set(tofuArticles.map(a => a.variation_group).filter(Boolean));
      if (variationGroups.size > 1) {
        errors.push('TOFU variations should share the same variation_group identifier');
      }

      const journeyMap: ClusterJourneyMap | undefined = articles.length === 6 ? {
        tofuArticles: tofuArticles.map(a => a.id),
        mofuArticles: mofuArticles.map(a => a.id),
        bofuArticle: bofuArticles[0]?.id || '',
        variationGroup: tofuArticles[0]?.variation_group || ''
      } : undefined;

      return {
        isValid: errors.length === 0,
        errors,
        journeyMap
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error']
      };
    }
  }

  /**
   * Restructure existing scattered QAs into clusters
   */
  static async suggestClusterGroupings(language: string = 'en'): Promise<{
    suggestedClusters: Array<{
      topic: string;
      title: string;
      articles: ClusteredQAArticle[];
      canFormCluster: boolean;
      missing: string[];
    }>;
  }> {
    try {
      // Fetch all unclustered articles
      const { data: articles, error } = await supabase
        .from('qa_articles')
        .select('*')
        .eq('language', language)
        .is('cluster_id', null);

      if (error) throw error;

      // Group by topic
      const byTopic = (articles || []).reduce((acc, article) => {
        if (!acc[article.topic]) acc[article.topic] = [];
        acc[article.topic].push(article as ClusteredQAArticle);
        return acc;
      }, {} as Record<string, ClusteredQAArticle[]>);

      // Analyze each topic
      const suggestions = Object.entries(byTopic).map(([topic, topicArticles]) => {
        const tofu = topicArticles.filter(a => a.funnel_stage === 'TOFU');
        const mofu = topicArticles.filter(a => a.funnel_stage === 'MOFU');
        const bofu = topicArticles.filter(a => a.funnel_stage === 'BOFU');

        const missing: string[] = [];
        if (tofu.length < 3) missing.push(`${3 - tofu.length} more TOFU`);
        if (mofu.length < 2) missing.push(`${2 - mofu.length} more MOFU`);
        if (bofu.length < 1) missing.push('1 BOFU');

        const canFormCluster = tofu.length >= 3 && mofu.length >= 2 && bofu.length >= 1;

        return {
          topic,
          title: `${topic} - Cluster`,
          articles: topicArticles,
          canFormCluster,
          missing
        };
      });

      return { suggestedClusters: suggestions };

    } catch (error) {
      console.error('Error suggesting clusters:', error);
      return { suggestedClusters: [] };
    }
  }
}
