#!/usr/bin/env node

/**
 * Batch AI Score Calculator
 * Calculates AI optimization scores for all articles in database
 * 
 * Usage: npm run calculate:scores
 */

import { createClient } from '@supabase/supabase-js';
import { calculateAIScore } from '../src/lib/scoring/calculate-ai-score.js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qvrvcvmoudxchipvzksh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cnZjdm1vdWR4Y2hpcHZ6a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIyMzksImV4cCI6MjA2ODE4ODIzOX0.4EPE_-5OsZGC10Jeg90q4um8Rdsc1-hXoy5S_gPhl6Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ScoreStats {
  total: number;
  processed: number;
  failed: number;
  scores: number[];
  excellent: number; // >= 9.8
  good: number; // 8.0-9.7
  needsWork: number; // < 8.0
  avgScore: number;
}

const stats: ScoreStats = {
  total: 0,
  processed: 0,
  failed: 0,
  scores: [],
  excellent: 0,
  good: 0,
  needsWork: 0,
  avgScore: 0,
};

/**
 * Calculate score for a single article
 */
async function calculateScore(articleId: string): Promise<void> {
  try {
    console.log(`📊 Calculating score for article: ${articleId}`);
    
    // Use existing calculateAIScore function
    const result = await calculateAIScore(articleId);
    
    // Update database with the score
    const { error } = await supabase
      .from('qa_articles')
      .update({ ai_score: result.score })
      .eq('id', articleId);
    
    if (error) {
      console.error(`❌ Failed to update score for ${articleId}:`, error.message);
      stats.failed++;
      return;
    }
    
    // Track statistics
    stats.scores.push(result.score);
    if (result.score >= 9.8) stats.excellent++;
    else if (result.score >= 8.0) stats.good++;
    else stats.needsWork++;
    
    stats.processed++;
    
    // Log progress
    const progress = `${stats.processed}/${stats.total}`;
    const scoreEmoji = result.score >= 9.8 ? '🟢' : result.score >= 8.0 ? '🟡' : '🔴';
    console.log(`${scoreEmoji} [${progress}] Score: ${result.score.toFixed(2)}/10 | Issues: ${result.issues.length}`);
    
    if (result.issues.length > 0) {
      console.log(`   ⚠️  Issues: ${result.issues.slice(0, 3).join(', ')}${result.issues.length > 3 ? '...' : ''}`);
    }
    
  } catch (error) {
    stats.failed++;
    console.error(`❌ Error calculating score for ${articleId}:`, error instanceof Error ? error.message : error);
  }
}

/**
 * Process articles in batches
 */
async function processBatch(articles: any[]): Promise<void> {
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    
    console.log(`\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(articles.length / BATCH_SIZE)}`);
    
    // Process batch in parallel
    await Promise.all(
      batch.map(article => calculateScore(article.id))
    );
    
    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Generate CSV report of low-scoring articles
 */
async function exportCSV(): Promise<void> {
  try {
    console.log('\n📄 Generating CSV report...');
    
    const { data: lowScoreArticles, error } = await supabase
      .from('qa_articles')
      .select('id, title, slug, language, ai_score, funnel_stage')
      .lt('ai_score', 9.8)
      .order('ai_score', { ascending: true })
      .limit(100);
    
    if (error) throw error;
    
    if (!lowScoreArticles || lowScoreArticles.length === 0) {
      console.log('✅ No low-scoring articles found!');
      return;
    }
    
    const csv = [
      'ID,Title,Slug,Language,Score,Funnel Stage,URL',
      ...lowScoreArticles.map(a => 
        `${a.id},"${a.title}",${a.slug},${a.language},${a.ai_score?.toFixed(2) || 0},${a.funnel_stage},https://delsolprimehomes.com/${a.language}/qa/${a.slug}`
      )
    ].join('\n');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const filePath = path.join(reportsDir, 'low-scoring-articles.csv');
    fs.writeFileSync(filePath, csv, 'utf-8');
    
    console.log(`✅ Report saved to: ${filePath}`);
    console.log(`   Articles needing improvement: ${lowScoreArticles.length}`);
    
  } catch (error) {
    console.error('❌ Error generating CSV:', error);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🚀 Starting AI Score Calculation...\n');
  
  try {
    // Fetch all QA articles
    console.log('📥 Fetching articles from database...');
    const { data: articles, error } = await supabase
      .from('qa_articles')
      .select('id, title, slug, language')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching articles:', error);
      throw error;
    }
    
    if (!articles || articles.length === 0) {
      console.log('⚠️  No articles found in database.');
      return;
    }
    
    stats.total = articles.length;
    console.log(`\n📊 Found ${stats.total} articles to process\n`);
    
    // Process all articles
    await processBatch(articles);
    
    // Calculate final statistics
    stats.avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    
    // Export CSV report
    await exportCSV();
    
    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 AI SCORE CALCULATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully processed: ${stats.processed} articles`);
    console.log(`❌ Failed to process: ${stats.failed} articles`);
    console.log(`\n📈 Score Distribution:`);
    console.log(`   🟢 Excellent (≥9.8): ${stats.excellent} articles (${(stats.excellent / stats.total * 100).toFixed(1)}%)`);
    console.log(`   🟡 Good (8.0-9.7): ${stats.good} articles (${(stats.good / stats.total * 100).toFixed(1)}%)`);
    console.log(`   🔴 Needs Work (<8.0): ${stats.needsWork} articles (${(stats.needsWork / stats.total * 100).toFixed(1)}%)`);
    console.log(`\n📊 Average Score: ${stats.avgScore.toFixed(2)}/10`);
    console.log(`\n🎯 Target: ${stats.excellent} articles ready for AI indexing (≥9.8)`);
    console.log(`⚠️  Action Required: ${stats.total - stats.excellent} articles need optimization`);
    console.log('='.repeat(70));
    
    if (stats.needsWork > 0) {
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Review low-scoring articles in reports/low-scoring-articles.csv`);
      console.log(`   2. Run: npm run generate:speakable (fixes voice readiness)`);
      console.log(`   3. Run: npm run generate:links (fixes external link quality)`);
      console.log(`   4. Re-run this script to verify improvements\n`);
    } else {
      console.log(`\n🎉 All articles are scoring well! Ready for deployment.\n`);
    }
    
  } catch (error) {
    console.error('\n❌ Calculation failed:', error);
    process.exit(1);
  }
}

// Run calculation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
