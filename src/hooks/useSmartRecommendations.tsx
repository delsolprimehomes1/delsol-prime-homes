import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface QAArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  funnel_stage: 'TOFU' | 'MOFU' | 'BOFU';
  topic: string;
  tags: string[];
}

interface SmartRecommendationsOptions {
  currentArticle: QAArticle;
  maxRecommendations?: number;
}

export const useSmartRecommendations = ({ 
  currentArticle, 
  maxRecommendations = 3 
}: SmartRecommendationsOptions) => {
  
  const { data: allArticles = [] } = useQuery({
    queryKey: ['qa-articles-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_articles' as any)
        .select('id, slug, title, excerpt, funnel_stage, topic, tags')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as QAArticle[];
    }
  });

  const recommendations = useMemo(() => {
    if (!currentArticle || !allArticles.length) return [];
    
    // Get next funnel stage recommendations
    const stageProgression: Record<string, string> = {
      'TOFU': 'MOFU',
      'MOFU': 'BOFU',
      'BOFU': 'BOFU' // Stay at BOFU for conversion
    };
    
    const targetStage = stageProgression[currentArticle.funnel_stage];
    
    // Filter articles by target stage (excluding current article)
    const candidateArticles = allArticles.filter(article => 
      article.id !== currentArticle.id && 
      article.funnel_stage === targetStage
    );
    
    // Score articles based on relevance
    const scoredArticles = candidateArticles.map(article => {
      let score = 0;
      
      // Topic match (highest priority)
      if (article.topic === currentArticle.topic) {
        score += 10;
      }
      
      // Tag overlap
      const currentTags = currentArticle.tags || [];
      const articleTags = article.tags || [];
      const tagOverlap = currentTags.filter(tag => articleTags.includes(tag)).length;
      score += tagOverlap * 3;
      
      // Title similarity (simple word matching)
      const currentWords = currentArticle.title.toLowerCase().split(' ');
      const articleWords = article.title.toLowerCase().split(' ');
      const wordOverlap = currentWords.filter(word => 
        word.length > 3 && articleWords.some(w => w.includes(word) || word.includes(w))
      ).length;
      score += wordOverlap * 2;
      
      return {
        ...article,
        score
      };
    });
    
    // Sort by score and return top recommendations
    return scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations)
      .map(({ score, ...article }) => article);
      
  }, [currentArticle, allArticles, maxRecommendations]);
  
  // Get funnel progression info
  const funnelInfo = useMemo(() => {
    const stageLabels = {
      'TOFU': 'Learn',
      'MOFU': 'Compare', 
      'BOFU': 'Decide'
    };
    
    const nextStages = {
      'TOFU': 'MOFU',
      'MOFU': 'BOFU',
      'BOFU': null
    };
    
    return {
      currentStageLabel: stageLabels[currentArticle?.funnel_stage as keyof typeof stageLabels],
      nextStage: nextStages[currentArticle?.funnel_stage as keyof typeof nextStages],
      isLastStage: currentArticle?.funnel_stage === 'BOFU',
      progressPercentage: currentArticle?.funnel_stage === 'TOFU' ? 33 : 
                         currentArticle?.funnel_stage === 'MOFU' ? 66 : 100
    };
  }, [currentArticle]);

  return {
    recommendations,
    funnelInfo,
    isLoading: !allArticles.length
  };
};