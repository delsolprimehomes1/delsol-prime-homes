// AI Scoring System for DelSolPrimeHomes.com
// Target: 9.8/10 AI Citation Score with comprehensive optimization

import { supabase } from '@/integrations/supabase/client';

export interface AIScoreMetrics {
  contentQuality: number;      // 0-2.5 points
  structureOptimization: number; // 0-2.5 points  
  voiceReadiness: number;      // 0-2.5 points
  citationReadiness: number;   // 0-2.5 points
  totalScore: number;          // 0-10 total
}

export interface ArticleScoreResult {
  id: string;
  slug: string;
  title: string;
  currentScore: number;
  metrics: AIScoreMetrics;
  voice_search_ready: boolean;
  citation_ready: boolean;
  speakable_selectors: string[];
  recommendations: string[];
}

// Calculate AI optimization score for a single article
export const calculateAIScore = (article: any): ArticleScoreResult => {
  const content = article.content || '';
  const title = article.title || '';
  const excerpt = article.excerpt || '';
  
  // Content Quality Scoring (0-2.5 points)
  let contentQuality = 0;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  
  // Length scoring
  if (charCount >= 1200) contentQuality += 0.8;
  else if (charCount >= 800) contentQuality += 0.5;
  else if (charCount >= 400) contentQuality += 0.2;
  
  // Structure scoring
  if (content.includes('<h') || content.includes('##')) contentQuality += 0.4;
  if (content.includes('<ul>') || content.includes('<ol>') || content.includes('- ')) contentQuality += 0.3;
  if (excerpt && excerpt.length > 100) contentQuality += 0.3;
  
  // Topic relevance
  const topicKeywords = ['property', 'costa del sol', 'spain', 'buying', 'investment', 'real estate'];
  const topicMatches = topicKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword) || title.toLowerCase().includes(keyword)
  ).length;
  contentQuality += Math.min(0.7, topicMatches * 0.1);
  
  contentQuality = Math.min(2.5, contentQuality);

  // Structure Optimization (0-2.5 points)
  let structureOptimization = 0;
  
  // Question format title
  const isQuestionFormat = /^(how|what|where|when|why|which|can|should|do|does|is|are|will)/i.test(title);
  if (isQuestionFormat) structureOptimization += 0.8;
  
  // Has tags
  if (article.tags && article.tags.length > 0) structureOptimization += 0.4;
  
  // Has proper funnel stage
  if (['TOFU', 'MOFU', 'BOFU'].includes(article.funnel_stage)) structureOptimization += 0.3;
  
  // Has topic classification
  if (article.topic && article.topic.length > 0) structureOptimization += 0.3;
  
  // Has next steps
  if (article.next_step_url && article.next_step_text) structureOptimization += 0.4;
  
  // Has location focus
  if (article.city || article.location_focus) structureOptimization += 0.3;
  
  structureOptimization = Math.min(2.5, structureOptimization);

  // Voice Readiness (0-2.5 points)
  let voiceReadiness = 0;
  
  // Question format (essential for voice)
  if (isQuestionFormat) voiceReadiness += 1.0;
  
  // Natural language patterns
  const naturalPatterns = ['you can', 'you should', 'it is', 'there are', 'you need to'];
  const naturalMatches = naturalPatterns.filter(pattern => 
    content.toLowerCase().includes(pattern)
  ).length;
  voiceReadiness += Math.min(0.5, naturalMatches * 0.1);
  
  // Concise answer availability
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20 && s.trim().length < 200);
  if (sentences.length > 0) voiceReadiness += 0.4;
  
  // Location mentions for local voice search
  const locationMentions = ['costa del sol', 'marbella', 'estepona', 'malaga', 'spain'].filter(loc =>
    content.toLowerCase().includes(loc) || title.toLowerCase().includes(loc)
  ).length;
  voiceReadiness += Math.min(0.4, locationMentions * 0.1);
  
  // Reading time optimization (1-3 minutes ideal for voice)
  const readingTime = Math.ceil(wordCount / 200);
  if (readingTime >= 1 && readingTime <= 3) voiceReadiness += 0.2;
  
  voiceReadiness = Math.min(2.5, voiceReadiness);

  // Citation Readiness (0-2.5 points)
  let citationReadiness = 0;
  
  // Sufficient content for citation
  if (charCount >= 1200) citationReadiness += 0.8;
  else if (charCount >= 800) citationReadiness += 0.5;
  
  // Clear answer structure
  if (excerpt && excerpt.length >= 150) citationReadiness += 0.4;
  
  // Authority indicators
  const authorityIndicators = ['expert', 'professional', 'licensed', 'certified', 'experience'];
  const authorityMatches = authorityIndicators.filter(indicator =>
    content.toLowerCase().includes(indicator)
  ).length;
  citationReadiness += Math.min(0.3, authorityMatches * 0.1);
  
  // Date relevance
  const lastUpdated = new Date(article.last_updated || article.created_at);
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate <= 365) citationReadiness += 0.4; // Updated within year
  else if (daysSinceUpdate <= 730) citationReadiness += 0.2; // Within 2 years
  
  // Clear topic focus
  if (article.topic && article.funnel_stage) citationReadiness += 0.3;
  
  // Has structured data potential
  if (article.tags && article.tags.length >= 3) citationReadiness += 0.3;
  
  citationReadiness = Math.min(2.5, citationReadiness);

  // Calculate total score
  const totalScore = contentQuality + structureOptimization + voiceReadiness + citationReadiness;

  // Determine readiness flags
  const voice_search_ready = isQuestionFormat && voiceReadiness >= 2.0 && charCount >= 400;
  const citation_ready = citationReadiness >= 2.0 && charCount >= 1200 && excerpt.length >= 100;

  // Generate speakable selectors
  const speakable_selectors = [
    ".question-title",
    ".short-answer", 
    ".quick-answer",
    ".ai-summary",
    ".key-points",
    ".essential-info"
  ];

  // Generate improvement recommendations
  const recommendations: string[] = [];
  if (contentQuality < 2.0) recommendations.push("Expand content to minimum 1200 characters with structured formatting");
  if (structureOptimization < 2.0) recommendations.push("Add proper tags, clear topic classification, and next steps");
  if (voiceReadiness < 2.0) recommendations.push("Optimize for question-format title and natural language patterns");
  if (citationReadiness < 2.0) recommendations.push("Add authoritative sources and ensure comprehensive answer structure");
  if (!voice_search_ready) recommendations.push("Format as clear question with concise answer for voice search");
  if (!citation_ready) recommendations.push("Enhance content depth and structure for AI citation readiness");

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    currentScore: Math.round(totalScore * 10) / 10,
    metrics: {
      contentQuality: Math.round(contentQuality * 10) / 10,
      structureOptimization: Math.round(structureOptimization * 10) / 10,
      voiceReadiness: Math.round(voiceReadiness * 10) / 10,
      citationReadiness: Math.round(citationReadiness * 10) / 10,
      totalScore: Math.round(totalScore * 10) / 10
    },
    voice_search_ready,
    citation_ready,
    speakable_selectors,
    recommendations
  };
};

