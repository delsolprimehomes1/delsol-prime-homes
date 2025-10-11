#!/usr/bin/env node

/**
 * Batch calculate AI optimization scores for all articles
 * Usage: npm run calculate:ai-scores
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qvrvcvmoudxchipvzksh.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface ScoreStats {
  total: number;
  processed: number;
  success: number;
  failed: number;
  avgScore: number;
  excellentCount: number;
  goodCount: number;
  needsWorkCount: number;
  criticalCount: number;
  topIssues: Map<string, number>;
  topSuggestions: Map<string, number>;
  lowScoringArticles: Array<{
    id: string;
    title: string;
    score: number;
    issues: string[];
    suggestions: string[];
  }>;
}

const stats: ScoreStats = {
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  avgScore: 0,
  excellentCount: 0,
  goodCount: 0,
  needsWorkCount: 0,
  criticalCount: 0,
  topIssues: new Map(),
  topSuggestions: new Map(),
  lowScoringArticles: [],
};

/**
 * Calculate AI score for a single article (inline implementation)
 */
async function calculateScore(articleId: string) {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Fetch article
  const { data: article, error } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error || !article) throw new Error(`Article not found: ${articleId}`);

  // 1. Voice Readiness (2.0)
  const speakableQuestions = article.speakable_questions || [];
  const speakableAnswer = article.speakable_answer || '';
  const questionsWords = speakableQuestions.join(' ').split(/\s+/).length;
  const answerWords = speakableAnswer.split(/\s+/).filter(w => w.length > 0).length;

  if (questionsWords >= 40 && questionsWords <= 60) score += 1.0;
  else if (questionsWords > 0) { score += 0.5; issues.push(`Speakable questions: ${questionsWords}w`); }
  else issues.push('No speakable questions');

  if (answerWords >= 40 && answerWords <= 60) score += 1.0;
  else if (answerWords > 0) { score += 0.5; issues.push(`Speakable answer: ${answerWords}w`); }
  else issues.push('No speakable answer');

  // 2. Schema Quality (1.5)
  const hasGeo = article.geo_coordinates && typeof article.geo_coordinates === 'object';
  if (hasGeo) score += 0.5;
  else issues.push('No geo coordinates');

  if (speakableQuestions.length > 0 && speakableAnswer) score += 0.5;
  if (article.author_id || article.author) score += 0.5;
  else issues.push('No author');

  // 3. External Links (2.0)
  const wordCount = (article.content || '').split(/\s+/).length;
  const { data: links } = await supabase
    .from('external_links')
    .select('verified')
    .eq('article_id', articleId)
    .eq('verified', true);

  const linksPerK = wordCount > 0 ? ((links?.length || 0) / wordCount) * 1000 : 0;
  if (linksPerK >= 2) score += 2.0;
  else if (linksPerK >= 1) { score += 1.0; suggestions.push('Add more external links'); }
  else if (linksPerK > 0) { score += 0.5; issues.push('Low link density'); }
  else issues.push('No external links');

  // 4. Heading Structure (1.5)
  const content = article.content || '';
  const h1Count = (content.match(/^# .+$/gm) || []).length;
  const h2Count = (content.match(/^## .+$/gm) || []).length;

  if (h1Count === 1) score += 0.5;
  else issues.push(h1Count === 0 ? 'No H1' : `${h1Count} H1s`);

  if (h2Count >= 3) score += 0.5;
  else issues.push(`Only ${h2Count} H2s`);

  if (h2Count > 0) score += 0.5;

  // 5. Multilingual (1.0)
  const { data: translations } = await supabase
    .from('qa_articles')
    .select('id')
    .eq('slug', article.slug)
    .neq('language', article.language);

  const transCount = translations?.length || 0;
  if (transCount >= 5) score += 1.0;
  else if (transCount >= 3) { score += 0.7; suggestions.push('More translations'); }
  else if (transCount >= 1) { score += 0.3; issues.push(`${transCount} translations`); }
  else issues.push('No translations');

  // 6. Freshness (1.0)
  const days = Math.floor((Date.now() - new Date(article.updated_at).getTime()) / 86400000);
  if (days < 30) score += 1.0;
  else if (days < 90) { score += 0.7; suggestions.push('Refresh content'); }
  else { score += 0.3; issues.push(`${days} days old`); }

  // 7. E-E-A-T (1.0)
  const hasAuthor = !!(article.author_id || article.author);
  const hasReviewer = !!(article.reviewer_id || article.reviewer);
  if (hasAuthor && hasReviewer) score += 1.0;
  else if (hasAuthor) { score += 0.5; issues.push('No reviewer'); }
  else issues.push('No author/reviewer');

  return { score: Number(score.toFixed(2)), issues, suggestions };
}

/**
 * Process articles in batches
 */
async function processBatch(articles: any[]) {
  for (const article of articles) {
    stats.processed++;

    try {
      console.log(`[${stats.processed}/${stats.total}] ${article.title.substring(0, 50)}...`);

      const result = await calculateScore(article.id);

      // Update database
      const { error: updateError } = await supabase
        .from('qa_articles')
        .update({ ai_score: result.score })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Failed to update: ${updateError.message}`);
        stats.failed++;
        continue;
      }

      stats.success++;
      stats.avgScore += result.score;

      // Categorize
      if (result.score >= 9.8) stats.excellentCount++;
      else if (result.score >= 9.0) stats.goodCount++;
      else if (result.score >= 8.0) stats.needsWorkCount++;
      else stats.criticalCount++;

      // Track issues and suggestions
      result.issues.forEach(issue => {
        stats.topIssues.set(issue, (stats.topIssues.get(issue) || 0) + 1);
      });
      result.suggestions.forEach(suggestion => {
        stats.topSuggestions.set(suggestion, (stats.topSuggestions.get(suggestion) || 0) + 1);
      });

      // Track low-scoring articles
      if (result.score < 9.8) {
        stats.lowScoringArticles.push({
          id: article.id,
          title: article.title,
          score: result.score,
          issues: result.issues,
          suggestions: result.suggestions,
        });
      }

      console.log(`✅ Score: ${result.score}/10`);

    } catch (error) {
      stats.failed++;
      console.error(`❌ Error: ${error instanceof Error ? error.message : error}`);
    }
  }
}

/**
 * Export low-scoring articles to CSV
 */
async function exportCSV() {
  try {
    await mkdir('reports', { recursive: true });

    const csvLines = [
      'ID,Title,Score,Issues,Suggestions',
      ...stats.lowScoringArticles
        .sort((a, b) => a.score - b.score)
        .map(article => 
          `"${article.id}","${article.title}",${article.score},"${article.issues.join('; ')}","${article.suggestions.join('; ')}"`
        )
    ];

    await writeFile('reports/low-scoring-articles.csv', csvLines.join('\n'), 'utf-8');
    console.log('\n📄 Exported to: reports/low-scoring-articles.csv');

  } catch (error) {
    console.error('Failed to export CSV:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting AI score calculation...\n');

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('id, title, slug')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch articles:', error);
    process.exit(1);
  }

  stats.total = articles?.length || 0;
  console.log(`📊 Found ${stats.total} articles to process\n`);

  if (stats.total === 0) {
    console.log('No articles found. Exiting...');
    return;
  }

  // Process in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, Math.min(i + BATCH_SIZE, articles.length));
    await processBatch(batch);
    console.log(`\n📊 Progress: ${stats.processed}/${stats.total} (${Math.round(stats.processed/stats.total*100)}%)\n`);
  }

  // Calculate averages
  stats.avgScore = stats.avgScore / stats.success;

  // Export CSV
  await exportCSV();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`Total articles: ${stats.total}`);
  console.log(`Successfully scored: ${stats.success}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`\nAverage score: ${stats.avgScore.toFixed(2)}/10`);
  console.log(`\n📊 Distribution:`);
  console.log(`  9.8-10.0 (Excellent): ${stats.excellentCount} (${(stats.excellentCount/stats.total*100).toFixed(1)}%)`);
  console.log(`  9.0-9.7 (Good): ${stats.goodCount} (${(stats.goodCount/stats.total*100).toFixed(1)}%)`);
  console.log(`  8.0-8.9 (Needs Work): ${stats.needsWorkCount} (${(stats.needsWorkCount/stats.total*100).toFixed(1)}%)`);
  console.log(`  <8.0 (Critical): ${stats.criticalCount} (${(stats.criticalCount/stats.total*100).toFixed(1)}%)`);

  // Top 10 issues
  const topIssues = Array.from(stats.topIssues.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`\n⚠️  Top 10 Issues:`);
  topIssues.forEach(([issue, count], idx) => {
    console.log(`  ${idx + 1}. ${issue}: ${count} articles`);
  });

  // Top 10 suggestions
  const topSuggestions = Array.from(stats.topSuggestions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`\n💡 Top 10 Suggestions:`);
  topSuggestions.forEach(([suggestion, count], idx) => {
    console.log(`  ${idx + 1}. ${suggestion}: ${count} articles`);
  });

  console.log('\n✨ Scoring complete!\n');
}

main().catch(console.error);
