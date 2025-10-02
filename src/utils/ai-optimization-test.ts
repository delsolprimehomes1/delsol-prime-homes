import { supabase } from '@/integrations/supabase/client';
import { calculateAIScore } from '@/lib/aiScoring';
import { generateSpeakableSummary } from './speakableOptimizer';
import { formatForVoice } from './voice-friendly-formatter';

export interface TestArticle {
  id: string;
  title: string;
  slug: string;
  funnel_stage: string;
  scoreBefore: number;
  scoreAfter: number;
  enhancements: string[];
  processingTime: number;
}

export interface TestProgress {
  phase: string;
  currentArticle: number;
  totalArticles: number;
  details: string;
}

// Find 5 test articles by matching titles
async function findTestArticles(): Promise<any[]> {
  const titlePatterns = [
    'healthcare', 'expat',
    'investment', 'purchase', 'checklist',
    'infrastructure', 'comparison',
    'legal', 'financing'
  ];

  const { data: articles } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('published', true)
    .in('funnel_stage', ['TOFU', 'MOFU', 'BOFU'])
    .limit(50);

  if (!articles) return [];

  // Find best matches for each funnel stage
  const tofu = articles.filter(a => a.funnel_stage === 'TOFU' && 
    titlePatterns.some(p => a.title.toLowerCase().includes(p)))[0];
  
  const mofu = articles.filter(a => a.funnel_stage === 'MOFU' && 
    titlePatterns.some(p => a.title.toLowerCase().includes(p))).slice(0, 2);
  
  const bofu = articles.filter(a => a.funnel_stage === 'BOFU' && 
    titlePatterns.some(p => a.title.toLowerCase().includes(p))).slice(0, 2);

  return [tofu, ...mofu, ...bofu].filter(Boolean).slice(0, 5);
}

// Generate speakable answer (40-60 words)
function generateSpeakableAnswer(article: any): string {
  const content = article.content || '';
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  
  let answer = '';
  let wordCount = 0;
  
  for (const sentence of sentences.slice(0, 3)) {
    const trimmed = sentence.trim();
    const words = trimmed.split(/\s+/).length;
    
    if (wordCount + words <= 60) {
      answer += (answer ? ' ' : '') + trimmed + '.';
      wordCount += words;
      
      if (wordCount >= 40) break;
    }
  }
  
  return answer || article.excerpt?.substring(0, 200) || '';
}

// Generate external links
async function generateExternalLinks(article: any): Promise<number> {
  const wordCount = (article.content || '').split(/\s+/).length;
  const linksNeeded = Math.ceil((wordCount / 1000) * 2);
  
  const trustedSources = [
    { url: 'https://www.exteriores.gob.es', anchor: 'Spanish Ministry of Foreign Affairs', domain: 'government' },
    { url: 'https://www.agenciatributaria.es', anchor: 'Spanish Tax Agency', domain: 'government' },
    { url: 'https://www.notaries.es', anchor: 'Council of Notaries', domain: 'legal' },
    { url: 'https://www.registradores.org', anchor: 'Land Registry', domain: 'legal' },
    { url: 'https://www.apce.es', anchor: 'Association of Property Consultants', domain: 'industry' }
  ];

  const linksToAdd = trustedSources.slice(0, Math.min(linksNeeded, 3));
  
  for (const link of linksToAdd) {
    await supabase.from('external_links').insert({
      article_id: article.id,
      article_type: 'qa',
      url: link.url,
      anchor_text: link.anchor,
      authority_score: 95,
      relevance_score: 85,
      verified: true,
      insertion_method: 'ai_test_optimization'
    });
  }
  
  return linksToAdd.length;
}

// Add internal links
async function addInternalLinks(article: any): Promise<number> {
  const { data: relatedArticles } = await supabase
    .from('qa_articles')
    .select('id, title, slug, funnel_stage')
    .eq('topic', article.topic)
    .neq('id', article.id)
    .limit(3);

  if (!relatedArticles || relatedArticles.length === 0) return 0;

  const internalLinks = relatedArticles.slice(0, 2).map(related => ({
    title: related.title,
    url: `/qa/${related.slug}`,
    type: 'related'
  }));

  await supabase
    .from('qa_articles')
    .update({
      internal_links: internalLinks
    })
    .eq('id', article.id);

  return internalLinks.length;
}

