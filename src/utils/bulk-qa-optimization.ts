import { supabase } from '@/integrations/supabase/client';

interface QAArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  funnel_stage: string;
  topic: string;
  language: string;
  tags?: string[];
  image_url?: string;
  alt_text?: string;
  target_audience?: string;
  intent?: string;
  location_focus?: string;
  parent_id?: string;
  last_updated: string;
  next_step_url?: string;
  next_step_text?: string;
}

interface OptimizationReport {
  totalArticles: number;
  languageDistribution: Record<string, number>;
  topicDistribution: Record<string, number>;
  funnelStageDistribution: Record<string, number>;
  aiReadinessScore: number;
  voiceSearchReadiness: number;
  citationReadiness: number;
  multilingualCoverage: number;
  contentQualityScore: number;
  optimizationTasks: OptimizationTask[];
}

interface OptimizationTask {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'content' | 'schema' | 'multilingual' | 'voice' | 'citation';
  description: string;
  articles: number;
  estimatedTime: string;
}

/**
 * Analyze all QA articles for AI/LLM optimization readiness
 */
export async function analyzeAllQAArticles(): Promise<OptimizationReport> {
  const { data: articles, error } = await supabase
    .from('qa_articles' as any)
    .select('*');

  if (error) throw error;

  const typedArticles: QAArticle[] = (articles as any) || [];
  
  // Language distribution analysis
  const languageDistribution = typedArticles.reduce((acc, article) => {
    const lang = article.language || 'en';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Topic distribution analysis
  const topicDistribution = typedArticles.reduce((acc, article) => {
    const topic = article.topic || 'General';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Funnel stage distribution
  const funnelStageDistribution = typedArticles.reduce((acc, article) => {
    acc[article.funnel_stage] = (acc[article.funnel_stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // AI readiness scoring
  const aiReadinessScore = calculateAIReadinessScore(typedArticles);
  const voiceSearchReadiness = calculateVoiceSearchReadiness(typedArticles);
  const citationReadiness = calculateCitationReadiness(typedArticles);
  const multilingualCoverage = calculateMultilingualCoverage(typedArticles);
  const contentQualityScore = calculateContentQualityScore(typedArticles);

  // Generate optimization tasks
  const optimizationTasks = generateOptimizationTasks(typedArticles);

  return {
    totalArticles: typedArticles.length,
    languageDistribution,
    topicDistribution,
    funnelStageDistribution,
    aiReadinessScore,
    voiceSearchReadiness,
    citationReadiness,
    multilingualCoverage,
    contentQualityScore,
    optimizationTasks
  };
}

/**
 * Calculate AI readiness score (0-100)
 */
function calculateAIReadinessScore(articles: QAArticle[]): number {
  let totalScore = 0;

  articles.forEach(article => {
    let score = 0;
    
    // Content quality (40 points)
    if (article.content && article.content.length > 500) score += 20;
    if (article.content && article.content.length > 1000) score += 10;
    if (article.excerpt && article.excerpt.length > 50) score += 10;
    
    // Structured data (30 points)
    if (article.tags && article.tags.length >= 3) score += 15;
    if (article.location_focus) score += 10;
    if (article.target_audience) score += 5;
    
    // Metadata completeness (20 points)
    if (article.next_step_url) score += 10;
    if (article.next_step_text) score += 10;
    
    // Language support (10 points)
    if (article.language) score += 10;
    
    totalScore += score;
  });

  return Math.round(totalScore / articles.length);
}

/**
 * Calculate voice search readiness (0-100)
 */
function calculateVoiceSearchReadiness(articles: QAArticle[]): number {
  let totalScore = 0;

  articles.forEach(article => {
    let score = 0;
    
    // Question format (30 points)
    const hasQuestionWords = /^(how|what|where|when|why|which|who)/i.test(article.title);
    if (hasQuestionWords) score += 30;
    
    // Natural language (25 points)
    const naturalLanguage = article.content && !/<[^>]*>/g.test(article.excerpt);
    if (naturalLanguage) score += 25;
    
    // Location context (25 points)
    const hasLocationContext = /costa del sol|marbella|estepona|fuengirola|malaga|spain/i.test(article.content || '');
    if (hasLocationContext) score += 25;
    
    // Short answer format (20 points)
    if (article.excerpt && article.excerpt.length >= 50 && article.excerpt.length <= 200) score += 20;
    
    totalScore += score;
  });

  return Math.round(totalScore / articles.length);
}

/**
 * Calculate citation readiness (0-100)
 */
function calculateCitationReadiness(articles: QAArticle[]): number {
  let totalScore = 0;

  articles.forEach(article => {
    let score = 0;
    
    // Content authority (40 points)
    if (article.content && article.content.length > 800) score += 20;
    if (article.tags && article.tags.length >= 3) score += 20;
    
    // Attribution clarity (30 points)
    if (article.last_updated) score += 15;
    if (article.funnel_stage) score += 15;
    
    // Factual structure (30 points)
    const hasStructuredContent = /^<div|^##|^\*/.test(article.content || '');
    if (hasStructuredContent) score += 15;
    if (article.location_focus) score += 15;
    
    totalScore += score;
  });

  return Math.round(totalScore / articles.length);
}

/**
 * Calculate multilingual coverage (0-100)
 */
function calculateMultilingualCoverage(articles: QAArticle[]): number {
  const languages = new Set(articles.map(a => a.language || 'en'));
  const targetLanguages = ['en', 'es', 'de', 'fr', 'nl'];
  
  return Math.round((languages.size / targetLanguages.length) * 100);
}

/**
 * Calculate content quality score (0-100)
 */
function calculateContentQualityScore(articles: QAArticle[]): number {
  let totalScore = 0;

  articles.forEach(article => {
    let score = 0;
    
    // Content completeness (50 points)
    if (article.content && article.content.length > 500) score += 25;
    if (article.excerpt && article.excerpt.length > 50) score += 25;
    
    // Metadata richness (30 points)
    if (article.tags && article.tags.length >= 2) score += 10;
    if (article.topic) score += 10;
    if (article.target_audience) score += 10;
    
    // SEO optimization (20 points)
    if (article.image_url) score += 10;
    if (article.alt_text) score += 10;
    
    totalScore += score;
  });

  return Math.round(totalScore / articles.length);
}

/**
 * Generate prioritized optimization tasks
 */
function generateOptimizationTasks(articles: QAArticle[]): OptimizationTask[] {
  const tasks: OptimizationTask[] = [];
  
  // Critical tasks
  const shortContentArticles = articles.filter(a => (a.content?.length || 0) < 500).length;
  if (shortContentArticles > 0) {
    tasks.push({
      priority: 'critical',
      category: 'content',
      description: `Expand content for ${shortContentArticles} articles under 500 characters`,
      articles: shortContentArticles,
      estimatedTime: `${Math.ceil(shortContentArticles / 5)} days`
    });
  }

  const missingExcerpts = articles.filter(a => !a.excerpt || a.excerpt.length < 50).length;
  if (missingExcerpts > 0) {
    tasks.push({
      priority: 'critical',
      category: 'content', 
      description: `Add proper excerpts to ${missingExcerpts} articles`,
      articles: missingExcerpts,
      estimatedTime: `${Math.ceil(missingExcerpts / 10)} days`
    });
  }

  // High priority tasks
  const englishOnlyArticles = articles.filter(a => (a.language || 'en') === 'en');
  const topTOFUArticles = englishOnlyArticles.filter(a => a.funnel_stage === 'TOFU').slice(0, 20);
  if (topTOFUArticles.length > 0) {
    tasks.push({
      priority: 'high',
      category: 'multilingual',
      description: `Translate top ${topTOFUArticles.length} TOFU articles to Spanish and German`,
      articles: topTOFUArticles.length,
      estimatedTime: '2 weeks'
    });
  }

  const missingTags = articles.filter(a => !a.tags || a.tags.length < 3).length;
  if (missingTags > 0) {
    tasks.push({
      priority: 'high',
      category: 'schema',
      description: `Add comprehensive tags to ${missingTags} articles`,
      articles: missingTags,
      estimatedTime: `${Math.ceil(missingTags / 20)} days`
    });
  }

  // Medium priority tasks
  const missingLocationFocus = articles.filter(a => !a.location_focus).length;
  if (missingLocationFocus > 0) {
    tasks.push({
      priority: 'medium',
      category: 'schema',
      description: `Add location focus to ${missingLocationFocus} articles`,
      articles: missingLocationFocus,
      estimatedTime: `${Math.ceil(missingLocationFocus / 30)} days`
    });
  }

  const nonQuestionTitles = articles.filter(a => 
    !/^(how|what|where|when|why|which|who)/i.test(a.title)
  ).length;
  if (nonQuestionTitles > 0) {
    tasks.push({
      priority: 'medium',
      category: 'voice',
      description: `Optimize ${nonQuestionTitles} titles for voice search questions`,
      articles: nonQuestionTitles,
      estimatedTime: `${Math.ceil(nonQuestionTitles / 25)} days`
    });
  }

  // Low priority tasks
  const missingImages = articles.filter(a => !a.image_url).length;
  if (missingImages > 0) {
    tasks.push({
      priority: 'low',
      category: 'content',
      description: `Add relevant images to ${missingImages} articles`,
      articles: missingImages,
      estimatedTime: '1 week'
    });
  }

  return tasks.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate AI discovery export data
 */
export async function generateAIDiscoveryExport(): Promise<{
  faqHubSchema: any;
  individualSchemas: any[];
  markdownExports: string[];
  citationMetadata: any[];
}> {
  const { data: articles, error } = await supabase
    .from('qa_articles' as any)
    .select('*');

  if (error) throw error;

  const typedArticles: QAArticle[] = (articles as any) || [];
  
  // Generate comprehensive schemas
  const { generateComprehensiveFAQHubSchema, generateMaximalAISchema } = await import('./comprehensive-ai-schemas');
  
  const faqHubSchema = generateComprehensiveFAQHubSchema(typedArticles);
  const individualSchemas = typedArticles.map(article => generateMaximalAISchema(article, typedArticles));
  
  // Generate markdown exports for GitHub discovery
  const { generateMarkdownFrontmatter } = await import('./ai-optimization');
  const markdownExports = typedArticles.map(article => generateMarkdownFrontmatter(article));
  
  // Generate citation metadata
  const { generateCitationMetadata } = await import('./ai-optimization');
  const citationMetadata = typedArticles.map(article => generateCitationMetadata(article));

  return {
    faqHubSchema,
    individualSchemas,
    markdownExports,
    citationMetadata
  };
}

/**
 * Validate AI optimization compliance
 */
export async function validateAIOptimization(): Promise<{
  compliantArticles: QAArticle[];
  nonCompliantArticles: Array<QAArticle & { issues: string[] }>;
  overallScore: number;
}> {
  const { data: articles, error } = await supabase
    .from('qa_articles' as any)
    .select('*');

  if (error) throw error;

  const typedArticles: QAArticle[] = (articles as any) || [];
  const compliantArticles: QAArticle[] = [];
  const nonCompliantArticles: Array<QAArticle & { issues: string[] }> = [];

  typedArticles.forEach(article => {
    const issues: string[] = [];
    
    // Content quality checks
    if (!article.content || article.content.length < 500) {
      issues.push('Content too short (minimum 500 characters)');
    }
    
    if (!article.excerpt || article.excerpt.length < 50) {
      issues.push('Missing or inadequate excerpt');
    }
    
    // Structured data checks
    if (!article.tags || article.tags.length < 3) {
      issues.push('Insufficient tags (minimum 3 required)');
    }
    
    if (!article.location_focus) {
      issues.push('Missing location focus');
    }
    
    // Voice search optimization
    if (!/^(how|what|where|when|why|which|who)/i.test(article.title)) {
      issues.push('Title not optimized for voice search questions');
    }
    
    // Multilingual readiness
    if (!article.language) {
      issues.push('Missing language specification');
    }

    if (issues.length === 0) {
      compliantArticles.push(article);
    } else {
      nonCompliantArticles.push({ ...article, issues });
    }
  });

  const overallScore = Math.round((compliantArticles.length / typedArticles.length) * 100);

  return {
    compliantArticles,
    nonCompliantArticles,
    overallScore
  };
}