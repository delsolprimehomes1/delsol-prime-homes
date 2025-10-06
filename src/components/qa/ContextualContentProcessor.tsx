import React, { useMemo } from 'react';
import { processMarkdownContent } from '@/utils/markdown';

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  topic: string;
  funnel_stage: string;
  excerpt: string;
  relevanceScore?: number;
}

interface ContextualContentProcessorProps {
  content: string;
  relatedArticles: RelatedArticle[];
  currentTopic: string;
  currentStage: string;
}

// Smart keyword mapping for contextual linking
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Legal': ['legal requirements', 'property law', 'legal process', 'documentation', 'contracts', 'notary', 'legal fees', 'due diligence'],
  'Finance': ['mortgage', 'financing', 'banking', 'costs', 'taxes', 'budget', 'currency', 'payments', 'financial planning'],
  'Investment': ['investment opportunities', 'ROI', 'rental yield', 'property investment', 'market trends', 'appreciation'],
  'Location': ['areas', 'neighborhoods', 'locations', 'regions', 'districts', 'zones', 'communities'],
  'Lifestyle': ['lifestyle', 'amenities', 'community', 'culture', 'activities', 'quality of life'],
  'Property Types': ['villas', 'apartments', 'penthouses', 'townhouses', 'new builds', 'resale properties']
};

// Funnel stage progression mapping
const STAGE_PROGRESSION: Record<string, string[]> = {
  'TOFU': ['TOFU', 'MOFU'], // From awareness to consideration
  'MOFU': ['MOFU', 'BOFU'], // From consideration to decision
  'BOFU': ['BOFU', 'MOFU']  // Decision stage can link back to research
};

export const ContextualContentProcessor: React.FC<ContextualContentProcessorProps> = ({
  content,
  relatedArticles,
  currentTopic,
  currentStage
}) => {
  const processedContent = useMemo(() => {
    if (!content || !relatedArticles.length) {
      return processMarkdownContent(content || '');
    }

    // Filter and rank related articles for contextual linking
    const contextualLinks = relatedArticles
      .filter(article => {
        // Include articles from current stage and logical progression
        const allowedStages = STAGE_PROGRESSION[currentStage] || [currentStage];
        return allowedStages.includes(article.funnel_stage);
      })
      .map(article => ({
        ...article,
        contextScore: calculateContextualScore(article, currentTopic, content)
      }))
      .filter(article => article.contextScore > 0.3) // Only include highly relevant articles
      .sort((a, b) => b.contextScore - a.contextScore)
      .slice(0, 6); // Limit to top 6 most relevant

    // Process content with contextual links
    let processedHtml = processMarkdownContent(content);
    
    // Inject contextual links naturally into content
    contextualLinks.forEach(article => {
      processedHtml = injectContextualLink(processedHtml, article, currentTopic);
    });

    return processedHtml;
  }, [content, relatedArticles, currentTopic, currentStage]);

  return (
    <div 
      className="contextual-content prose prose-xl max-w-none leading-relaxed"
      style={{ 
        fontSize: '18px',
        lineHeight: '1.8',
        maxWidth: '100%'
      }}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

// Calculate relevance score for contextual linking
function calculateContextualScore(article: RelatedArticle, currentTopic: string, content: string): number {
  let score = 0;

  // Topic relevance (40% weight)
  if (article.topic === currentTopic) {
    score += 0.4;
  } else if (isRelatedTopic(article.topic, currentTopic)) {
    score += 0.2;
  }

  // Keyword overlap (35% weight)
  const keywordScore = calculateKeywordOverlap(article, content);
  score += keywordScore * 0.35;

  // Title relevance to content (25% weight)
  const titleRelevance = calculateTitleRelevance(article.title, content);
  score += titleRelevance * 0.25;

  return Math.min(score, 1); // Cap at 1.0
}

// Check if topics are related
function isRelatedTopic(topic1: string, topic2: string): boolean {
  const relatedTopics: Record<string, string[]> = {
    'Legal': ['Finance', 'Investment'],
    'Finance': ['Legal', 'Investment'],
    'Investment': ['Finance', 'Legal', 'Location'],
    'Location': ['Investment', 'Lifestyle'],
    'Lifestyle': ['Location', 'Property Types']
  };

  return relatedTopics[topic1]?.includes(topic2) || relatedTopics[topic2]?.includes(topic1) || false;
}

// Calculate keyword overlap between article and content
function calculateKeywordOverlap(article: RelatedArticle, content: string): number {
  const articleKeywords = TOPIC_KEYWORDS[article.topic] || [];
  const contentLower = content.toLowerCase();
  
  const matches = articleKeywords.filter(keyword => 
    contentLower.includes(keyword.toLowerCase())
  );

  return matches.length / Math.max(articleKeywords.length, 1);
}

// Calculate title relevance to content
function calculateTitleRelevance(title: string, content: string): number {
  const titleWords = title.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const contentLower = content.toLowerCase();
  
  const matches = titleWords.filter(word => contentLower.includes(word));
  return matches.length / Math.max(titleWords.length, 1);
}

// Inject contextual links into HTML content
function injectContextualLink(html: string, article: RelatedArticle, currentTopic: string): string {
  const keywords = TOPIC_KEYWORDS[article.topic] || [];
  
  // Find the most relevant keyword that appears in the content
  const bestKeyword = keywords.find(keyword => 
    html.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!bestKeyword) return html;

  // Create contextual link (clean, no internal metadata)
  const linkHtml = `<a href="/qa/${article.slug}" class="contextual-link">${bestKeyword}</a>`;

  // Replace first occurrence of the keyword with the link
  const regex = new RegExp(`\\b${escapeRegex(bestKeyword)}\\b`, 'i');
  return html.replace(regex, linkHtml);
}

// Utility functions
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default ContextualContentProcessor;