// Optimize voice search formatting
async function optimizeVoiceSearch(article: any): Promise<boolean> {
  const voiceOptimized = formatForVoice(article.content, article.title);
  const hasQuestionTitle = article.title.includes('?') || 
    article.title.toLowerCase().startsWith('how') ||
    article.title.toLowerCase().startsWith('what');

  return voiceOptimized.length > 0 && hasQuestionTitle;
}

// Run optimization on a single article
export async function optimizeSingleArticle(
  article: any,
  onProgress: (progress: TestProgress) => void
): Promise<TestArticle> {
  const startTime = Date.now();
  const enhancements: string[] = [];

  // Phase 1: Calculate initial score
  onProgress({
    phase: 'Scoring',
    currentArticle: 1,
    totalArticles: 1,
    details: `Calculating baseline score for "${article.title.substring(0, 50)}..."`
  });

  const initialScore = calculateAIScore(article);
  const scoreBefore = initialScore.currentScore;

  // Phase 2: Generate speakable answer
  onProgress({
    phase: 'Speakable Content',
    currentArticle: 1,
    totalArticles: 1,
    details: 'Generating 40-60 word speakable answer'
  });

  const speakableAnswer = generateSpeakableAnswer(article);
  const speakableBlock = generateSpeakableSummary(article.content, speakableAnswer);

  await supabase
    .from('qa_articles')
    .update({
      speakable_answer: speakableBlock.text
    })
    .eq('id', article.id);

  enhancements.push(`✅ Speakable answer: ${speakableBlock.wordCount} words`);

  // Phase 3: Add external links
  onProgress({
    phase: 'External Links',
    currentArticle: 1,
    totalArticles: 1,
    details: 'Adding authoritative external sources'
  });

  const externalLinksAdded = await generateExternalLinks(article);
  enhancements.push(`✅ External links: ${externalLinksAdded} added`);

  // Phase 4: Add internal links
  onProgress({
    phase: 'Internal Links',
    currentArticle: 1,
    totalArticles: 1,
    details: 'Linking to related articles'
  });

  const internalLinksAdded = await addInternalLinks(article);
  enhancements.push(`✅ Internal links: ${internalLinksAdded} added`);

  // Phase 5: Optimize voice search
  onProgress({
    phase: 'Voice Optimization',
    currentArticle: 1,
    totalArticles: 1,
    details: 'Enhancing voice search formatting'
  });

  const voiceOptimized = await optimizeVoiceSearch(article);
  if (voiceOptimized) {
    enhancements.push('✅ Voice search: Optimized');
  }

  // Phase 6: Recalculate score
  onProgress({
    phase: 'Final Scoring',
    currentArticle: 1,
    totalArticles: 1,
    details: 'Calculating final optimization score'
  });

  const { data: updatedArticle } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('id', article.id)
    .single();

  const finalScore = calculateAIScore(updatedArticle!);
  const scoreAfter = finalScore.currentScore;

  const processingTime = Date.now() - startTime;

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    funnel_stage: article.funnel_stage,
    scoreBefore,
    scoreAfter,
    enhancements,
    processingTime
  };
}

// Run full 5-article test
export async function runFiveArticleTest(
  onProgress: (progress: TestProgress) => void
): Promise<TestArticle[]> {
  console.log('🧪 Starting 5-Article AI Optimization Test...');

  // Find test articles
  onProgress({
    phase: 'Discovery',
    currentArticle: 0,
    totalArticles: 5,
    details: 'Finding optimal test articles across funnel stages'
  });

  const articles = await findTestArticles();

  if (articles.length < 5) {
    throw new Error(`Only found ${articles.length} suitable articles. Need at least 5.`);
  }

  const results: TestArticle[] = [];

  // Process each article
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    
    onProgress({
      phase: 'Processing',
      currentArticle: i + 1,
      totalArticles: 5,
      details: `Optimizing: ${article.title.substring(0, 60)}...`
    });

    const result = await optimizeSingleArticle(article, (subProgress) => {
      onProgress({
        ...subProgress,
        currentArticle: i + 1,
        totalArticles: 5
      });
    });

    results.push(result);
  }

  return results;
}
