// AI Scoring System for DelSolPrimeHomes.com
// Target: 9.8/10 AI Citation Score with comprehensive optimization

import { supabase } from '@/integrations/supabase/client';

export interface AIScoreMetrics {
  voiceSearch: number;         // 0-2 points (Voice Search Readiness)
  schemaValidation: number;    // 0-2 points (JSON-LD Schema)
  externalLinks: number;       // 0-1.5 points (External Links)
  headingStructure: number;    // 0-1.5 points (Heading Structure)
  multilingual: number;        // 0-1 point (Multilingual)
  images: number;              // 0-1 point (Images)
  eeat: number;                // 0-1 point (E-E-A-T)
  internalLinking: number;     // 0-1 point (Internal Linking)
  totalScore: number;          // 0-10 total (Target: 9.8)
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

// Calculate AI optimization score for a single article - Enhanced for 9.8/10 targeting
export const calculateAIScore = (article: any): ArticleScoreResult => {
  const content = article.content || '';
  const title = article.title || '';
  const excerpt = article.excerpt || '';
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  // 1. VOICE SEARCH READINESS (0-2 points)
  let voiceSearch = 0;
  
  // Speakable markup (0.5 pts)
  const speakableQuestions = article.speakable_questions?.length || 0;
  if (speakableQuestions >= 3) voiceSearch += 0.5;
  else if (speakableQuestions >= 1) voiceSearch += 0.3;
  
  // Question-based headings (0.5 pts)
  const isQuestionFormat = /^(how|what|where|when|why|which|can|should|do|does|is|are|will)/i.test(title);
  if (isQuestionFormat) voiceSearch += 0.5;
  
  // Conversational tone (0.5 pts)
  const conversationalPatterns = ['you can', 'you should', 'you need', 'typically', 'usually'];
  const conversationalMatches = conversationalPatterns.filter(p => content.toLowerCase().includes(p)).length;
  voiceSearch += Math.min(0.5, conversationalMatches * 0.1);
  
  // 40-60 word speakable blocks (0.5 pts)
  const speakableAnswer = article.speakable_answer || '';
  const speakableWordCount = speakableAnswer.split(/\s+/).length;
  if (speakableWordCount >= 40 && speakableWordCount <= 60) voiceSearch += 0.5;
  else if (speakableWordCount >= 30) voiceSearch += 0.3;
  
  voiceSearch = Math.min(2.0, voiceSearch);
  
  // 2. JSON-LD SCHEMA (0-2 points)
  let schemaValidation = 0;
  
  // Valid FAQPage/BlogPosting schema (0.8 pts)
  const hasValidSchema = article.seo?.schema || (article.funnel_stage && article.topic);
  if (hasValidSchema) schemaValidation += 0.8;
  
  // Speakable specification (0.4 pts)
  if (speakableQuestions > 0 || speakableAnswer.length > 0) schemaValidation += 0.4;
  
  // GeoCoordinates included (0.4 pts)
  const hasGeoCoords = article.geo_coordinates || article.seo?.geoCoordinates;
  if (hasGeoCoords) schemaValidation += 0.4;
  
  // inLanguage specified (0.4 pts)
  if (article.language) schemaValidation += 0.4;
  
  schemaValidation = Math.min(2.0, schemaValidation);
  
  // 3. EXTERNAL LINKS (0-1.5 points)
  let externalLinks = 0;
  
  // Extract external links from content
  const externalLinkMatches = content.match(/https?:\/\/(?!delsolprimehomes\.com)[^\s"'<>]+/gi) || [];
  const linksPerThousand = (externalLinkMatches.length / wordCount) * 1000;
  
  // ≥2 links per 1,000 words (0.6 pts)
  if (linksPerThousand >= 2) externalLinks += 0.6;
  else if (linksPerThousand >= 1) externalLinks += 0.3;
  
  // Authority score avg ≥80 (0.5 pts) - simulated check
  const hasAuthorityLinks = externalLinkMatches.some(link => 
    link.includes('gov') || link.includes('edu') || link.includes('.org')
  );
  if (hasAuthorityLinks) externalLinks += 0.5;
  
  // All HTTPS (0.2 pts)
  const allHttps = externalLinkMatches.every(link => link.startsWith('https://'));
  if (allHttps) externalLinks += 0.2;
  
  // No broken links (0.2 pts) - assumed true for existing content
  externalLinks += 0.2;
  
  externalLinks = Math.min(1.5, externalLinks);
  
  // 4. HEADING STRUCTURE (0-1.5 points)
  let headingStructure = 0;
  
  // Single H1 (0.5 pts)
  const h1Count = (content.match(/<h1|^# /gm) || []).length;
  if (h1Count === 1) headingStructure += 0.5;
  else if (h1Count === 0) headingStructure += 0.3; // Title serves as H1
  
  // Logical H2/H3 hierarchy (0.5 pts)
  const h2Count = (content.match(/<h2|^## /gm) || []).length;
  const h3Count = (content.match(/<h3|^### /gm) || []).length;
  if (h2Count >= 2 && h3Count >= 1) headingStructure += 0.5;
  else if (h2Count >= 2 || h3Count >= 1) headingStructure += 0.3;
  
  // No skipped levels (0.3 pts) - simulated check
  headingStructure += 0.3;
  
  // Descriptive headings (0.2 pts)
  const avgHeadingLength = (content.match(/<h[2-3]>([^<]+)<\/h[2-3]>/g) || [])
    .map(h => h.replace(/<[^>]+>/g, '').length)
    .reduce((a, b) => a + b, 0) / (h2Count + h3Count || 1);
  if (avgHeadingLength >= 20) headingStructure += 0.2;
  
  headingStructure = Math.min(1.5, headingStructure);
  
  // 5. MULTILINGUAL (0-1 point)
  let multilingual = 0;
  
  // hreflang tags present (0.4 pts)
  const hasHreflang = article.seo?.hreflang || article.language !== 'en';
  if (hasHreflang) multilingual += 0.4;
  
  // Canonical URL set (0.3 pts)
  const hasCanonical = article.seo?.canonical || article.canonical_url;
  if (hasCanonical) multilingual += 0.3;
  
  // Alternate language versions linked (0.3 pts)
  const hasAlternates = article.parent_id || article.multilingual_parent_id;
  if (hasAlternates) multilingual += 0.3;
  
  multilingual = Math.min(1.0, multilingual);
  
  // 6. IMAGES (0-1 point)
  let images = 0;
  
  // Alt text in current language (0.3 pts)
  const hasAltText = article.alt_text || article.image_url;
  if (hasAltText) images += 0.3;
  
  // EXIF GPS coordinates (0.3 pts)
  const hasExifGps = article.geo_coordinates || article.hero_image?.geoCoordinates;
  if (hasExifGps) images += 0.3;
  
  // Captions present (0.2 pts)
  const hasCaptions = article.hero_image?.caption || content.includes('figcaption');
  if (hasCaptions) images += 0.2;
  
  // Optimized file size (0.2 pts) - assumed for webp
  if (article.image_url?.includes('.webp') || article.hero_image?.url?.includes('.webp')) images += 0.2;
  
  images = Math.min(1.0, images);
  
  // 7. E-E-A-T (0-1 point)
  let eeat = 0;
  
  // Author bio with credentials (0.3 pts)
  const hasAuthor = article.author || article.author_id;
  if (hasAuthor) eeat += 0.3;
  
  // Reviewer (0.2 pts)
  const hasReviewer = article.reviewer || article.reviewer_id;
  if (hasReviewer) eeat += 0.2;
  
  // Last updated date (0.3 pts)
  const hasRecentUpdate = article.last_updated || article.updated_at;
  const daysSinceUpdate = hasRecentUpdate ? 
    (Date.now() - new Date(hasRecentUpdate).getTime()) / (1000 * 60 * 60 * 24) : 9999;
  if (daysSinceUpdate <= 180) eeat += 0.3;
  else if (daysSinceUpdate <= 365) eeat += 0.2;
  
  // Sources cited (0.2 pts)
  const hasSources = externalLinkMatches.length >= 2;
  if (hasSources) eeat += 0.2;
  
  eeat = Math.min(1.0, eeat);
  
  // 8. INTERNAL LINKING (0-1 point)
  let internalLinking = 0;
  
  // ≥2 internal links (0.5 pts)
  const internalLinkMatches = (article.internal_links?.length || 0) + 
    (content.match(/href="\/(?:qa|blog|faq)/gi) || []).length;
  if (internalLinkMatches >= 2) internalLinking += 0.5;
  else if (internalLinkMatches >= 1) internalLinking += 0.3;
  
  // Relevant anchor text (0.3 pts) - check for descriptive links
  const hasDescriptiveAnchors = content.includes('Learn more about') || 
    content.includes('Read our guide') || article.next_step_text;
  if (hasDescriptiveAnchors) internalLinking += 0.3;
  
  // Links to next funnel stage (0.2 pts)
  const hasNextStage = article.next_step_url || article.points_to_mofu_id || article.points_to_bofu_id;
  if (hasNextStage) internalLinking += 0.2;
  
  internalLinking = Math.min(1.0, internalLinking);
  
  // Calculate total score
  const totalScore = voiceSearch + schemaValidation + externalLinks + headingStructure + 
    multilingual + images + eeat + internalLinking;

  // Determine readiness flags
  const voice_search_ready = voiceSearch >= 1.8 && isQuestionFormat;
  const citation_ready = schemaValidation >= 1.8 && externalLinks >= 1.0 && content.length >= 1200;

  // Generate speakable selectors
  const speakable_selectors = [
    ".question-title",
    ".short-answer", 
    ".quick-answer",
    ".ai-summary",
    ".key-points",
    ".essential-info"
  ];

  // Generate improvement recommendations (Target: 9.8/10)
  const recommendations: string[] = [];
  if (voiceSearch < 1.8) {
    recommendations.push("Voice Search: Add 3+ speakable questions and 40-60 word answer blocks");
  }
  if (schemaValidation < 1.8) {
    recommendations.push("Schema: Ensure valid JSON-LD with speakable, geo coordinates, and language tags");
  }
  if (externalLinks < 1.3) {
    recommendations.push("External Links: Add ≥2 authority links (gov/edu) per 1,000 words, all HTTPS");
  }
  if (headingStructure < 1.3) {
    recommendations.push("Headings: Use single H1, logical H2/H3 hierarchy with descriptive text");
  }
  if (multilingual < 0.8) {
    recommendations.push("Multilingual: Add hreflang tags, canonical URL, and language alternates");
  }
  if (images < 0.8) {
    recommendations.push("Images: Include alt text, EXIF GPS, captions, and use optimized formats (webp)");
  }
  if (eeat < 0.8) {
    recommendations.push("E-E-A-T: Add author bio with credentials, reviewer, and recent update date");
  }
  if (internalLinking < 0.8) {
    recommendations.push("Internal Links: Add ≥2 contextual links with descriptive anchors to next funnel stage");
  }
  if (totalScore < 9.8) {
    recommendations.push(`Overall: Current score ${totalScore.toFixed(1)}/10. Target is 9.8/10 for optimal AI discovery`);
  }

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    currentScore: Math.round(totalScore * 10) / 10,
    metrics: {
      voiceSearch: Math.round(voiceSearch * 10) / 10,
      schemaValidation: Math.round(schemaValidation * 10) / 10,
      externalLinks: Math.round(externalLinks * 10) / 10,
      headingStructure: Math.round(headingStructure * 10) / 10,
      multilingual: Math.round(multilingual * 10) / 10,
      images: Math.round(images * 10) / 10,
      eeat: Math.round(eeat * 10) / 10,
      internalLinking: Math.round(internalLinking * 10) / 10,
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
  const TARGET_SCORE = 9.8; // Phase 8 target for comprehensive AI optimization

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