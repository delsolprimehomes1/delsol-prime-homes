import { supabase } from '@/integrations/supabase/client';

export interface ArticleLink {
  id: string;
  slug: string;
  title: string;
  topic: string;
  funnel_stage: string;
}

/**
 * Find topic-matched articles for funnel progression
 * Used as fallback when database links don't match current topic
 */
export const findTopicMatchedArticles = async (
  currentTopic: string, 
  targetStage: 'MOFU' | 'BOFU',
  language: string = 'en'
): Promise<ArticleLink[]> => {
  const { data, error } = await supabase
    .from('qa_articles')
    .select('id, slug, title, topic, funnel_stage')
    .eq('topic', currentTopic)
    .eq('funnel_stage', targetStage)
    .eq('language', language)
    .limit(3);

  if (error) {
    console.warn('Error finding topic-matched articles:', error);
    return [];
  }

  return (data as ArticleLink[]) || [];
};

/**
 * Get the next logical article in the funnel for a given topic
 * Prioritizes: frontmatter nextStep > topic-matched DB links > generic DB links
 */
export const getNextFunnelArticle = async (
  currentArticle: {
    topic?: string;
    funnel_stage?: string;
    points_to_mofu_id?: string;
    points_to_bofu_id?: string;
    markdown_frontmatter?: any;
  },
  language: string = 'en'
): Promise<{
  nextMofuArticle: ArticleLink | null;
  nextBofuArticle: ArticleLink | null;
  frontmatterNextStep: { slug: string; title: string; topic?: string } | null;
}> => {
  // Extract frontmatter nextStep
  let frontmatterNextStep = null;
  if (currentArticle.markdown_frontmatter?.nextStep) {
    const nextStep = currentArticle.markdown_frontmatter.nextStep;
    if (typeof nextStep === 'object' && nextStep.slug && nextStep.title) {
      frontmatterNextStep = {
        slug: nextStep.slug,
        title: nextStep.title,
        topic: nextStep.topic || undefined
      };
    }
  }

  // Get database-linked articles
  let nextMofuArticle = null;
  let nextBofuArticle = null;

  if (currentArticle.points_to_mofu_id) {
    const { data } = await supabase
      .from('qa_articles')
      .select('id, slug, title, topic, funnel_stage')
      .eq('id', currentArticle.points_to_mofu_id)
      .eq('language', language)
      .single();
    
    if (data) nextMofuArticle = data as ArticleLink;
  }

  if (currentArticle.points_to_bofu_id) {
    const { data } = await supabase
      .from('qa_articles')
      .select('id, slug, title, topic, funnel_stage')
      .eq('id', currentArticle.points_to_bofu_id)
      .eq('language', language)
      .single();
    
    if (data) nextBofuArticle = data as ArticleLink;
  }

  // If no topic-matched MOFU article and we're TOFU, find one
  if (currentArticle.funnel_stage === 'TOFU' && 
      (!nextMofuArticle || nextMofuArticle.topic !== currentArticle.topic) &&
      currentArticle.topic) {
    const topicMatched = await findTopicMatchedArticles(currentArticle.topic, 'MOFU', language);
    if (topicMatched.length > 0) {
      nextMofuArticle = topicMatched[0];
    }
  }

  // If no topic-matched BOFU article and we're MOFU, find one
  if (currentArticle.funnel_stage === 'MOFU' && 
      (!nextBofuArticle || nextBofuArticle.topic !== currentArticle.topic) &&
      currentArticle.topic) {
    const topicMatched = await findTopicMatchedArticles(currentArticle.topic, 'BOFU', language);
    if (topicMatched.length > 0) {
      nextBofuArticle = topicMatched[0];
    }
  }

  return {
    nextMofuArticle,
    nextBofuArticle,
    frontmatterNextStep
  };
};

/**
 * Validate funnel topic alignment
 * Returns metrics about how well topics are aligned in the funnel
 */
export const validateFunnelTopicAlignment = async (language: string = 'en') => {
  const { data: articles } = await supabase
    .from('qa_articles')
    .select('id, slug, title, topic, funnel_stage, points_to_mofu_id, points_to_bofu_id')
    .eq('language', language);

  if (!articles) return { alignmentScore: 0, misalignedPaths: [] };

  const typedArticles = articles as ArticleLink[];
  const misalignedPaths = [];
  let totalLinks = 0;
  let alignedLinks = 0;

  for (const article of typedArticles) {
    if ((article as any).points_to_mofu_id) {
      const linkedArticle = typedArticles.find(a => a.id === (article as any).points_to_mofu_id);
      totalLinks++;
      
      if (linkedArticle && linkedArticle.topic === article.topic) {
        alignedLinks++;
      } else {
        misalignedPaths.push({
          from: { slug: article.slug, topic: article.topic },
          to: { slug: linkedArticle?.slug, topic: linkedArticle?.topic },
          type: 'TOFU->MOFU'
        });
      }
    }

    if ((article as any).points_to_bofu_id) {
      const linkedArticle = typedArticles.find(a => a.id === (article as any).points_to_bofu_id);
      totalLinks++;
      
      if (linkedArticle && linkedArticle.topic === article.topic) {
        alignedLinks++;
      } else {
        misalignedPaths.push({
          from: { slug: article.slug, topic: article.topic },
          to: { slug: linkedArticle?.slug, topic: linkedArticle?.topic },
          type: 'MOFU->BOFU'
        });
      }
    }
  }

  const alignmentScore = totalLinks > 0 ? (alignedLinks / totalLinks) * 100 : 100;

  return {
    alignmentScore: Math.round(alignmentScore),
    misalignedPaths,
    totalLinks,
    alignedLinks
  };
};