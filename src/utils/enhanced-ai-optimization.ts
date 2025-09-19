import { supabase } from '@/integrations/supabase/client';
import { generateMaximalAISchema, generateComprehensiveFAQHubSchema } from './comprehensive-ai-schemas';
import { generateAIOptimizedContent, generateCitationMetadata, generateMarkdownFrontmatter } from './ai-optimization';

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
  ai_optimization_score?: number;
  voice_search_ready?: boolean;
  citation_ready?: boolean;
  multilingual_parent_id?: string;
  markdown_frontmatter?: any;
}

interface OptimizationResult {
  totalArticles: number;
  optimizedArticles: number;
  criticalIssuesFixed: number;
  multilingualContentCreated: number;
  aiReadinessScore: number;
  voiceSearchScore: number;
  citationScore: number;
  overallProgress: number;
}

/**
 * Enhanced AI Optimization - Phase 1: Content Quality Enhancement
 */
export async function enhanceContentQuality(): Promise<OptimizationResult> {
  console.log('🚀 Starting Phase 1: Content Quality Enhancement...');
  
  // Get all articles that need content enhancement
  const { data: shortArticles, error: shortError } = await supabase
    .from('qa_articles')
    .select('*')
    .or('content.length.lt.800,excerpt.is.null,tags.is.null');

  if (shortError) throw shortError;

  let optimizedCount = 0;
  let criticalIssuesFixed = 0;

  for (const article of shortArticles as QAArticle[]) {
    const updates: Partial<QAArticle> = {};
    let hasUpdates = false;

    // Fix short content
    if (article.content.length < 800) {
      updates.content = expandArticleContent(article);
      criticalIssuesFixed++;
      hasUpdates = true;
    }

    // Fix missing excerpts
    if (!article.excerpt || article.excerpt.length < 50) {
      updates.excerpt = generateOptimizedExcerpt(article);
      criticalIssuesFixed++;
      hasUpdates = true;
    }

    // Fix missing tags
    if (!article.tags || article.tags.length < 3) {
      updates.tags = generateOptimizedTags(article);
      hasUpdates = true;
    }

    // Calculate AI optimization scores
    const aiOptimized = generateAIOptimizedContent(article);
    updates.ai_optimization_score = calculateAIOptimizationScore(article);
    updates.voice_search_ready = isVoiceSearchReady(article);
    updates.citation_ready = isCitationReady(article);
    hasUpdates = true;

    if (hasUpdates) {
      const { error: updateError } = await supabase
        .from('qa_articles')
        .update(updates)
        .eq('id', article.id);

      if (!updateError) {
        optimizedCount++;
      }
    }
  }

  // Calculate overall scores
  const { data: allArticles } = await supabase.from('qa_articles').select('*');
  const totalArticles = allArticles?.length || 0;
  
  const aiReadinessScore = await calculateOverallAIReadiness();
  const voiceSearchScore = await calculateOverallVoiceSearchScore();
  const citationScore = await calculateOverallCitationScore();

  console.log(`✅ Phase 1 Complete: Enhanced ${optimizedCount}/${totalArticles} articles`);

  return {
    totalArticles,
    optimizedArticles: optimizedCount,
    criticalIssuesFixed,
    multilingualContentCreated: 0,
    aiReadinessScore,
    voiceSearchScore,
    citationScore,
    overallProgress: Math.round((optimizedCount / totalArticles) * 100)
  };
}

/**
 * Enhanced AI Optimization - Phase 2: Multilingual Content Creation
 */
export async function createMultilingualContent(): Promise<OptimizationResult> {
  console.log('🚀 Starting Phase 2: Multilingual Content Creation...');
  
  // Get top TOFU English articles for translation
  const { data: tofuArticles, error } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('language', 'en')
    .eq('funnel_stage', 'TOFU')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  let multilingualCount = 0;
  const targetLanguages = ['es', 'de', 'fr'];

  for (const article of tofuArticles as QAArticle[]) {
    for (const targetLang of targetLanguages) {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from('qa_articles')
        .select('*')
        .eq('multilingual_parent_id', article.id)
        .eq('language', targetLang);

      if (!existing || existing.length === 0) {
        // Create translation entry in translations table
        const translationData = {
          source_article_id: article.id,
          target_language: targetLang,
          translated_title: `[${targetLang.toUpperCase()}] ${article.title}`,
          translated_content: `[Translation needed for ${targetLang}] ${article.content}`,
          translated_excerpt: `[Translation needed for ${targetLang}] ${article.excerpt}`,
          translation_status: 'pending'
        };

        const { error: translationError } = await supabase
          .from('qa_article_translations')
          .insert(translationData);

        if (!translationError) {
          multilingualCount++;
        }
      }
    }
  }

  console.log(`✅ Phase 2 Complete: Created ${multilingualCount} multilingual content entries`);

  return {
    totalArticles: tofuArticles?.length || 0,
    optimizedArticles: 0,
    criticalIssuesFixed: 0,
    multilingualContentCreated: multilingualCount,
    aiReadinessScore: await calculateOverallAIReadiness(),
    voiceSearchScore: await calculateOverallVoiceSearchScore(),
    citationScore: await calculateOverallCitationScore(),
    overallProgress: Math.round((multilingualCount / (20 * 3)) * 100)
  };
}

