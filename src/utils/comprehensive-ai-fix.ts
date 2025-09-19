import { supabase } from '@/integrations/supabase/client';
import { batchScoreAllArticles, generateAIReport } from '@/lib/aiScoring';
import { runComprehensiveAIOptimization } from './comprehensive-ai-optimizer';

interface ComprehensiveFix {
  phase: string;
  articlesProcessed: number;
  averageScoreBefore: number;
  averageScoreAfter: number;
  voiceReadyBefore: number;
  voiceReadyAfter: number;
  citationReadyBefore: number; 
  citationReadyAfter: number;
  issuesFixed: number;
}

interface ArticleStats {
  total_articles: number;
  avg_score: number;
  voice_ready: number;
  citation_ready: number;
  zero_scores: number;
}

async function getArticleStats(): Promise<ArticleStats> {
  const { data: articles } = await supabase
    .from('qa_articles')
    .select('ai_optimization_score, voice_search_ready, citation_ready');

  if (!articles) {
    return { total_articles: 0, avg_score: 0, voice_ready: 0, citation_ready: 0, zero_scores: 0 };
  }

  const totalArticles = articles.length;
  const totalScore = articles.reduce((sum, article) => sum + (article.ai_optimization_score || 0), 0);
  const avgScore = totalArticles > 0 ? totalScore / totalArticles : 0;
  const voiceReady = articles.filter(article => article.voice_search_ready).length;
  const citationReady = articles.filter(article => article.citation_ready).length;
  const zeroScores = articles.filter(article => (article.ai_optimization_score || 0) === 0).length;

  return {
    total_articles: totalArticles,
    avg_score: avgScore,
    voice_ready: voiceReady,
    citation_ready: citationReady,
    zero_scores: zeroScores
  };
}

export async function runComprehensiveFix(): Promise<{
  scoringFix: ComprehensiveFix;
  contentOptimization: any;
  finalStats: ArticleStats;
}> {
  console.log('🔧 Starting Comprehensive AI Fix and Optimization...');

  // Phase 1: Fix the scoring bug by re-scoring all articles
  console.log('📊 Phase 1: Fixing AI Scoring Bug...');
  
  // Get before stats
  const beforeData = await getArticleStats();
  
  // Run the corrected batch scoring
  const scoringResults = await batchScoreAllArticles();
  
  // Get after stats
  const afterData = await getArticleStats();

  const scoringFix: ComprehensiveFix = {
    phase: 'AI Scoring Fix',
    articlesProcessed: scoringResults.totalProcessed,
    averageScoreBefore: beforeData.avg_score,
    averageScoreAfter: afterData.avg_score,
    voiceReadyBefore: beforeData.voice_ready,
    voiceReadyAfter: afterData.voice_ready,
    citationReadyBefore: beforeData.citation_ready,
    citationReadyAfter: afterData.citation_ready,
    issuesFixed: beforeData.zero_scores
  };

  console.log(`✅ Scoring Fix Complete: ${scoringFix.averageScoreBefore.toFixed(2)} → ${scoringFix.averageScoreAfter.toFixed(2)}`);

  // Phase 2: Run comprehensive content optimization
  console.log('🚀 Phase 2: Running Comprehensive Content Optimization...');
  const contentOptimization = await runComprehensiveAIOptimization();

  // Phase 3: Generate final report
  console.log('📋 Phase 3: Generating Final AI Report...');
  const finalReport = await generateAIReport();

  // Get final stats
  const finalStats = await getArticleStats();

  return {
    scoringFix,
    contentOptimization,
    finalStats
  };
}

// Quick fix function to just run the scoring correction
export async function quickScoreFix(): Promise<{
  totalProcessed: number;
  averageScoreBefore: number;
  averageScoreAfter: number;
  zeroScoresBefore: number;
  zeroScoresAfter: number;
}> {
  // Get before stats
  const beforeStats = await getArticleStats();
  
  // Run batch scoring
  const results = await batchScoreAllArticles();
  
  // Get after stats
  const afterStats = await getArticleStats();
  
  return {
    totalProcessed: results.totalProcessed,
    averageScoreBefore: beforeStats.avg_score,
    averageScoreAfter: afterStats.avg_score,
    zeroScoresBefore: beforeStats.zero_scores,
    zeroScoresAfter: afterStats.zero_scores
  };
}