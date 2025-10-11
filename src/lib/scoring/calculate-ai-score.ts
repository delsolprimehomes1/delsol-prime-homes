import { supabase } from '@/integrations/supabase/client';

export interface AIScoreResult {
  overall: number;
  breakdown: {
    voiceReadiness: number;
    schemaQuality: number;
    externalLinks: number;
    headingStructure: number;
    multilingualSupport: number;
    freshnessSignals: number;
    eeatSignals: number;
  };
  issues: string[];
  suggestions: string[];
  passesThreshold: boolean;
}

/**
 * Calculate comprehensive AI optimization score for an article
 */
export async function calculateAIScore(articleId: string): Promise<AIScoreResult> {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const breakdown = {
    voiceReadiness: 0,
    schemaQuality: 0,
    externalLinks: 0,
    headingStructure: 0,
    multilingualSupport: 0,
    freshnessSignals: 0,
    eeatSignals: 0,
  };

  // Fetch article data
  const { data: article, error } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error || !article) {
    throw new Error(`Article not found: ${articleId}`);
  }

  // 1. VOICE READINESS (2.0 points)
  const speakableQuestions = Array.isArray(article.speakable_questions) ? article.speakable_questions : [];
  const speakableAnswer = typeof article.speakable_answer === 'string' ? article.speakable_answer : '';
  
  const questionsWords = speakableQuestions.join(' ').split(/\s+/).length;
  const answerWords = speakableAnswer.split(/\s+/).filter(w => w.length > 0).length;

  if (questionsWords >= 40 && questionsWords <= 60) {
    breakdown.voiceReadiness += 1.0;
  } else if (questionsWords > 0) {
    breakdown.voiceReadiness += 0.5;
    issues.push(`Speakable questions: ${questionsWords} words (need 40-60)`);
    suggestions.push('Optimize speakable questions to 40-60 words');
  } else {
    issues.push('Missing speakable questions');
    suggestions.push('Add 3-5 voice-optimized questions (40-60 words total)');
  }

  if (answerWords >= 40 && answerWords <= 60) {
    breakdown.voiceReadiness += 1.0;
  } else if (answerWords > 0) {
    breakdown.voiceReadiness += 0.5;
    issues.push(`Speakable answer: ${answerWords} words (need 40-60)`);
    suggestions.push('Optimize speakable answer to 40-60 words');
  } else {
    issues.push('Missing speakable answer');
    suggestions.push('Add conversational answer (40-60 words)');
  }

  // 2. SCHEMA QUALITY (1.5 points)
  const hasGeo = article.geo_coordinates && 
    typeof article.geo_coordinates === 'object' &&
    'lat' in article.geo_coordinates &&
    'lng' in article.geo_coordinates;

  if (hasGeo) {
    breakdown.schemaQuality += 0.5;
  } else {
    issues.push('Missing geo coordinates');
    suggestions.push('Add Costa del Sol coordinates (36.5099, -4.8850)');
  }

  if (speakableQuestions.length > 0 && speakableAnswer) {
    breakdown.schemaQuality += 0.5; // Has Speakable markup
  }

  // Assume complete JSON-LD if article has required fields
  if (article.author_id || article.author) {
    breakdown.schemaQuality += 0.5;
  } else {
    issues.push('Missing author data');
    suggestions.push('Add author information for E-E-A-T signals');
  }

  // 3. EXTERNAL LINKS (2.0 points)
  const wordCount = (article.content || '').split(/\s+/).filter(w => w.length > 0).length;
  const { data: externalLinks } = await supabase
    .from('external_links')
    .select('id, verified')
    .eq('article_id', articleId)
    .eq('article_type', 'qa');

  const verifiedLinksCount = (externalLinks || []).filter(l => l.verified).length;
  const linksPerThousand = wordCount > 0 ? (verifiedLinksCount / wordCount) * 1000 : 0;

  if (linksPerThousand >= 2) {
    breakdown.externalLinks = 2.0;
  } else if (linksPerThousand >= 1) {
    breakdown.externalLinks = 1.0;
    suggestions.push('Add more external links (target: 2 per 1000 words)');
  } else if (linksPerThousand > 0) {
    breakdown.externalLinks = 0.5;
    issues.push('Low external link density');
    suggestions.push('Add trusted external sources (.gov.es, banks, tourism sites)');
  } else {
    issues.push('No external links found');
    suggestions.push('Add ≥2 external links per 1000 words from trusted sources');
  }

  // 4. HEADING STRUCTURE (1.5 points)
  const content = article.content || '';
  const h1Count = (content.match(/^# .+$/gm) || []).length;
  const h2Count = (content.match(/^## .+$/gm) || []).length;
  const h3Count = (content.match(/^### .+$/gm) || []).length;

  if (h1Count === 1) {
    breakdown.headingStructure += 0.5;
  } else if (h1Count === 0) {
    issues.push('No H1 heading found');
    suggestions.push('Add exactly 1 H1 heading');
  } else {
    issues.push(`Multiple H1 headings (${h1Count})`);
    suggestions.push('Use only 1 H1 heading per article');
  }

  if (h2Count >= 3) {
    breakdown.headingStructure += 0.5;
  } else {
    issues.push(`Only ${h2Count} H2 headings (need 3+)`);
    suggestions.push('Add more H2 subheadings for better structure');
  }

  if (h3Count > 0 && h2Count > 0) {
    breakdown.headingStructure += 0.5;
  } else if (h2Count > 3) {
    suggestions.push('Consider adding H3 sub-sections under H2 headings');
  }

  // 5. MULTILINGUAL SUPPORT (1.0 point)
  const { data: translations } = await supabase
    .from('qa_articles')
    .select('id')
    .eq('slug', article.slug)
    .neq('language', article.language);

  const translationCount = translations?.length || 0;

  if (translationCount >= 5) {
    breakdown.multilingualSupport = 1.0;
  } else if (translationCount >= 3) {
    breakdown.multilingualSupport = 0.7;
    suggestions.push(`Add ${5 - translationCount} more translations (currently ${translationCount})`);
  } else if (translationCount >= 1) {
    breakdown.multilingualSupport = 0.3;
    issues.push(`Only ${translationCount} translations available`);
    suggestions.push('Translate to at least 5 languages');
  } else {
    issues.push('No translations available');
    suggestions.push('Translate to EN, ES, DE, NL, FR for better reach');
  }

  // 6. FRESHNESS SIGNALS (1.0 point)
  const updatedAt = new Date(article.updated_at);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceUpdate < 30) {
    breakdown.freshnessSignals = 1.0;
  } else if (daysSinceUpdate < 90) {
    breakdown.freshnessSignals = 0.7;
    suggestions.push(`Last updated ${daysSinceUpdate} days ago - consider refreshing content`);
  } else {
    breakdown.freshnessSignals = 0.3;
    issues.push(`Content is ${daysSinceUpdate} days old`);
    suggestions.push('Update article with recent data and statistics');
  }

  // 7. E-E-A-T SIGNALS (1.0 point)
  const hasAuthor = !!(article.author_id || article.author);
  const hasReviewer = !!(article.reviewer_id || article.reviewer);
  const hasCredentials = article.author && typeof article.author === 'object' && 
    'credentials' in article.author;

  if (hasAuthor && hasReviewer && hasCredentials) {
    breakdown.eeatSignals = 1.0;
  } else if (hasAuthor && hasReviewer) {
    breakdown.eeatSignals = 0.7;
    suggestions.push('Add author credentials for stronger E-E-A-T');
  } else if (hasAuthor) {
    breakdown.eeatSignals = 0.5;
    issues.push('Missing reviewer');
    suggestions.push('Add expert reviewer with credentials');
  } else {
    issues.push('Missing author and reviewer');
    suggestions.push('Add author + reviewer + credentials for E-E-A-T');
  }

  // Calculate overall score
  const overall = Number((
    breakdown.voiceReadiness +
    breakdown.schemaQuality +
    breakdown.externalLinks +
    breakdown.headingStructure +
    breakdown.multilingualSupport +
    breakdown.freshnessSignals +
    breakdown.eeatSignals
  ).toFixed(2));

  const passesThreshold = overall >= 9.8;

  return {
    overall,
    breakdown,
    issues,
    suggestions,
    passesThreshold,
  };
}

/**
 * Get aggregated statistics across all articles
 */
export async function getAIScoreStatistics() {
  const { data: articles } = await supabase
    .from('qa_articles')
    .select('id, title, ai_score, language')
    .not('ai_score', 'is', null);

  if (!articles || articles.length === 0) {
    return {
      totalArticles: 0,
      avgScore: 0,
      excellentCount: 0,
      needsWorkCount: 0,
      excellentPct: 0,
      distribution: {},
    };
  }

  const totalArticles = articles.length;
  const avgScore = articles.reduce((sum, a) => sum + (a.ai_score || 0), 0) / totalArticles;
  const excellentCount = articles.filter(a => (a.ai_score || 0) >= 9.8).length;
  const needsWorkCount = articles.filter(a => (a.ai_score || 0) < 9.8).length;
  const excellentPct = (excellentCount / totalArticles) * 100;

  const distribution = {
    excellent: articles.filter(a => (a.ai_score || 0) >= 9.8).length,
    good: articles.filter(a => (a.ai_score || 0) >= 9.0 && (a.ai_score || 0) < 9.8).length,
    needsWork: articles.filter(a => (a.ai_score || 0) >= 8.0 && (a.ai_score || 0) < 9.0).length,
    critical: articles.filter(a => (a.ai_score || 0) < 8.0).length,
  };

  return {
    totalArticles,
    avgScore: Number(avgScore.toFixed(2)),
    excellentCount,
    needsWorkCount,
    excellentPct: Number(excellentPct.toFixed(1)),
    distribution,
  };
}
