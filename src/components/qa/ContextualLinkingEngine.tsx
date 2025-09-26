import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ContextualLink {
  id: string;
  slug: string;
  title: string;
  topic: string;
  funnel_stage: string;
  excerpt: string;
  relevanceScore: number;
}

interface ContextualLinkingEngineProps {
  content: string;
  currentTopic: string;
  currentStage: string;
  language?: string;
}

export const ContextualLinkingEngine: React.FC<ContextualLinkingEngineProps> = ({
  content,
  currentTopic,
  currentStage,
  language = 'en'
}) => {
  // Find contextual linking opportunities
  const { data: contextualLinks } = useQuery({
    queryKey: ['contextual-links', currentTopic, currentStage, language],
    queryFn: async () => {
      // Get related articles from the same topic and complementary topics
      const { data: articles, error } = await supabase
        .from('qa_articles')
        .select('id, slug, title, topic, funnel_stage, excerpt')
        .eq('language', language)
        .neq('funnel_stage', currentStage) // Different stages for progression
        .limit(20);

      if (error) {
        console.error('Error fetching contextual links:', error);
        return [];
      }

      // Calculate relevance scores based on topic match and content overlap
      const linksWithScores: ContextualLink[] = articles.map(article => ({
        ...article,
        relevanceScore: calculateRelevanceScore(article, currentTopic, content)
      }));

      // Sort by relevance and return top matches
      return linksWithScores
        .filter(link => link.relevanceScore > 0.3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 6);
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Process content and inject contextual links
  const processContentWithLinks = (htmlContent: string): string => {
    if (!contextualLinks || contextualLinks.length === 0) {
      return htmlContent;
    }

    let processedContent = htmlContent;
    const linkableTerms = extractLinkableTerms(contextualLinks);

    // Inject contextual links for relevant terms
    linkableTerms.forEach(term => {
      const regex = new RegExp(`\\b${escapeRegex(term.phrase)}\\b`, 'gi');
      const replacement = `<a href="/qa/${term.slug}" class="contextual-link text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors" data-topic="${term.topic}">${term.phrase}</a>`;
      
      // Only replace first occurrence to avoid over-linking
      processedContent = processedContent.replace(regex, replacement);
    });

    return processedContent;
  };

  return null; // This component processes content but doesn't render directly
};

// Helper function to calculate relevance score
function calculateRelevanceScore(article: any, currentTopic: string, content: string): number {
  let score = 0;

  // Topic matching
  if (article.topic === currentTopic) {
    score += 0.4;
  } else if (isRelatedTopic(article.topic, currentTopic)) {
    score += 0.2;
  }

  // Title keyword overlap
  const articleKeywords = extractKeywords(article.title);
  const contentKeywords = extractKeywords(content);
  const keywordOverlap = articleKeywords.filter(keyword => 
    contentKeywords.some(ck => ck.includes(keyword) || keyword.includes(ck))
  ).length;
  
  score += Math.min(keywordOverlap / articleKeywords.length, 0.3);

  // Funnel stage progression bonus
  score += 0.1;

  return Math.min(score, 1.0);
}

// Extract linkable terms from articles
function extractLinkableTerms(articles: ContextualLink[]) {
  const terms: Array<{phrase: string; slug: string; topic: string}> = [];

  articles.forEach(article => {
    // Extract key phrases from title
    const titleWords = article.title.toLowerCase().split(/\s+/);
    const phrases = [
      article.title,
      ...generatePhrases(titleWords, 2, 4), // 2-4 word phrases
    ];

    phrases.forEach(phrase => {
      if (phrase.length > 10 && phrase.length < 80) { // Reasonable length
        terms.push({
          phrase: phrase,
          slug: article.slug,
          topic: article.topic
        });
      }
    });
  });

  return terms.slice(0, 10); // Limit to prevent over-linking
}

// Generate n-word phrases from an array of words
function generatePhrases(words: string[], minLength: number, maxLength: number): string[] {
  const phrases: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    for (let len = minLength; len <= Math.min(maxLength, words.length - i); len++) {
      const phrase = words.slice(i, i + len).join(' ');
      if (phrase.length > 5) { // Minimum phrase length
        phrases.push(phrase);
      }
    }
  }
  
  return phrases;
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 10);
}

// Check if topics are related
function isRelatedTopic(topic1: string, topic2: string): boolean {
  const relatedTopics: Record<string, string[]> = {
    'Legal': ['Finance', 'Investment'],
    'Finance': ['Legal', 'Investment'],
    'Investment': ['Legal', 'Finance'],
    'Lifestyle': ['Healthcare', 'Education'],
    'Healthcare': ['Lifestyle'],
    'Education': ['Lifestyle']
  };

  return relatedTopics[topic1]?.includes(topic2) || false;
}

// Escape special regex characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default ContextualLinkingEngine;