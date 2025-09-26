import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  topic: string;
  funnel_stage: string;
  excerpt: string;
  relevanceScore?: number;
}

interface UseRelatedArticlesProps {
  currentArticleId: string;
  currentTopic: string;
  currentStage: string;
  language?: string;
  maxResults?: number;
}

export const useRelatedArticles = ({
  currentArticleId,
  currentTopic,
  currentStage,
  language = 'en',
  maxResults = 6
}: UseRelatedArticlesProps) => {
  return useQuery({
    queryKey: ['related-articles', currentArticleId, currentTopic, currentStage, language],
    queryFn: async (): Promise<RelatedArticle[]> => {
      // Fetch articles with different stages for funnel progression
      const { data: articles, error } = await supabase
        .from('qa_articles')
        .select('id, slug, title, topic, funnel_stage, excerpt')
        .eq('language', language)
        .neq('id', currentArticleId)
        .limit(20);

      if (error) {
        console.error('Error fetching related articles:', error);
        return [];
      }

      // Calculate relevance scores and filter
      const articlesWithScores: RelatedArticle[] = articles.map(article => ({
        ...article,
        relevanceScore: calculateRelevanceScore(article, currentTopic, currentStage)
      }));

      // Sort by relevance and return top matches
      return articlesWithScores
        .filter(article => article.relevanceScore > 0.2)
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, maxResults);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Calculate relevance score for article matching
function calculateRelevanceScore(
  article: { topic: string; funnel_stage: string; title: string },
  currentTopic: string,
  currentStage: string
): number {
  let score = 0;

  // Topic matching (highest priority)
  if (article.topic === currentTopic) {
    score += 0.4;
  } else if (isRelatedTopic(article.topic, currentTopic)) {
    score += 0.2;
  }

  // Funnel stage progression (encourage next steps)
  if (currentStage === 'TOFU' && article.funnel_stage === 'MOFU') {
    score += 0.3;
  } else if (currentStage === 'MOFU' && article.funnel_stage === 'BOFU') {
    score += 0.3;
  } else if (article.funnel_stage !== currentStage) {
    score += 0.1; // Different stage bonus
  }

  // Title similarity (basic keyword matching)
  const titleSimilarity = calculateTitleSimilarity(article.title, currentTopic);
  score += titleSimilarity * 0.2;

  return Math.min(score, 1.0);
}

// Check if topics are related
function isRelatedTopic(topic1: string, topic2: string): boolean {
  const relatedTopics: Record<string, string[]> = {
    'Legal': ['Finance', 'Investment', 'General'],
    'Finance': ['Legal', 'Investment', 'General'],
    'Investment': ['Legal', 'Finance', 'General'],
    'Lifestyle': ['Healthcare', 'Education', 'General'],
    'Healthcare': ['Lifestyle', 'Education'],
    'Education': ['Lifestyle', 'Healthcare'],
    'General': ['Legal', 'Finance', 'Investment', 'Lifestyle']
  };

  return relatedTopics[topic1]?.includes(topic2) || false;
}

// Calculate title similarity based on keyword overlap
function calculateTitleSimilarity(title: string, topic: string): number {
  const titleWords = title.toLowerCase().split(/\s+/);
  const topicWords = topic.toLowerCase().split(/\s+/);
  
  const commonWords = titleWords.filter(word => 
    topicWords.some(topicWord => 
      word.includes(topicWord) || topicWord.includes(word)
    )
  );

  return commonWords.length / Math.max(titleWords.length, topicWords.length, 1);
}

export default useRelatedArticles;