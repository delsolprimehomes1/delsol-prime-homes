import { supabase } from '@/integrations/supabase/client';

export interface FunnelBottleneck {
  type: 'TOFU_TO_MOFU' | 'MOFU_TO_BOFU';
  targetArticle: {
    id: string;
    title: string;
    topic: string;
    funnel_stage: string;
  };
  sourceCount: number;
  sourceArticles: Array<{
    id: string;
    title: string;
    topic: string;
  }>;
}

export interface TopicAnalysis {
  topic: string;
  stages: {
    TOFU: number;
    MOFU: number;
    BOFU: number;
  };
  bottlenecks: FunnelBottleneck[];
  missingStages: string[];
}

export interface DuplicateCandidate {
  existing: {
    id: string;
    title: string;
    slug: string;
    topic: string;
    funnel_stage: string;
  };
  similarity: number;
  suggested_action: 'merge' | 'update' | 'skip';
}

export class FunnelAnalyzer {
  /**
   * Analyze funnel bottlenecks across all topics
   */
  static async analyzeFunnelBottlenecks(language: string = 'en'): Promise<FunnelBottleneck[]> {
    const bottlenecks: FunnelBottleneck[] = [];

    // Analyze TOFU → MOFU bottlenecks
    const { data: tofuBottlenecks } = await supabase
      .from('qa_articles')
      .select('id, title, topic, funnel_stage, points_to_mofu_id')
      .eq('language', language)
      .eq('funnel_stage', 'TOFU')
      .not('points_to_mofu_id', 'is', null);

    // Group TOFU articles by their MOFU target
    const tofuGrouped = new Map<string, any[]>();
    tofuBottlenecks?.forEach(article => {
      const mofuId = article.points_to_mofu_id;
      if (mofuId) {
        if (!tofuGrouped.has(mofuId)) {
          tofuGrouped.set(mofuId, []);
        }
        tofuGrouped.get(mofuId)?.push(article);
      }
    });

    // Identify bottlenecks (>5 articles pointing to same MOFU)
    for (const [mofuId, articles] of tofuGrouped) {
      if (articles.length > 5) {
        const { data: mofuArticle } = await supabase
          .from('qa_articles')
          .select('id, title, topic, funnel_stage')
          .eq('id', mofuId)
          .single();

        if (mofuArticle) {
          bottlenecks.push({
            type: 'TOFU_TO_MOFU',
            targetArticle: mofuArticle,
            sourceCount: articles.length,
            sourceArticles: articles.map(a => ({
              id: a.id,
              title: a.title,
              topic: a.topic
            }))
          });
        }
      }
    }

    // Analyze MOFU → BOFU bottlenecks
    const { data: mofuBottlenecks } = await supabase
      .from('qa_articles')
      .select('id, title, topic, funnel_stage, points_to_bofu_id')
      .eq('language', language)
      .eq('funnel_stage', 'MOFU')
      .not('points_to_bofu_id', 'is', null);

    const mofuGrouped = new Map<string, any[]>();
    mofuBottlenecks?.forEach(article => {
      const bofuId = article.points_to_bofu_id;
      if (bofuId) {
        if (!mofuGrouped.has(bofuId)) {
          mofuGrouped.set(bofuId, []);
        }
        mofuGrouped.get(bofuId)?.push(article);
      }
    });

    for (const [bofuId, articles] of mofuGrouped) {
      if (articles.length > 5) {
        const { data: bofuArticle } = await supabase
          .from('qa_articles')
          .select('id, title, topic, funnel_stage')
          .eq('id', bofuId)
          .single();

        if (bofuArticle) {
          bottlenecks.push({
            type: 'MOFU_TO_BOFU',
            targetArticle: bofuArticle,
            sourceCount: articles.length,
            sourceArticles: articles.map(a => ({
              id: a.id,
              title: a.title,
              topic: a.topic
            }))
          });
        }
      }
    }

    return bottlenecks;
  }