/**
 * Enhanced AI Optimization - Phase 3: Advanced Schema & Discovery
 */
export async function enhanceAIDiscovery(): Promise<OptimizationResult> {
  console.log('🚀 Starting Phase 3: Advanced AI Discovery Enhancement...');
  
  const { data: articles, error } = await supabase.from('qa_articles').select('*');
  if (error) throw error;

  let optimizedCount = 0;

  // Generate comprehensive schemas for all articles
  for (const article of articles as QAArticle[]) {
    const maximalSchema = generateMaximalAISchema(article, articles as QAArticle[]);
    const aiOptimizedContent = generateAIOptimizedContent(article);
    const citationMetadata = generateCitationMetadata(article);
    
    // Update markdown frontmatter with AI optimization data
    const markdownFrontmatter = {
      ...(article.markdown_frontmatter || {}),
      aiSchema: maximalSchema,
      aiOptimized: aiOptimizedContent,
      citationData: citationMetadata,
      lastOptimized: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('qa_articles')
      .update({ 
        markdown_frontmatter: markdownFrontmatter,
        ai_optimization_score: calculateAIOptimizationScore(article),
        voice_search_ready: isVoiceSearchReady(article),
        citation_ready: isCitationReady(article)
      })
      .eq('id', article.id);

    if (!updateError) {
      optimizedCount++;
    }
  }

  console.log(`✅ Phase 3 Complete: Enhanced AI discovery for ${optimizedCount} articles`);

  return {
    totalArticles: articles?.length || 0,
    optimizedArticles: optimizedCount,
    criticalIssuesFixed: 0,
    multilingualContentCreated: 0,
    aiReadinessScore: await calculateOverallAIReadiness(),
    voiceSearchScore: await calculateOverallVoiceSearchScore(),
    citationScore: await calculateOverallCitationScore(),
    overallProgress: Math.round((optimizedCount / (articles?.length || 1)) * 100)
  };
}

/**
 * Comprehensive AI Optimization - Run All Phases
 */
export async function runComprehensiveAIOptimization(): Promise<{
  phase1: OptimizationResult;
  phase2: OptimizationResult;
  phase3: OptimizationResult;
  overall: OptimizationResult;
}> {
  console.log('🚀 Starting Comprehensive AI Optimization Plan...');
  
  const phase1 = await enhanceContentQuality();
  const phase2 = await createMultilingualContent();
  const phase3 = await enhanceAIDiscovery();

  const overall: OptimizationResult = {
    totalArticles: phase1.totalArticles,
    optimizedArticles: phase1.optimizedArticles + phase3.optimizedArticles,
    criticalIssuesFixed: phase1.criticalIssuesFixed,
    multilingualContentCreated: phase2.multilingualContentCreated,
    aiReadinessScore: phase3.aiReadinessScore,
    voiceSearchScore: phase3.voiceSearchScore,
    citationScore: phase3.citationScore,
    overallProgress: Math.round(
      (phase1.overallProgress + phase2.overallProgress + phase3.overallProgress) / 3
    )
  };

  console.log('✅ Comprehensive AI Optimization Complete!');
  console.log(`📊 Overall Results:
  - Articles Optimized: ${overall.optimizedArticles}/${overall.totalArticles}
  - Critical Issues Fixed: ${overall.criticalIssuesFixed}
  - Multilingual Content: ${overall.multilingualContentCreated}
  - AI Readiness: ${overall.aiReadinessScore}/100
  - Voice Search: ${overall.voiceSearchScore}/100
  - Citation Ready: ${overall.citationScore}/100
  - Overall Progress: ${overall.overallProgress}%`);

  return { phase1, phase2, phase3, overall };
}

// Helper Functions

function expandArticleContent(article: QAArticle): string {
  const baseContent = article.content;
  const topic = article.topic;
  const location = article.location_focus || 'Costa del Sol';
  
  const expansions = [
    `\n\n## Key Considerations for ${topic} in ${location}\n\nWhen considering ${topic.toLowerCase()} matters on the Costa del Sol, there are several important factors to keep in mind. The region's unique characteristics make it particularly attractive for international property buyers and investors.`,
    
    `\n\n## Local Expertise and Support\n\nWorking with local experts who understand both the Spanish property market and international requirements is crucial. Our team at DelSolPrimeHomes provides comprehensive guidance throughout your ${topic.toLowerCase()} journey.`,
    
    `\n\n## Next Steps\n\nFor personalized advice regarding ${topic.toLowerCase()} in ${location}, contact our expert team. We provide multilingual support and have extensive experience helping international clients navigate the Costa del Sol property market.`
  ];

  return baseContent + expansions.join('');
}

function generateOptimizedExcerpt(article: QAArticle): string {
  const content = article.content.replace(/<[^>]*>/g, '');
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length >= 2) {
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }
  
  return content.substring(0, 150).trim() + '...';
}

