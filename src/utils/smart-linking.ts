import { supabase } from '@/integrations/supabase/client';
import { FunnelAnalyzer } from './funnel-analyzer';

export interface SmartLinkingSuggestion {
  sourceId: string;
  sourceTitle: string;
  currentTarget?: {
    id: string;
    title: string;
    topic: string;
  };
  suggestedTarget: {
    id: string;
    title: string;
    topic: string;
    reason: string;
  };
  confidence: number;
}

export interface LinkingStrategy {
  type: 'topic_specific' | 'create_new' | 'rebalance_existing';
  description: string;
  articles_affected: number;
}

export class SmartLinkingEngine {
  /**
   * Generate smart linking suggestions for a specific article
   */
  static async generateLinkingSuggestions(
    articleId: string,
    language: string = 'en'
  ): Promise<SmartLinkingSuggestion[]> {
    const { data: article } = await supabase
      .from('qa_articles')
      .select('id, title, topic, funnel_stage, points_to_mofu_id, points_to_bofu_id')
      .eq('id', articleId)
      .single();

    if (!article) return [];

    const suggestions: SmartLinkingSuggestion[] = [];
    const targetStage = article.funnel_stage === 'TOFU' ? 'MOFU' : 'BOFU';

    if (article.funnel_stage === 'BOFU') return suggestions; // BOFU articles don't link further

    // Find topic-specific targets
    const topicTargets = await this.findTopicSpecificTargets(
      article.topic,
      targetStage,
      language
    );

    // Find generic targets (for comparison)
    const genericTargets = await this.findGenericTargets(targetStage, language);

    // Generate suggestions based on topic matching
    for (const target of topicTargets) {
      const confidence = this.calculateLinkingConfidence(article, target);
      
      suggestions.push({
        sourceId: article.id,
        sourceTitle: article.title,
        currentTarget: await this.getCurrentTarget(article),
        suggestedTarget: {
          id: target.id,
          title: target.title,
          topic: target.topic,
          reason: `Topic-specific match for ${article.topic}`
        },
        confidence
      });
    }

    // If no topic-specific targets, suggest creation
    if (topicTargets.length === 0) {
      suggestions.push({
        sourceId: article.id,
        sourceTitle: article.title,
        currentTarget: await this.getCurrentTarget(article),
        suggestedTarget: {
          id: 'CREATE_NEW',
          title: await this.generateNewArticleTitle(article.topic, targetStage),
          topic: article.topic,
          reason: `Create new ${targetStage} article for ${article.topic} topic`
        },
        confidence: 0.9
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze linking strategy for a batch of articles
   */
  static async analyzeBatchLinkingStrategy(
    articles: Array<{title: string; topic: string; funnelStage: string}>,
    language: string = 'en'
  ): Promise<{
    strategies: LinkingStrategy[];
    warnings: string[];
    recommendations: string[];
  }> {
    const strategies: LinkingStrategy[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Group articles by topic and stage
    const topicGroups = new Map<string, any>();
    articles.forEach(article => {
      const key = `${article.topic}-${article.funnelStage}`;
      if (!topicGroups.has(key)) {
        topicGroups.set(key, []);
      }
      topicGroups.get(key).push(article);
    });

    // Analyze potential bottlenecks
    for (const [key, groupArticles] of topicGroups) {
      const [topic, stage] = key.split('-');
      
      if (stage === 'TOFU' && groupArticles.length > 3) {
        // Check if corresponding MOFU articles exist
        const { data: existingMofu } = await supabase
          .from('qa_articles')
          .select('id, title')
          .eq('topic', topic)
          .eq('funnel_stage', 'MOFU')
          .eq('language', language);

        if (!existingMofu || existingMofu.length === 0) {
          strategies.push({
            type: 'create_new',
            description: `Create ${topic}-specific MOFU articles to handle ${groupArticles.length} TOFU articles`,
            articles_affected: groupArticles.length
          });
          
          recommendations.push(
            `Consider creating 2-3 MOFU articles for ${topic} topic to distribute the ${groupArticles.length} TOFU articles`
          );
        } else if (existingMofu.length === 1) {
          warnings.push(
            `${groupArticles.length} new ${topic} TOFU articles will create a bottleneck pointing to single MOFU article`
          );
        }
      }
    }

    // Analyze overall distribution
    const currentBottlenecks = await FunnelAnalyzer.analyzeFunnelBottlenecks(language);
    
    if (currentBottlenecks.length > 0) {
      strategies.push({
        type: 'rebalance_existing',
        description: 'Rebalance existing bottlenecks before adding new content',
        articles_affected: currentBottlenecks.reduce((sum, b) => sum + b.sourceCount, 0)
      });
    }

    return {
      strategies,
      warnings,
      recommendations
    };
  }

  /**
   * Auto-create missing MOFU/BOFU articles for topics
   */
  static async autoCreateMissingArticles(
    topic: string,
    stage: 'MOFU' | 'BOFU',
    language: string = 'en'
  ): Promise<string> {
    const title = await this.generateNewArticleTitle(topic, stage);
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const content = this.generatePlaceholderContent(topic, stage);
    
    const { data, error } = await supabase
      .from('qa_articles')
      .insert({
        title,
        slug,
        content: content.detailedExplanation,
        excerpt: content.shortExplanation,
        funnel_stage: stage,
        topic,
        language,
        tags: this.generateTopicTags(topic),
        target_audience: 'UK, Scottish & Irish buyers (45-70 years)',
        intent: stage === 'MOFU' ? 'Research & comparison' : 'Decision & action',
        location_focus: 'Costa del Sol',
        next_step_url: stage === 'MOFU' ? '/qa?stage=BOFU' : '/book-viewing',
        next_step_text: stage === 'MOFU' ? 'Ready to take action?' : 'Chat with our AI advisor'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  /**
   * Find topic-specific target articles
   */
  private static async findTopicSpecificTargets(
    topic: string,
    targetStage: string,
    language: string
  ) {
    const { data } = await supabase
      .from('qa_articles')
      .select('id, title, topic')
      .eq('topic', topic)
      .eq('funnel_stage', targetStage)
      .eq('language', language);

    return data || [];
  }

  /**
   * Find generic target articles (for comparison)
   */
  private static async findGenericTargets(
    targetStage: string,
    language: string
  ) {
    const { data } = await supabase
      .from('qa_articles')
      .select('id, title, topic')
      .eq('funnel_stage', targetStage)
      .eq('language', language)
      .limit(10);

    return data || [];
  }

  /**
   * Get current target article for linking
   */
  private static async getCurrentTarget(article: any) {
    const targetId = article.funnel_stage === 'TOFU' 
      ? article.points_to_mofu_id 
      : article.points_to_bofu_id;

    if (!targetId) return undefined;

    const { data } = await supabase
      .from('qa_articles')
      .select('id, title, topic')
      .eq('id', targetId)
      .single();

    return data || undefined;
  }

  /**
   * Calculate confidence score for linking suggestion
   */
  private static calculateLinkingConfidence(source: any, target: any): number {
    let confidence = 0.5; // Base confidence

    // Topic match
    if (source.topic === target.topic) {
      confidence += 0.3;
    }

    // Title relevance (simple keyword matching)
    const sourceWords = source.title.toLowerCase().split(/\s+/);
    const targetWords = target.title.toLowerCase().split(/\s+/);
    const commonWords = sourceWords.filter(word => targetWords.includes(word));
    
    confidence += (commonWords.length / Math.max(sourceWords.length, targetWords.length)) * 0.2;

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate title for new article
   */
  private static async generateNewArticleTitle(
    topic: string,
    stage: 'MOFU' | 'BOFU'
  ): Promise<string> {
    if (stage === 'MOFU') {
      return `Complete ${topic.toLowerCase()} guide for Costa del Sol property buyers`;
    } else {
      return `${topic} checklist: what should buyers verify before purchasing on Costa del Sol?`;
    }
  }

  /**
   * Generate placeholder content for auto-created articles
   */
  private static generatePlaceholderContent(topic: string, stage: 'MOFU' | 'BOFU') {
    if (stage === 'MOFU') {
      return {
        shortExplanation: `This comprehensive guide covers all ${topic.toLowerCase()} considerations for property buyers on the Costa del Sol.`,
        detailedExplanation: `When buying property on the Costa del Sol, ${topic.toLowerCase()} is a crucial consideration that requires careful evaluation. This guide provides detailed insights into the key factors you should consider.\n\n**Key Considerations:**\n\n- Detailed analysis of ${topic.toLowerCase()} factors\n- Comparison across different Costa del Sol locations\n- Expert recommendations and best practices\n- Common mistakes to avoid\n\n*This article is automatically generated and should be reviewed and enhanced with specific content.*`
      };
    } else {
      return {
        shortExplanation: `Essential ${topic.toLowerCase()} checklist for buyers to verify before purchasing property on the Costa del Sol.`,
        detailedExplanation: `Before finalizing your property purchase on the Costa del Sol, this ${topic.toLowerCase()} checklist ensures you've covered all essential verification steps.\n\n**Essential Verification Steps:**\n\n- [ ] Verify ${topic.toLowerCase()} compliance and documentation\n- [ ] Check local regulations and requirements\n- [ ] Confirm all necessary certifications\n- [ ] Review potential future implications\n\n**Next Steps:**\n\nOnce you've completed this checklist, you'll be ready to proceed with confidence. Consider scheduling a consultation with our experts to ensure all aspects are properly addressed.\n\n*This article is automatically generated and should be reviewed and enhanced with specific content.*`
      };
    }
  }

  /**
   * Automated bottleneck fixing system
   */
  static async fixBottlenecks(
    bottlenecks: Array<{
      type: 'TOFU_TO_MOFU' | 'MOFU_TO_BOFU';
      targetArticle: { id: string; title: string; topic: string; funnel_stage: string; };
      sourceCount: number;
      sourceArticles: Array<{ id: string; title: string; topic: string; }>;
    }>,
    language: string = 'en'
  ): Promise<{
    articlesCreated: number;
    linksRebalanced: number;
    errors: string[];
    newArticles: Array<{ id: string; title: string; topic: string; stage: string; }>;
  }> {
    const results = {
      articlesCreated: 0,
      linksRebalanced: 0,
      errors: [],
      newArticles: [] as Array<{ id: string; title: string; topic: string; stage: string; }>
    };

    for (const bottleneck of bottlenecks) {
      try {
        // Step 1: Create 2-3 topic-specific articles to distribute the load
        const targetStage = bottleneck.type === 'TOFU_TO_MOFU' ? 'MOFU' : 'BOFU';
        const topicsToCreate = this.identifyTopicsForNewArticles(bottleneck.sourceArticles);
        
        const createdArticles = [];
        for (const topicVariant of topicsToCreate) {
          try {
            const newArticleId = await this.autoCreateMissingArticles(topicVariant.topic, targetStage, language);
            createdArticles.push({
              id: newArticleId,
              title: await this.generateNewArticleTitle(topicVariant.topic, targetStage),
              topic: topicVariant.topic,
              stage: targetStage
            });
            results.articlesCreated++;
          } catch (error) {
            results.errors.push(`Failed to create ${targetStage} article for ${topicVariant.topic}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        results.newArticles.push(...createdArticles);

        // Step 2: Intelligently redistribute source articles
        if (createdArticles.length > 0) {
          const redistributionCount = await this.redistributeArticles(
            bottleneck.sourceArticles,
            [...createdArticles.map(a => ({ id: a.id, topic: a.topic })), 
             { id: bottleneck.targetArticle.id, topic: bottleneck.targetArticle.topic }],
            bottleneck.type
          );
          results.linksRebalanced += redistributionCount;
        }
      } catch (error) {
        results.errors.push(`Failed to fix bottleneck for ${bottleneck.targetArticle.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  /**
   * Identify what topic-specific articles to create based on source articles
   */
  private static identifyTopicsForNewArticles(
    sourceArticles: Array<{ id: string; title: string; topic: string; }>
  ): Array<{ topic: string; count: number; }> {
    // Group source articles by topic
    const topicGroups = new Map<string, number>();
    sourceArticles.forEach(article => {
      topicGroups.set(article.topic, (topicGroups.get(article.topic) || 0) + 1);
    });

    // Return topics that have more than 2 articles
    return Array.from(topicGroups.entries())
      .filter(([, count]) => count > 2)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Create max 3 new articles per bottleneck
  }

  /**
   * Redistribute source articles to new target articles
   */
  private static async redistributeArticles(
    sourceArticles: Array<{ id: string; title: string; topic: string; }>,
    targetArticles: Array<{ id: string; topic: string; }>,
    bottleneckType: 'TOFU_TO_MOFU' | 'MOFU_TO_BOFU'
  ): Promise<number> {
    let redistributionCount = 0;

    for (const sourceArticle of sourceArticles) {
      // Find best matching target article based on topic
      const bestTarget = targetArticles.find(target => target.topic === sourceArticle.topic) 
        || targetArticles[0]; // Fallback to first target

      if (bestTarget) {
        try {
          const updateField = bottleneckType === 'TOFU_TO_MOFU' ? 'points_to_mofu_id' : 'points_to_bofu_id';
          
          const { error } = await supabase
            .from('qa_articles')
            .update({ [updateField]: bestTarget.id })
            .eq('id', sourceArticle.id);

          if (!error) {
            redistributionCount++;
          }
        } catch (error) {
          console.error(`Failed to redistribute article ${sourceArticle.title}:`, error);
        }
      }
    }

    return redistributionCount;
  }

  /**
   * Preview what would be created/changed before applying fixes
   */
  static async previewBottleneckFixes(
    bottlenecks: Array<{
      type: 'TOFU_TO_MOFU' | 'MOFU_TO_BOFU';
      targetArticle: { id: string; title: string; topic: string; funnel_stage: string; };
      sourceCount: number;
      sourceArticles: Array<{ id: string; title: string; topic: string; }>;
    }>
  ): Promise<{
    articlesToCreate: Array<{ title: string; topic: string; stage: string; }>;
    linksToUpdate: Array<{ sourceTitle: string; newTarget: string; }>;
    summary: string;
  }> {
    const articlesToCreate = [];
    const linksToUpdate = [];

    for (const bottleneck of bottlenecks) {
      const targetStage = bottleneck.type === 'TOFU_TO_MOFU' ? 'MOFU' : 'BOFU';
      const topicsToCreate = this.identifyTopicsForNewArticles(bottleneck.sourceArticles);
      
      for (const topicVariant of topicsToCreate) {
        articlesToCreate.push({
          title: await this.generateNewArticleTitle(topicVariant.topic, targetStage),
          topic: topicVariant.topic,
          stage: targetStage
        });
      }

      // Simulate redistribution
      const topicGroups = new Map<string, string[]>();
      bottleneck.sourceArticles.forEach(article => {
        if (!topicGroups.has(article.topic)) {
          topicGroups.set(article.topic, []);
        }
        topicGroups.get(article.topic)?.push(article.title);
      });

      for (const [topic, articles] of topicGroups) {
        const newTarget = articlesToCreate.find(a => a.topic === topic)?.title || 'Existing article';
        articles.forEach(articleTitle => {
          linksToUpdate.push({
            sourceTitle: articleTitle,
            newTarget
          });
        });
      }
    }

    const summary = `Will create ${articlesToCreate.length} new articles and rebalance ${linksToUpdate.length} links across ${bottlenecks.length} bottlenecks`;

    return { articlesToCreate, linksToUpdate, summary };
  }

  /**
   * Generate relevant tags for topic
   */
  private static generateTopicTags(topic: string): string[] {
    const tagMap: Record<string, string[]> = {
      'Legal': ['legal requirements', 'property law', 'contracts', 'solicitor'],
      'Finance': ['mortgage', 'banking', 'taxes', 'currency'],
      'Education': ['schools', 'international education', 'children', 'families'],
      'Healthcare': ['medical care', 'insurance', 'hospitals', 'expat health'],
      'Investment': ['rental income', 'capital gains', 'ROI', 'property investment'],
      'Infrastructure': ['utilities', 'internet', 'transport', 'amenities'],
      'Lifestyle': ['expat life', 'community', 'culture', 'leisure']
    };

    const baseTags = ['Costa del Sol', 'property buying', 'UK buyers', 'expat guide'];
    const topicTags = tagMap[topic] || [topic.toLowerCase()];
    
    return [...baseTags, ...topicTags];
  }
}