// Batch process all articles for AI optimization scoring
export const batchScoreAllArticles = async (): Promise<{
  totalProcessed: number;
  averageScore: number;
  voiceReadyCount: number;
  citationReadyCount: number;
  articlesAboveTarget: number;
  results: ArticleScoreResult[];
}> => {
  console.log('🧠 Starting comprehensive AI scoring for all articles...');
  
  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }

  const results: ArticleScoreResult[] = [];
  let totalScore = 0;
  let voiceReadyCount = 0;
  let citationReadyCount = 0;
  let articlesAboveTarget = 0;
  const TARGET_SCORE = 9.8;

  // Process each article in batches to avoid timeout
  const batchSize = 10;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    
    for (const article of batch) {
      try {
        const scoreResult = calculateAIScore(article);
        results.push(scoreResult);
        
        totalScore += scoreResult.currentScore;
        if (scoreResult.voice_search_ready) voiceReadyCount++;
        if (scoreResult.citation_ready) citationReadyCount++;
        if (scoreResult.currentScore >= TARGET_SCORE) articlesAboveTarget++;

        // Update article in database with new scores
        const { error: updateError } = await supabase
          .from('qa_articles')
          .update({
            ai_optimization_score: scoreResult.currentScore,
            voice_search_ready: scoreResult.voice_search_ready,
            citation_ready: scoreResult.citation_ready,
            markdown_frontmatter: {
              ...((typeof article.markdown_frontmatter === 'object' && article.markdown_frontmatter !== null) ? article.markdown_frontmatter : {}),
              ai_metrics: scoreResult.metrics as any,
              speakable_selectors: scoreResult.speakable_selectors,
              last_scored_at: new Date().toISOString(),
              recommendations: scoreResult.recommendations
            }
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Error updating article ${article.slug}:`, updateError);
        } else {
          console.log(`✅ Scored ${article.slug}: ${scoreResult.currentScore}/10`);
        }
      } catch (error) {
        console.error(`Error processing article ${article.slug}:`, error);
      }
    }
    
    // Small delay between batches to prevent overwhelming
    if (i + batchSize < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const averageScore = totalScore / (articles?.length || 1);

  console.log(`🎯 AI Scoring Complete: ${averageScore.toFixed(2)}/10 average`);
  console.log(`📈 Voice Ready: ${voiceReadyCount}/${articles?.length || 0} articles`);
  console.log(`🎯 Citation Ready: ${citationReadyCount}/${articles?.length || 0} articles`);

  return {
    totalProcessed: articles?.length || 0,
    averageScore: Math.round(averageScore * 10) / 10,
    voiceReadyCount,
    citationReadyCount,
    articlesAboveTarget,
    results
  };
};

// Generate AI optimization report
export const generateAIReport = async () => {
  const { data: articles } = await supabase
    .from('qa_articles')
    .select('*');

  if (!articles) return null;

  const report = {
    generated_at: new Date().toISOString(),
    total_articles: articles.length,
    ai_optimization_stats: {
      average_score: 0,
      voice_ready_count: 0,
      citation_ready_count: 0,
      articles_above_target: 0,
      target_score: 9.8
    },
    score_distribution: {
      excellent: 0,  // 9.0+
      good: 0,       // 7.0-8.9
      fair: 0,       // 5.0-6.9
      poor: 0        // < 5.0
    },
    top_performing_articles: [] as any[],
    improvement_needed: [] as any[],
    recommendations: [] as string[]
  };

  let totalScore = 0;
  const scoredArticles = articles.map(article => ({
    ...article,
    score: article.ai_optimization_score || 0
  }));

  scoredArticles.forEach(article => {
    const score = article.score;
    totalScore += score;

    if (article.voice_search_ready) report.ai_optimization_stats.voice_ready_count++;
    if (article.citation_ready) report.ai_optimization_stats.citation_ready_count++;
    if (score >= 9.8) report.ai_optimization_stats.articles_above_target++;

    if (score >= 9.0) report.score_distribution.excellent++;
    else if (score >= 7.0) report.score_distribution.good++;
    else if (score >= 5.0) report.score_distribution.fair++;
    else report.score_distribution.poor++;
  });

  report.ai_optimization_stats.average_score = Math.round((totalScore / articles.length) * 10) / 10;

  // Top performing articles
  report.top_performing_articles = scoredArticles
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(article => ({
      title: article.title,
      slug: article.slug,
      score: article.score,
      voice_ready: article.voice_search_ready,
      citation_ready: article.citation_ready
    }));

  // Articles needing improvement
  report.improvement_needed = scoredArticles
    .filter(article => article.score < 7.0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 20)
    .map(article => ({
      title: article.title,
      slug: article.slug,
      score: article.score,
      recommendations: (typeof article.markdown_frontmatter === 'object' && article.markdown_frontmatter !== null && 'recommendations' in article.markdown_frontmatter) 
        ? (article.markdown_frontmatter.recommendations as string[]) || [] 
        : []
    }));

  // Global recommendations
  const voiceReadyPercentage = (report.ai_optimization_stats.voice_ready_count / articles.length) * 100;
  const citationReadyPercentage = (report.ai_optimization_stats.citation_ready_count / articles.length) * 100;

  if (voiceReadyPercentage < 90) {
    report.recommendations.push(`Improve voice search readiness: Only ${voiceReadyPercentage.toFixed(1)}% of articles are voice-ready`);
  }
  if (citationReadyPercentage < 90) {
    report.recommendations.push(`Enhance citation readiness: Only ${citationReadyPercentage.toFixed(1)}% of articles are citation-ready`);
  }
  if (report.ai_optimization_stats.average_score < 9.0) {
    report.recommendations.push("Focus on content expansion and structure optimization to reach target 9.8 average");
  }

  return report;
};

// Initialize meta tags for AI optimization
export const injectAIMetaTags = (article: any, score: number) => {
  if (typeof window !== 'undefined') {
    // Add AI optimization score meta tag
    const existingMeta = document.querySelector('meta[name="ai-optimization-score"]');
    if (existingMeta) {
      existingMeta.setAttribute('content', score.toString());
    } else {
      const meta = document.createElement('meta');
      meta.name = 'ai-optimization-score';
      meta.content = score.toString();
      document.head.appendChild(meta);
    }

    // Add data attributes to body for AI scoring
    document.body.setAttribute('data-ai-score', score.toString());
    document.body.setAttribute('data-voice-ready', article.voice_search_ready?.toString() || 'false');
    document.body.setAttribute('data-citation-ready', article.citation_ready?.toString() || 'false');
  }
};