function generateOptimizedTags(article: QAArticle): string[] {
  const baseTags = article.tags || [];
  const topic = article.topic;
  const location = article.location_focus || 'Costa del Sol';
  const funnelStage = article.funnel_stage;
  
  const suggestedTags = [
    topic,
    location,
    'Costa del Sol Property',
    'International Buyers',
    'Spanish Real Estate'
  ];

  if (funnelStage === 'TOFU') suggestedTags.push('Property Guide');
  if (funnelStage === 'MOFU') suggestedTags.push('Property Investment');
  if (funnelStage === 'BOFU') suggestedTags.push('Buy Property Spain');

  const uniqueTags = Array.from(new Set([...baseTags, ...suggestedTags]));
  return uniqueTags.slice(0, 8);
}

function calculateAIOptimizationScore(article: QAArticle): number {
  let score = 0;
  
  // Content quality (40 points)
  if (article.content.length > 800) score += 20;
  if (article.content.length > 1200) score += 10;
  if (article.excerpt && article.excerpt.length > 50) score += 10;
  
  // Structured data (30 points)
  if (article.tags && article.tags.length >= 3) score += 15;
  if (article.location_focus) score += 10;
  if (article.target_audience) score += 5;
  
  // Voice search readiness (20 points)
  if (/^(how|what|where|when|why|which|who)/i.test(article.title)) score += 20;
  
  // Citation readiness (10 points)
  if (article.last_updated) score += 5;
  if (article.next_step_url) score += 5;
  
  return Math.min(score, 100);
}

function isVoiceSearchReady(article: QAArticle): boolean {
  const hasQuestionFormat = /^(how|what|where|when|why|which|who)/i.test(article.title);
  const hasShortAnswer = article.excerpt && article.excerpt.length >= 50 && article.excerpt.length <= 200;
  const hasLocationContext = /costa del sol|marbella|estepona|spain/i.test(article.content);
  
  return hasQuestionFormat && hasShortAnswer && hasLocationContext;
}

function isCitationReady(article: QAArticle): boolean {
  const hasGoodContent = article.content.length > 500;
  const hasMetadata = article.tags && article.tags.length >= 3;
  const hasAttribution = !!(article.last_updated && article.target_audience);
  
  return hasGoodContent && hasMetadata && hasAttribution;
}

async function calculateOverallAIReadiness(): Promise<number> {
  const { data: articles } = await supabase.from('qa_articles').select('ai_optimization_score');
  if (!articles || articles.length === 0) return 0;
  
  const total = articles.reduce((sum, article) => sum + (article.ai_optimization_score || 0), 0);
  return Math.round(total / articles.length);
}

async function calculateOverallVoiceSearchScore(): Promise<number> {
  const { data: articles } = await supabase.from('qa_articles').select('voice_search_ready');
  if (!articles || articles.length === 0) return 0;
  
  const readyCount = articles.filter(article => article.voice_search_ready).length;
  return Math.round((readyCount / articles.length) * 100);
}

async function calculateOverallCitationScore(): Promise<number> {
  const { data: articles } = await supabase.from('qa_articles').select('citation_ready');
  if (!articles || articles.length === 0) return 0;
  
  const readyCount = articles.filter(article => article.citation_ready).length;
  return Math.round((readyCount / articles.length) * 100);
}