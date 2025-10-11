#!/usr/bin/env node

/**
 * Bulk Speakable Answer Generator
 * Generates conversational 40-60 word speakable answers for all articles
 * 
 * Usage: npm run generate:speakable
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qvrvcvmoudxchipvzksh.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cnZjdm1vdWR4Y2hpcHZ6a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIyMzksImV4cCI6MjA2ODE4ODIzOX0.4EPE_-5OsZGC10Jeg90q4um8Rdsc1-hXoy5S_gPhl6Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface Stats {
  total: number;
  processed: number;
  success: number;
  failed: number;
  skipped: number;
}

const stats: Stats = {
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  skipped: 0,
};

/**
 * Count words in a string
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

/**
 * Generate speakable answer for a single article
 */
async function generateSpeakableAnswer(article: any): Promise<void> {
  try {
    // Skip if already has speakable answer
    if (article.speakable_answer && article.speakable_answer.trim().length > 0) {
      stats.skipped++;
      console.log(`⏭️  [${stats.processed}/${stats.total}] Skipped: ${article.slug} (already has speakable answer)`);
      return;
    }
    
    console.log(`🔄 [${stats.processed}/${stats.total}] Generating for: ${article.title}`);
    
    // Call edge function to generate speakable answer
    const { data, error } = await supabase.functions.invoke('generate-speakable-answer', {
      body: {
        articleId: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
      }
    });
    
    if (error) {
      console.error(`❌ Error for ${article.slug}:`, error.message);
      stats.failed++;
      return;
    }
    
    if (!data || !data.speakableAnswer) {
      console.error(`❌ No speakable answer generated for ${article.slug}`);
      stats.failed++;
      return;
    }
    
    const wordCount = countWords(data.speakableAnswer);
    const isValidLength = wordCount >= 40 && wordCount <= 60;
    
    if (!isValidLength) {
      console.warn(`⚠️  Warning: ${article.slug} has ${wordCount} words (target: 40-60)`);
    }
    
    // Update database
    const { error: updateError } = await supabase
      .from('qa_articles')
      .update({ speakable_answer: data.speakableAnswer })
      .eq('id', article.id);
    
    if (updateError) {
      console.error(`❌ Failed to update ${article.slug}:`, updateError.message);
      stats.failed++;
      return;
    }
    
    stats.success++;
    const emoji = isValidLength ? '✅' : '⚠️ ';
    console.log(`${emoji} [${stats.processed}/${stats.total}] Generated (${wordCount} words): ${article.slug}`);
    
  } catch (error) {
    stats.failed++;
    console.error(`❌ Error processing ${article.slug}:`, error instanceof Error ? error.message : error);
  }
}

/**
 * Process articles in batches with delay
 */
async function processBatch(articles: any[]): Promise<void> {
  const BATCH_SIZE = 10;
  const DELAY_MS = 2000; // 2 seconds between batches
  
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(articles.length / BATCH_SIZE);
    
    console.log(`\n🔄 Processing batch ${batchNum}/${totalBatches} (articles ${i + 1}-${Math.min(i + BATCH_SIZE, articles.length)})`);
    
    // Process batch in parallel
    await Promise.all(
      batch.map(article => {
        stats.processed++;
        return generateSpeakableAnswer(article);
      })
    );
    
    // Delay between batches to avoid rate limits
    if (i + BATCH_SIZE < articles.length) {
      const remainingBatches = totalBatches - batchNum;
      const estimatedTimeMin = Math.ceil((remainingBatches * DELAY_MS) / 60000);
      console.log(`⏳ Waiting 2s before next batch... (${remainingBatches} batches remaining, ~${estimatedTimeMin} min)`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
}

/**
 * Verify completion
 */
async function verifyCompletion(): Promise<void> {
  console.log('\n🔍 Verifying completion...');
  
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('id, speakable_answer')
    .eq('published', true);
  
  if (error) {
    console.error('❌ Error verifying:', error);
    return;
  }
  
  if (!articles) return;
  
  const withSpeakable = articles.filter(a => a.speakable_answer && a.speakable_answer.trim().length > 0).length;
  const withoutSpeakable = articles.length - withSpeakable;
  
  console.log(`\n📊 Verification Results:`);
  console.log(`   ✅ Articles with speakable answers: ${withSpeakable}/${articles.length} (${(withSpeakable / articles.length * 100).toFixed(1)}%)`);
  console.log(`   ❌ Articles without speakable answers: ${withoutSpeakable}`);
  
  if (withoutSpeakable === 0) {
    console.log(`\n🎉 All articles now have speakable answers!`);
  } else {
    console.log(`\n⚠️  ${withoutSpeakable} articles still need speakable answers. Consider re-running script.`);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Bulk Speakable Answer Generation...\n');
  
  try {
    // Fetch articles without speakable answers
    console.log('📥 Fetching articles from database...');
    const { data: articles, error } = await supabase
      .from('qa_articles')
      .select('id, title, slug, content, excerpt, speakable_answer')
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
    
    // Filter articles that need speakable answers
    const articlesNeedingSpeakable = articles.filter(
      a => !a.speakable_answer || a.speakable_answer.trim().length === 0
    );
    
    stats.total = articlesNeedingSpeakable.length;
    
    console.log(`\n📊 Found ${articles.length} total articles`);
    console.log(`   ✅ Already have speakable: ${articles.length - stats.total}`);
    console.log(`   ❌ Need speakable: ${stats.total}\n`);
    
    if (stats.total === 0) {
      console.log('🎉 All articles already have speakable answers!');
      return;
    }
    
    // Process all articles
    const startTime = Date.now();
    await processBatch(articlesNeedingSpeakable);
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    // Verify completion
    await verifyCompletion();
    
    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SPEAKABLE GENERATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully generated: ${stats.success} answers`);
    console.log(`⏭️  Skipped (already exists): ${stats.skipped} answers`);
    console.log(`❌ Failed to generate: ${stats.failed} answers`);
    console.log(`\n⏱️  Total time: ${duration} minutes`);
    console.log(`📈 Success rate: ${((stats.success / stats.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(70));
    
    if (stats.failed > 0) {
      console.log(`\n⚠️  ${stats.failed} articles failed. Consider re-running script for failed articles.`);
    }
    
    console.log(`\n💡 Next step: Run 'npm run calculate:scores' to update AI scores\n`);
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run generation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
