// Bulk AI Optimization Utilities for All 158 QA Articles
import { supabase } from '@/integrations/supabase/client';
import { generateMaximalAISchema, generateComprehensiveFAQHubSchema } from './comprehensive-schemas';
import { generateMarkdownFrontmatter, generateCitationMetadata } from './ai-optimization';

interface OptimizationReport {
  totalArticles: number;
  optimizedArticles: number;
  topicDistribution: Record<string, number>;
  languageDistribution: Record<string, number>;
  funnelStageDistribution: Record<string, number>;
  recommendations: string[];
  citationReadiness: number;
  voiceSearchReadiness: number;
}

// Fetch and analyze all QA articles
export const analyzeAllQAArticles = async (): Promise<{
  articles: any[];
  analysis: OptimizationReport;
}> => {
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }

  // Analyze content distribution
  const topicDistribution: Record<string, number> = {};
  const languageDistribution: Record<string, number> = {};
  const funnelStageDistribution: Record<string, number> = {};
  
  let citationReady = 0;
  let voiceSearchReady = 0;

  articles?.forEach(article => {
    // Topic distribution
    const topic = article.topic || 'Unknown';
    topicDistribution[topic] = (topicDistribution[topic] || 0) + 1;
    
    // Language distribution
    const language = article.language || 'en';
    languageDistribution[language] = (languageDistribution[language] || 0) + 1;
    
    // Funnel stage distribution
    const stage = article.funnel_stage || 'Unknown';
    funnelStageDistribution[stage] = (funnelStageDistribution[stage] || 0) + 1;
    
    // Check citation readiness (content length, structured data)
    if (article.content && article.content.length > 500 && article.excerpt) {
      citationReady++;
    }
    
    // Check voice search readiness (title format, tags)
    if (article.title && article.tags && article.tags.length > 0) {
      voiceSearchReady++;
    }
  });

  const analysis: OptimizationReport = {
    totalArticles: articles?.length || 0,
    optimizedArticles: Math.min(citationReady, voiceSearchReady),
    topicDistribution,
    languageDistribution,
    funnelStageDistribution,
    citationReadiness: Math.round((citationReady / (articles?.length || 1)) * 100),
    voiceSearchReadiness: Math.round((voiceSearchReady / (articles?.length || 1)) * 100),
    recommendations: generateOptimizationRecommendations(
      topicDistribution, 
      languageDistribution, 
      funnelStageDistribution,
      articles?.length || 0
    )
  };

  return { articles: articles || [], analysis };
};

// Generate optimization recommendations
const generateOptimizationRecommendations = (
  topics: Record<string, number>,
  languages: Record<string, number>,
  stages: Record<string, number>,
  totalArticles: number
): string[] => {
  const recommendations: string[] = [];
  
  // Topic balance recommendations
  const topicEntries = Object.entries(topics).sort((a, b) => b[1] - a[1]);
  const largestTopic = topicEntries[0];
  const smallestTopic = topicEntries[topicEntries.length - 1];
  
  if (largestTopic[1] > totalArticles * 0.4) {
    recommendations.push(
      `Consider balancing content: "${largestTopic[0]}" has ${largestTopic[1]} articles (${Math.round(largestTopic[1] / totalArticles * 100)}% of total). Split into subcategories.`
    );
  }
  
  if (smallestTopic[1] < 5) {
    recommendations.push(
      `Expand "${smallestTopic[0]}" topic: Only ${smallestTopic[1]} articles. Consider adding 5-10 more for better coverage.`
    );
  }
  
  // Language distribution recommendations  
  const englishArticles = languages['en'] || 0;
  const otherLanguages = Object.keys(languages).filter(lang => lang !== 'en').length;
  
  if (otherLanguages < 3) {
    recommendations.push(
      'Add multilingual content: Currently limited language coverage. Prioritize Spanish, German, and French translations.'
    );
  }
  
  if (englishArticles > totalArticles * 0.9) {
    recommendations.push(
      'Urgent: Translate top 20 TOFU articles to Spanish and top 15 to German for international SEO.'
    );
  }
  
  // Funnel stage recommendations
  const tofuCount = stages['TOFU'] || 0;
  const mofuCount = stages['MOFU'] || 0;
  const bofuCount = stages['BOFU'] || 0;
  
  if (tofuCount < totalArticles * 0.3) {
    recommendations.push(
      'Increase TOFU content: Need more beginner-friendly articles for broader audience reach.'
    );
  }
  
  if (bofuCount < totalArticles * 0.2) {
    recommendations.push(
      'Add BOFU content: Need more decision-stage content for conversion optimization.'
    );
  }
  
  // Content quality recommendations
  recommendations.push(
    'Implement speakable markup on all articles for voice search optimization.',
    'Add AI-optimized quick answers to articles under 1000 characters.',
    'Create consistent "Key Takeaways" sections for better AI citation.',
    'Enhance schema markup with location-specific data for local SEO.'
  );
  
  return recommendations;
};

