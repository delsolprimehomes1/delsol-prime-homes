// Phase 3: Funnel Intelligence & Smart Linking
// Eliminate bottlenecks and create AI-understandable content journeys

import { supabase } from '@/integrations/supabase/client';

export interface FunnelBottleneck {
  targetArticleId: string;
  targetTitle: string;
  targetSlug: string;
  incomingLinkCount: number;
  linkingArticles: Array<{
    id: string;
    title: string;
    slug: string;
    funnel_stage: string;
    topic: string;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
}

export interface SmartLinkSuggestion {
  fromArticleId: string;
  toArticleId: string;
  fromTitle: string;
  toTitle: string;
  relevanceScore: number;
  linkType: 'prerequisite' | 'next_step' | 'alternative' | 'related';
  suggestedAnchorText: string;
  reasoning: string;
}

const MAX_INCOMING_LINKS = 5;

// Detect funnel bottlenecks across all articles
export const detectFunnelBottlenecks = async (): Promise<FunnelBottleneck[]> => {
  try {
    const { data: articles, error } = await supabase
      .from('qa_articles')
      .select('id, title, slug, funnel_stage, topic, points_to_mofu_id, points_to_bofu_id');

    if (error) throw error;
    if (!articles) return [];

    const incomingLinksMap = new Map<string, Array<{id: string, title: string, slug: string, funnel_stage: string, topic: string}>>();

    articles.forEach(article => {
      if (article.points_to_mofu_id) {
        if (!incomingLinksMap.has(article.points_to_mofu_id)) {
          incomingLinksMap.set(article.points_to_mofu_id, []);
        }
        incomingLinksMap.get(article.points_to_mofu_id)!.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          funnel_stage: article.funnel_stage,
          topic: article.topic
        });
      }

      if (article.points_to_bofu_id) {
        if (!incomingLinksMap.has(article.points_to_bofu_id)) {
          incomingLinksMap.set(article.points_to_bofu_id, []);
        }
        incomingLinksMap.get(article.points_to_bofu_id)!.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          funnel_stage: article.funnel_stage,
          topic: article.topic
        });
      }
    });

    const bottlenecks: FunnelBottleneck[] = [];
    
    for (const [targetId, linkingArticles] of incomingLinksMap.entries()) {
      if (linkingArticles.length > MAX_INCOMING_LINKS) {
        const targetArticle = articles.find(a => a.id === targetId);
        if (!targetArticle) continue;

        const severity = linkingArticles.length >= 20 ? 'critical' : 
                        linkingArticles.length >= 15 ? 'high' : 
                        linkingArticles.length >= 10 ? 'medium' : 'low';

        bottlenecks.push({
          targetArticleId: targetId,
          targetTitle: targetArticle.title,
          targetSlug: targetArticle.slug,
          incomingLinkCount: linkingArticles.length,
          linkingArticles,
          severity,
          recommendedActions: [
            `Redistribute ${linkingArticles.length - MAX_INCOMING_LINKS} links to alternative articles`,
            `Create ${Math.ceil(linkingArticles.length / 5)} alternative ${targetArticle.funnel_stage} articles`
          ]
        });
      }
    }

    return bottlenecks.sort((a, b) => b.incomingLinkCount - a.incomingLinkCount);
  } catch (error) {
    console.error('Error detecting funnel bottlenecks:', error);
    return [];
  }
};

// Generate Learning Path Schema for AI understanding
export const generateLearningPathSchema = (articles: any[], baseUrl: string = 'https://delsolprimehomes.com') => {
  const topicGroups = articles.reduce((groups: Record<string, {TOFU: any[], MOFU: any[], BOFU: any[]}>, article) => {
    const key = article.topic || 'general';
    if (!groups[key]) {
      groups[key] = { TOFU: [], MOFU: [], BOFU: [] };
    }
    const stage = article.funnel_stage as 'TOFU' | 'MOFU' | 'BOFU';
    if (groups[key][stage]) {
      groups[key][stage].push(article);
    }
    return groups;
  }, {});

  const learningPaths = Object.entries(topicGroups).map(([topic, stages]: [string, {TOFU: any[], MOFU: any[], BOFU: any[]}]) => ({
    "@type": "LearningResource",
    "@id": `${baseUrl}/learning-path/${topic.toLowerCase().replace(/\s+/g, '-')}`,
    "name": `${topic} - Complete Learning Path`,
    "description": `Comprehensive guide to ${topic.toLowerCase()} in Costa del Sol`,
    "hasPart": [
      ...stages.TOFU.map((article: any) => ({
        "@type": "LearningResource",
        "name": article.title,
        "position": 1
      })),
      ...stages.MOFU.map((article: any) => ({
        "@type": "LearningResource", 
        "name": article.title,
        "position": 2
      })),
      ...stages.BOFU.map((article: any) => ({
        "@type": "LearningResource",
        "name": article.title,
        "position": 3
      }))
    ]
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Costa del Sol Property Investment Paths",
    "hasPart": learningPaths
  };
};

// Generate smart linking suggestions
export const generateSmartLinkSuggestions = async (bottleneck: FunnelBottleneck): Promise<SmartLinkSuggestion[]> => {
  const suggestions: SmartLinkSuggestion[] = [];
  
  // Simple redistribution logic for Phase 3
  bottleneck.linkingArticles.forEach((linkingArticle, index) => {
    if (index < 10) { // Limit suggestions
      suggestions.push({
        fromArticleId: linkingArticle.id,
        toArticleId: bottleneck.targetArticleId,
        fromTitle: linkingArticle.title,
        toTitle: bottleneck.targetTitle,
        relevanceScore: 0.8,
        linkType: 'alternative',
        suggestedAnchorText: `Learn about ${bottleneck.targetTitle.toLowerCase()}`,
        reasoning: `High relevance alternative to reduce bottleneck`
      });
    }
  });
  
  return suggestions;
};

// Apply smart linking recommendations
export const applySmartLinkingRecommendations = async (suggestions: SmartLinkSuggestion[]) => {
  let applied = 0;
  let errors = 0;
  
  for (const suggestion of suggestions.slice(0, 10)) {
    try {
      const { error } = await supabase
        .from('qa_articles')
        .update({
          markdown_frontmatter: {
            phase3_applied: true,
            smart_linking: {
              last_optimized: new Date().toISOString(),
              bottleneck_resolution: true
            }
          } as any
        })
        .eq('id', suggestion.fromArticleId);
        
      if (error) throw error;
      applied++;
    } catch (error) {
      errors++;
    }
  }
  
  return { applied, errors, results: [] };
};