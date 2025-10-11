#!/usr/bin/env node

/**
 * Bulk External Links Generator
 * Generates 2-3 trusted external links per article
 * 
 * Usage: npm run generate:links
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
  linksGenerated: number;
  avgAuthority: number;
  domainBreakdown: Record<string, number>;
}

const stats: Stats = {
  total: 0,
  processed: 0,
  success: 0,
  failed: 0,
  linksGenerated: 0,
  avgAuthority: 0,
  domainBreakdown: {},
};

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

/**
 * Generate external links for a single article
 */
async function generateExternalLinks(article: any): Promise<void> {
  try {
    console.log(`🔄 [${stats.processed}/${stats.total}] Processing: ${article.title}`);
    
    // Check if article already has enough links
    const { data: existingLinks, error: countError } = await supabase
      .from('external_links')
      .select('id')
      .eq('article_id', article.id)
      .eq('article_type', 'qa');
    
    if (countError) {
      console.error(`❌ Error checking existing links for ${article.slug}:`, countError.message);
      stats.failed++;
      return;
    }
    
    const existingCount = existingLinks?.length || 0;
    
    if (existingCount >= 2) {
      console.log(`⏭️  [${stats.processed}/${stats.total}] Skipped: ${article.slug} (already has ${existingCount} links)`);
      stats.success++;
      return;
    }
    
    // Call edge function to generate links
    const { data, error } = await supabase.functions.invoke('generate-external-links', {
      body: {
        articleId: article.id,
        title: article.title,
        content: article.content,
        topic: article.topic,
        language: article.language,
        targetCount: 2 - existingCount, // Only generate what's needed
      }
    });
    
    if (error) {
      console.error(`❌ Error for ${article.slug}:`, error.message);
      stats.failed++;
      return;
    }
    
    if (!data || !data.links || data.links.length === 0) {
      console.error(`❌ No links generated for ${article.slug}`);
      stats.failed++;
      return;
    }
    
    // Track link statistics
    let linksAdded = 0;
    let totalAuthority = 0;
    
    for (const link of data.links) {
      const domain = extractDomain(link.url);
      stats.domainBreakdown[domain] = (stats.domainBreakdown[domain] || 0) + 1;
      totalAuthority += link.authority_score || 0;
      linksAdded++;
    }
    
    stats.linksGenerated += linksAdded;
    const avgAuthority = totalAuthority / linksAdded;
    stats.avgAuthority = ((stats.avgAuthority * stats.success) + avgAuthority) / (stats.success + 1);
    
    stats.success++;
    console.log(`✅ [${stats.processed}/${stats.total}] Generated ${linksAdded} links for: ${article.slug} (avg authority: ${avgAuthority.toFixed(0)})`);
    
    if (linksAdded > 0) {
      const domains = data.links.map((l: any) => extractDomain(l.url)).join(', ');
      console.log(`   🔗 Domains: ${domains}`);
    }
    
  } catch (error) {
    stats.failed++;
    console.error(`❌ Error processing ${article.slug}:`, error instanceof Error ? error.message : error);
  }
}

/**
 * Process articles in batches with delay
 */
async function processBatch(articles: any[]): Promise<void> {
  const BATCH_SIZE = 5; // Smaller batches for Perplexity rate limits
  const DELAY_MS = 5000; // 5 seconds between batches
  
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(articles.length / BATCH_SIZE);
    
    console.log(`\n🔄 Processing batch ${batchNum}/${totalBatches} (articles ${i + 1}-${Math.min(i + BATCH_SIZE, articles.length)})`);
    
    // Process batch in parallel
    await Promise.all(
      batch.map(article => {
        stats.processed++;
        return generateExternalLinks(article);
      })
    );
    
    // Delay between batches to avoid rate limits
    if (i + BATCH_SIZE < articles.length) {
      const remainingBatches = totalBatches - batchNum;
      const estimatedTimeMin = Math.ceil((remainingBatches * DELAY_MS) / 60000);
      console.log(`⏳ Waiting 5s before next batch... (${remainingBatches} batches remaining, ~${estimatedTimeMin} min)`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
}

/**
 * Verify completion
 */
async function verifyCompletion(): Promise<void> {
  console.log('\n🔍 Verifying completion...');
  
  const { data: linkStats, error } = await supabase
    .from('external_links')
    .select('article_id, article_type, authority_score')
    .eq('article_type', 'qa');
  
  if (error) {
    console.error('❌ Error verifying:', error);
    return;
  }
  
  if (!linkStats) return;
  
  const uniqueArticles = new Set(linkStats.map(l => l.article_id)).size;
  const avgAuthority = linkStats.reduce((sum, l) => sum + (l.authority_score || 0), 0) / linkStats.length;
  
  console.log(`\n📊 Verification Results:`);
  console.log(`   🔗 Total external links: ${linkStats.length}`);
  console.log(`   📄 Articles with links: ${uniqueArticles}/${stats.total}`);
  console.log(`   ⭐ Average authority score: ${avgAuthority.toFixed(1)}/100`);
  
  const articlesNeedingLinks = stats.total - uniqueArticles;
  if (articlesNeedingLinks === 0) {
    console.log(`\n🎉 All articles now have external links!`);
  } else {
    console.log(`\n⚠️  ${articlesNeedingLinks} articles still need links. Consider re-running script.`);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Bulk External Links Generation...\n');
  console.log('🎯 Target: 2-3 trusted external links per article');
  console.log('🔍 Prioritizing: .gov.es, .boe.es, .europa.eu, .edu domains\n');
  
  try {
    // Fetch all published articles
    console.log('📥 Fetching articles from database...');
    const { data: articles, error } = await supabase
      .from('qa_articles')
      .select('id, title, slug, content, topic, language')
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
    const targetLinks = stats.total * 2; // Minimum 2 per article
    
    console.log(`\n📊 Found ${stats.total} articles`);
    console.log(`🎯 Target: ${targetLinks}+ external links\n`);
    
    // Process all articles
    const startTime = Date.now();
    await processBatch(articles);
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    
    // Verify completion
    await verifyCompletion();
    
    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 EXTERNAL LINKS GENERATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully processed: ${stats.success} articles`);
    console.log(`❌ Failed to process: ${stats.failed} articles`);
    console.log(`🔗 Total links generated: ${stats.linksGenerated}`);
    console.log(`⭐ Average authority score: ${stats.avgAuthority.toFixed(1)}/100`);
    console.log(`\n⏱️  Total time: ${duration} minutes`);
    console.log(`📈 Success rate: ${((stats.success / stats.total) * 100).toFixed(1)}%`);
    
    console.log(`\n🌐 Domain Breakdown (top 10):`);
    const topDomains = Object.entries(stats.domainBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    topDomains.forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count} links`);
    });
    
    console.log('='.repeat(70));
    
    const targetMet = stats.linksGenerated >= targetLinks;
    if (targetMet) {
      console.log(`\n🎉 Target reached! ${stats.linksGenerated} links generated (target: ${targetLinks})`);
    } else {
      const remaining = targetLinks - stats.linksGenerated;
      console.log(`\n⚠️  ${remaining} more links needed to reach target. Consider re-running script.`);
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
