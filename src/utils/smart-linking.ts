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
    
    // Generate a unique slug to avoid conflicts
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Check for existing slug and make it unique
    const { data: existing } = await supabase
      .from('qa_articles')
      .select('slug')
      .eq('slug', baseSlug)
      .single();
    
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    const content = this.generatePlaceholderContent(topic, stage);
    
    try {
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
          city: 'Costa del Sol', // Required field
          tags: this.generateTopicTags(topic),
          target_audience: 'UK, Scottish & Irish buyers (45-70 years)',
          intent: stage === 'MOFU' ? 'Research & comparison' : 'Decision & action',
          location_focus: 'Costa del Sol',
          next_step_url: stage === 'MOFU' ? '/qa?stage=BOFU' : '/book-viewing',
          next_step_text: stage === 'MOFU' ? 'Ready to take action?' : 'Chat with our AI advisor',
          ai_optimization_score: 75,
          voice_search_ready: true,
          citation_ready: true
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating article:', error);
        throw new Error(`Failed to create ${stage} article for ${topic}: ${error.message}`);
      }
      
      return data.id;
    } catch (error) {
      console.error('Exception in autoCreateMissingArticles:', error);
      throw new Error(`Failed to create ${stage} article for ${topic}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    const topicTitles: Record<string, Record<string, string>> = {
      'Legal': {
        'MOFU': 'Complete legal guide for Costa del Sol property buyers',
        'BOFU': 'Legal checklist: what should buyers verify before purchasing on Costa del Sol?'
      },
      'Finance': {
        'MOFU': 'Complete finance & mortgage guide for Costa del Sol property buyers',
        'BOFU': 'Finance checklist: what should buyers verify before purchasing on Costa del Sol?'
      },
      'Lifestyle': {
        'MOFU': 'Complete lifestyle guide for Costa del Sol property buyers',
        'BOFU': 'Lifestyle checklist: what should buyers verify before purchasing on Costa del Sol?'
      },
      'Investment': {
        'MOFU': 'Complete investment guide for Costa del Sol property buyers',
        'BOFU': 'Investment checklist: what should buyers verify before purchasing on Costa del Sol?'
      },
      'General': {
        'MOFU': 'Complete buyer\'s guide for Costa del Sol property purchase',
        'BOFU': 'General checklist: what should buyers verify before purchasing on Costa del Sol?'
      },
      'Education': {
        'MOFU': 'Complete education & schools guide for Costa del Sol property buyers',
        'BOFU': 'Education checklist: what should buyers verify before purchasing on Costa del Sol?'
      },
      'Healthcare': {
        'MOFU': 'Complete healthcare guide for Costa del Sol property buyers',
        'BOFU': 'Healthcare checklist: what should buyers verify before purchasing on Costa del Sol?'
      }
    };

    return topicTitles[topic]?.[stage] || 
           (stage === 'MOFU' 
             ? `Complete ${topic.toLowerCase()} guide for Costa del Sol property buyers`
             : `${topic} checklist: what should buyers verify before purchasing on Costa del Sol?`);
  }

  /**
   * Generate placeholder content for auto-created articles
   */
  private static generatePlaceholderContent(topic: string, stage: 'MOFU' | 'BOFU') {
    const topicSpecificContent = this.getTopicSpecificContent(topic, stage);
    
    if (stage === 'MOFU') {
      return {
        shortExplanation: `Comprehensive ${topic.toLowerCase()} guide for Costa del Sol property buyers - covering essential considerations, expert insights, and practical recommendations.`,
        detailedExplanation: `# Complete ${topic.toLowerCase()} Guide for Costa del Sol Property Buyers

When buying property on the Costa del Sol, ${topic.toLowerCase()} considerations play a crucial role in making informed decisions. This comprehensive guide provides expert insights tailored specifically for UK, Scottish, and Irish buyers.

## Key ${topic} Considerations

${topicSpecificContent.keyPoints}

## Location-Specific Insights

- **Marbella**: ${topicSpecificContent.locationInsights.marbella}
- **Estepona**: ${topicSpecificContent.locationInsights.estepona}
- **Fuengirola**: ${topicSpecificContent.locationInsights.fuengirola}

## Expert Recommendations

${topicSpecificContent.recommendations}

## Common Mistakes to Avoid

${topicSpecificContent.mistakes}

## Next Steps

Ready to make a decision? Our ${topic.toLowerCase()} specialists can help you navigate the final stages of your property purchase.`
      };
    } else {
      return {
        shortExplanation: `Essential ${topic.toLowerCase()} verification checklist for Costa del Sol property buyers - ensure all requirements are met before closing.`,
        detailedExplanation: `# ${topic} Checklist: What Buyers Should Verify Before Purchasing

Before finalizing your Costa del Sol property purchase, this comprehensive ${topic.toLowerCase()} checklist ensures you've covered all essential verification steps.

## Pre-Purchase Verification

${topicSpecificContent.checklist}

## Documentation Required

${topicSpecificContent.documentation}

## Timeline Considerations

${topicSpecificContent.timeline}

## Ready to Purchase?

Once you've completed this checklist, you'll have the confidence to proceed with your purchase. Our experts are ready to assist with the final steps.

**Book a consultation with our specialists who understand the unique needs of UK, Scottish, and Irish buyers.**`
      };
    }
  }

  private static getTopicSpecificContent(topic: string, stage: 'MOFU' | 'BOFU') {
    const contentMap: Record<string, any> = {
      'Legal': {
        keyPoints: stage === 'MOFU' 
          ? "- Spanish property law essentials\n- NIE number requirements\n- Contract negotiation strategies\n- Legal due diligence process" 
          : "- [ ] Spanish lawyer appointed and briefed\n- [ ] NIE number obtained\n- [ ] Property title deeds verified\n- [ ] All legal searches completed",
        locationInsights: {
          marbella: "Premium legal services available, higher due diligence requirements for luxury properties",
          estepona: "Growing market with streamlined legal processes, good for first-time buyers",
          fuengirola: "Established legal infrastructure, experienced English-speaking lawyers"
        },
        recommendations: stage === 'MOFU'
          ? "Always use a Spanish-qualified lawyer familiar with international buyers. Budget 1-2% of purchase price for legal costs."
          : "Ensure your lawyer is registered with the local Bar Association and has NIE number expertise.",
        mistakes: stage === 'MOFU'
          ? "- Using UK lawyers without Spanish qualifications\n- Skipping building regulations checks\n- Not verifying community charges"
          : "- Proceeding without completed legal searches\n- Signing contracts without lawyer review\n- Missing building license verification",
        checklist: "- [ ] Spanish lawyer appointed\n- [ ] Property ownership verified\n- [ ] Building permissions confirmed\n- [ ] Community charges up to date",
        documentation: "- NIE number certificate\n- Property title deeds\n- Building license\n- Community charge statements",
        timeline: "Legal processes typically take 6-8 weeks from offer acceptance to completion"
      },
      'Finance': {
        keyPoints: stage === 'MOFU'
          ? "- Spanish mortgage requirements\n- Currency exchange considerations\n- Tax implications for UK residents\n- Banking setup essentials"
          : "- [ ] Mortgage pre-approval obtained\n- [ ] Currency exchange rate locked\n- [ ] Spanish bank account opened\n- [ ] Tax advisor consulted",
        locationInsights: {
          marbella: "Premium banking services, higher property values require substantial deposits",
          estepona: "Growing banking infrastructure, competitive mortgage rates for new developments",
          fuengirola: "Established banking relationships, good for pension transfers"
        },
        recommendations: stage === 'MOFU'
          ? "Secure mortgage pre-approval before viewing properties. Consider currency hedging for large purchases."
          : "Lock in exchange rates early and ensure all banking relationships are established before completion.",
        mistakes: stage === 'MOFU'
          ? "- Not accounting for currency fluctuations\n- Underestimating total purchase costs\n- Missing tax planning opportunities"
          : "- Proceeding without mortgage confirmation\n- Not securing favorable exchange rates\n- Missing tax deadline preparations",
        checklist: "- [ ] Mortgage approval confirmed\n- [ ] Exchange rate secured\n- [ ] Spanish bank account active\n- [ ] Tax obligations clarified",
        documentation: "- Mortgage agreement\n- Bank statements\n- Proof of income\n- Tax residency certificates",
        timeline: "Financial arrangements typically require 4-6 weeks for completion"
      },
      'Lifestyle': {
        keyPoints: stage === 'MOFU'
          ? "- Climate and health benefits\n- Expat community integration\n- Recreation and leisure options\n- Healthcare system access"
          : "- [ ] Healthcare registration completed\n- [ ] Local community contacts established\n- [ ] Leisure facilities assessed\n- [ ] Climate suitability confirmed",
        locationInsights: {
          marbella: "Sophisticated lifestyle, golf courses, upmarket dining and shopping",
          estepona: "Family-friendly, beautiful beaches, growing expat community",
          fuengirola: "Established expat hub, excellent healthcare, vibrant social scene"
        },
        recommendations: stage === 'MOFU'
          ? "Visit during different seasons to understand year-round lifestyle. Connect with local expat groups early."
          : "Establish healthcare and social connections before moving permanently.",
        mistakes: stage === 'MOFU'
          ? "- Only visiting during peak summer\n- Not researching healthcare options\n- Underestimating integration challenges"
          : "- Moving without healthcare arrangements\n- Not establishing local connections\n- Missing seasonal considerations",
        checklist: "- [ ] Healthcare options researched\n- [ ] Local amenities verified\n- [ ] Transport links confirmed\n- [ ] Social opportunities identified",
        documentation: "- Healthcare cards\n- Local service registrations\n- Community membership details\n- Transport passes",
        timeline: "Lifestyle setup can take 3-6 months for full integration"
      },
      'Investment': {
        keyPoints: stage === 'MOFU'
          ? "- Rental yield analysis\n- Capital growth potential\n- Property management options\n- Tax implications for investors"
          : "- [ ] Rental income projections verified\n- [ ] Property management arranged\n- [ ] Tax obligations clarified\n- [ ] Investment structure optimized",
        locationInsights: {
          marbella: "High rental yields for luxury properties, strong capital growth, premium management services",
          estepona: "Emerging market with good growth potential, lower entry costs",
          fuengirola: "Stable rental market, established tourist demand, good infrastructure"
        },
        recommendations: stage === 'MOFU'
          ? "Analyze 5-year rental projections and factor in all ownership costs. Consider professional property management."
          : "Ensure rental licensing and tax compliance before completing purchase.",
        mistakes: stage === 'MOFU'
          ? "- Overestimating rental yields\n- Ignoring seasonal variations\n- Not factoring management costs"
          : "- Missing rental license requirements\n- Not arranging property management\n- Unclear tax implications",
        checklist: "- [ ] Rental license obtained\n- [ ] Management company selected\n- [ ] Insurance arranged\n- [ ] Tax structure confirmed",
        documentation: "- Rental license\n- Management agreements\n- Insurance policies\n- Tax registrations",
        timeline: "Investment setup requires 4-8 weeks for full compliance"
      }
    };

    return contentMap[topic] || {
      keyPoints: `- Key ${topic.toLowerCase()} considerations for Costa del Sol buyers`,
      locationInsights: {
        marbella: `${topic} considerations specific to Marbella`,
        estepona: `${topic} considerations specific to Estepona`,
        fuengirola: `${topic} considerations specific to Fuengirola`
      },
      recommendations: `Expert ${topic.toLowerCase()} recommendations for international buyers`,
      mistakes: `Common ${topic.toLowerCase()} mistakes to avoid`,
      checklist: `- [ ] Essential ${topic.toLowerCase()} verification steps`,
      documentation: `Required ${topic.toLowerCase()} documentation`,
      timeline: `Typical ${topic.toLowerCase()} timeline expectations`
    };
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

    // Return topics that have more than 1 article (was 2, but we want to create articles for smaller groups too)
    return Array.from(topicGroups.entries())
      .filter(([, count]) => count > 1)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Increased from 3 to 4 to handle more topics per bottleneck
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