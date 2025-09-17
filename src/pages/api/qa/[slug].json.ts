// API endpoint for individual QA articles in JSON format (GitHub/AI discovery)
import { generateArticleJSON } from '@/utils/github-optimization';
import { generateAIOptimizedContent } from '@/utils/ai-optimization';

// This would be implemented as a static generation or API route
// For now, providing the structure for JSON export

export interface QAArticleJSON {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    topic: string;
    funnel_stage: string;
    city?: string;
    language: string;
    tags: string[];
    created_at: string;
    last_updated: string;
  };
  ai_optimization: {
    short_answer: string;
    key_points: string[];
    voice_keywords: string[];
    reading_time: number;
    word_count: number;
    citation_ready: boolean;
    voice_search_ready: boolean;
  };
  schema_org: any;
  citation_metadata: {
    title: string;
    url: string;
    author: string;
    source: string;
    date: string;
    credibility: string;
    accessibility: string;
  };
  github_metadata: {
    markdown_url: string;
    json_url: string;
    last_commit: string;
    license: string;
  };
}

export const generateQAArticleJSON = (article: any, baseUrl: string = 'https://delsolprimehomes.com'): QAArticleJSON => {
  const aiOptimized = generateAIOptimizedContent(article);
  const schemaData = generateArticleJSON(article, baseUrl);
  
  return {
    article: {
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      topic: article.topic,
      funnel_stage: article.funnel_stage,
      city: article.city,
      language: article.language || 'en',
      tags: article.tags || [],
      created_at: article.created_at,
      last_updated: article.last_updated || new Date().toISOString()
    },
    ai_optimization: {
      short_answer: aiOptimized.shortAnswer,
      key_points: aiOptimized.keyPoints,
      voice_keywords: aiOptimized.voiceSearchKeywords,
      reading_time: aiOptimized.readingTime,
      word_count: aiOptimized.wordCount,
      citation_ready: true,
      voice_search_ready: true
    },
    schema_org: schemaData,
    citation_metadata: {
      title: article.title,
      url: `${baseUrl}/qa/${article.slug}`,
      author: "DelSolPrimeHomes Expert Team",
      source: "DelSolPrimeHomes AI-Enhanced Property Guide",
      date: article.last_updated || article.created_at,
      credibility: "Expert-verified property guidance with AI optimization",
      accessibility: "Free access, multilingual support available"
    },
    github_metadata: {
      markdown_url: `https://github.com/delsolprimehomes/content/qa/${article.slug}.md`,
      json_url: `${baseUrl}/api/qa/${article.slug}.json`,
      last_commit: new Date().toISOString(),
      license: "CC-BY-4.0"
    }
  };
};

// Utility function to generate all article JSONs for static export
export const generateAllQAJSONs = (articles: any[], baseUrl: string = 'https://delsolprimehomes.com') => {
  return articles.reduce((acc, article) => {
    acc[article.slug] = generateQAArticleJSON(article, baseUrl);
    return acc;
  }, {} as Record<string, QAArticleJSON>);
};