// Generate comprehensive JSON export for AI discovery
export const generateAIDiscoveryExport = async (): Promise<{
  faqHubSchema: any;
  articleSchemas: Record<string, any>;
  markdownExports: Record<string, string>;
  citationDatabase: Record<string, any>;
}> => {
  const { articles } = await analyzeAllQAArticles();
  
  // Generate comprehensive FAQ hub schema
  const faqHubSchema = generateComprehensiveFAQHubSchema(articles);
  
  // Generate individual article schemas
  const articleSchemas: Record<string, any> = {};
  const markdownExports: Record<string, string> = {};
  const citationDatabase: Record<string, any> = {};
  
  for (const article of articles) {
    const relatedArticles = articles
      .filter(a => a.id !== article.id && a.topic === article.topic)
      .slice(0, 3);
    
    // Enhanced schema for each article
    articleSchemas[article.slug] = generateMaximalAISchema(article, relatedArticles);
    
    // Markdown export for GitHub/external discovery
    markdownExports[article.slug] = generateMarkdownFrontmatter(article);
    
    // Citation-ready metadata
    citationDatabase[article.slug] = generateCitationMetadata(article);
  }
  
  return {
    faqHubSchema,
    articleSchemas,
    markdownExports,
    citationDatabase
  };
};

// Validate AI optimization compliance for all articles
export const validateAIOptimization = async (): Promise<{
  compliantArticles: string[];
  nonCompliantArticles: Array<{
    slug: string;
    issues: string[];
    priority: 'high' | 'medium' | 'low';
  }>;
  overallScore: number;
}> => {
  const { articles } = await analyzeAllQAArticles();
  
  const compliantArticles: string[] = [];
  const nonCompliantArticles: Array<{
    slug: string;
    issues: string[];
    priority: 'high' | 'medium' | 'low';
  }> = [];
  
  for (const article of articles) {
    const issues: string[] = [];
    
    // Check content length
    if (!article.content || article.content.length < 500) {
      issues.push('Content too short for effective AI citation (min 500 chars)');
    }
    
    // Check structured data requirements
    if (!article.excerpt || article.excerpt.length < 100) {
      issues.push('Missing or insufficient excerpt for quick answers');
    }
    
    // Check topic and location data
    if (!article.topic) {
      issues.push('Missing topic classification');
    }
    
    if (!article.city) {
      issues.push('Missing location data for geographic targeting');
    }
    
    // Check tags for voice search
    if (!article.tags || article.tags.length < 3) {
      issues.push('Insufficient tags for voice search optimization (min 3)');
    }
    
    // Check funnel stage
    if (!['TOFU', 'MOFU', 'BOFU'].includes(article.funnel_stage)) {
      issues.push('Invalid or missing funnel stage classification');
    }
    
    // Check language specification
    if (!article.language) {
      issues.push('Missing language specification for multilingual SEO');
    }
    
    // Determine priority based on issues
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (issues.length >= 4) {
      priority = 'high';
    } else if (issues.length >= 2) {
      priority = 'medium';
    }
    
    if (issues.length === 0) {
      compliantArticles.push(article.slug);
    } else {
      nonCompliantArticles.push({
        slug: article.slug,
        issues,
        priority
      });
    }
  }
  
  const overallScore = Math.round(
    (compliantArticles.length / articles.length) * 100
  );
  
  return {
    compliantArticles,
    nonCompliantArticles,
    overallScore
  };
};

// Generate priority optimization tasks
export const generateOptimizationTasks = async (): Promise<{
  immediate: string[];
  week1: string[];
  week2: string[];
  ongoing: string[];
}> => {
  const { analysis } = await analyzeAllQAArticles();
  const { nonCompliantArticles } = await validateAIOptimization();
  
  const highPriorityArticles = nonCompliantArticles
    .filter(a => a.priority === 'high')
    .slice(0, 20);
    
  const mediumPriorityArticles = nonCompliantArticles
    .filter(a => a.priority === 'medium')
    .slice(0, 30);
  
  return {
    immediate: [
      `Fix ${highPriorityArticles.length} high-priority articles with critical AI optimization issues`,
      'Add speakable markup to top 20 most-viewed articles',
      'Create AI-optimized quick answers for articles under 500 characters',
      'Implement comprehensive schema markup on FAQ hub page',
      'Add voice search keywords to articles missing tags'
    ],
    
    week1: [
      `Optimize ${mediumPriorityArticles.length} medium-priority articles`,
      'Translate top 10 TOFU articles to Spanish',
      'Add location-specific schema to all articles missing city data',
      'Implement key takeaways sections for structured AI consumption',
      'Create citation-ready metadata for all articles'
    ],
    
    week2: [
      'Translate top 15 articles to German and French',
      'Add voice search optimization to remaining articles',
      'Implement topic-specific landing page schemas',
      'Create JSON-LD endpoints for AI assistant integration',
      'Optimize content structure for maximum citation likelihood'
    ],
    
    ongoing: [
      'Monitor AI citation performance and adjust accordingly',
      'Regular content freshness updates for search ranking',
      'Expand multilingual content based on traffic analysis',
      'A/B test different speakable selectors for voice search',
      'Track and optimize voice search query performance'
    ]
  };
};

export default {
  analyzeAllQAArticles,
  generateAIDiscoveryExport,
  validateAIOptimization,
  generateOptimizationTasks
};