  /**
   * Analyze topic distribution and identify gaps
   */
  static async analyzeTopicDistribution(language: string = 'en'): Promise<TopicAnalysis[]> {
    const { data: articles } = await supabase
      .from('qa_articles')
      .select('id, title, topic, funnel_stage')
      .eq('language', language);

    if (!articles) return [];

    // Group by topic
    const topicGroups = new Map<string, any[]>();
    articles.forEach(article => {
      if (!topicGroups.has(article.topic)) {
        topicGroups.set(article.topic, []);
      }
      topicGroups.get(article.topic)?.push(article);
    });

    const analyses: TopicAnalysis[] = [];

    for (const [topic, topicArticles] of topicGroups) {
      const stages = {
        TOFU: topicArticles.filter(a => a.funnel_stage === 'TOFU').length,
        MOFU: topicArticles.filter(a => a.funnel_stage === 'MOFU').length,
        BOFU: topicArticles.filter(a => a.funnel_stage === 'BOFU').length
      };

      const missingStages = [];
      if (stages.TOFU === 0) missingStages.push('TOFU');
      if (stages.MOFU === 0) missingStages.push('MOFU');
      if (stages.BOFU === 0) missingStages.push('BOFU');

      // Analyze bottlenecks for this topic
      const allBottlenecks = await this.analyzeFunnelBottlenecks(language);
      const topicBottlenecks = allBottlenecks.filter(b => 
        b.targetArticle.topic === topic || 
        b.sourceArticles.some(s => s.topic === topic)
      );

      analyses.push({
        topic,
        stages,
        bottlenecks: topicBottlenecks,
        missingStages
      });
    }

    return analyses;
  }

  /**
   * Find potential duplicate articles before import
   */
  static async findDuplicateCandidates(
    newTitle: string, 
    newTopic: string, 
    newFunnelStage: string,
    language: string = 'en'
  ): Promise<DuplicateCandidate[]> {
    const { data: existingArticles } = await supabase
      .from('qa_articles')
      .select('id, title, slug, topic, funnel_stage')
      .eq('language', language)
      .eq('funnel_stage', newFunnelStage);

    if (!existingArticles) return [];

    const candidates: DuplicateCandidate[] = [];

    for (const existing of existingArticles) {
      const similarity = this.calculateTitleSimilarity(newTitle, existing.title);
      
      if (similarity > 0.7) {
        let suggested_action: 'merge' | 'update' | 'skip' = 'skip';
        
        if (similarity > 0.9 && existing.topic === newTopic) {
          suggested_action = 'update';
        } else if (similarity > 0.8) {
          suggested_action = 'merge';
        }

        candidates.push({
          existing,
          similarity,
          suggested_action
        });
      }
    }

    return candidates.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Find or suggest topic-specific MOFU/BOFU articles
   */
  static async findTopicSpecificTarget(
    sourceTopic: string,
    sourceStage: 'TOFU' | 'MOFU',
    language: string = 'en'
  ): Promise<{
    existing: Array<{id: string; title: string; topic: string;}>;
    suggested: Array<{title: string; topic: string;}>;
  }> {
    const targetStage = sourceStage === 'TOFU' ? 'MOFU' : 'BOFU';
    
    // Find existing topic-specific targets
    const { data: existing } = await supabase
      .from('qa_articles')
      .select('id, title, topic')
      .eq('language', language)
      .eq('funnel_stage', targetStage)
      .eq('topic', sourceTopic);

    const suggested = [];
    
    // Suggest new articles if none exist for this topic
    if (!existing || existing.length === 0) {
      if (sourceStage === 'TOFU') {
        suggested.push({
          title: `Complete guide to ${sourceTopic.toLowerCase()} considerations on Costa del Sol`,
          topic: sourceTopic
        });
      } else {
        suggested.push({
          title: `${sourceTopic} checklist for Costa del Sol property buyers`,
          topic: sourceTopic
        });
      }
    }

    return {
      existing: existing || [],
      suggested
    };
  }

  /**
   * Calculate similarity between two titles using simple word overlap
   */
  private static calculateTitleSimilarity(title1: string, title2: string): number {
    const words1 = title1.toLowerCase().split(/\s+/);
    const words2 = title2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Generate preview text for navigation buttons
   */
  static generateButtonPreview(targetTitle: string, targetTopic: string): string {
    const shortTitle = targetTitle.length > 50 
      ? targetTitle.substring(0, 47) + '...' 
      : targetTitle;
    
    return `${targetTopic}: ${shortTitle}`;
  }
}