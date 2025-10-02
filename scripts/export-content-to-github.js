#!/usr/bin/env node

/**
 * Export content from Supabase to GitHub markdown format
 * Usage: node scripts/export-content-to-github.js [output-dir]
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qvrvcvmoudxchipvzksh.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Generate YAML frontmatter from article data
 */
function generateFrontmatter(article, type) {
  const lines = ['---'];
  
  // Basic metadata
  lines.push(`slug: ${article.slug}`);
  lines.push(`title: "${escapeYaml(article.title)}"`);
  lines.push(`language: ${article.language}`);
  lines.push(`published: ${article.published !== false}`);
  
  if (type === 'qa') {
    lines.push(`funnelStage: ${article.funnel_stage || 'TOFU'}`);
    lines.push(`topic: ${article.topic || ''}`);
    lines.push(`city: ${article.city || 'Costa del Sol'}`);
    if (article.excerpt) lines.push(`excerpt: "${escapeYaml(article.excerpt)}"`);
  } else {
    lines.push(`category: ${article.category_key || ''}`);
    lines.push(`excerpt: "${escapeYaml(article.excerpt || '')}"`);
    if (article.funnel_stage) lines.push(`funnelStage: ${article.funnel_stage}`);
  }

  // SEO
  if (article.seo && Object.keys(article.seo).length > 0) {
    lines.push('seo:');
    if (article.seo.metaTitle) lines.push(`  metaTitle: "${escapeYaml(article.seo.metaTitle)}"`);
    if (article.seo.metaDescription) lines.push(`  metaDescription: "${escapeYaml(article.seo.metaDescription)}"`);
    if (article.seo.canonical) lines.push(`  canonical: ${article.seo.canonical}`);
    if (article.seo.hreflang?.length > 0) {
      lines.push('  hreflang:');
      article.seo.hreflang.forEach(h => lines.push(`    - ${h}`));
    }
  }

  // Author
  if (article.author && Object.keys(article.author).length > 0) {
    lines.push('author:');
    if (article.author.name) lines.push(`  name: "${escapeYaml(article.author.name)}"`);
    if (article.author.credentials) lines.push(`  credentials: "${escapeYaml(article.author.credentials)}"`);
    if (article.author.bio) lines.push(`  bio: "${escapeYaml(article.author.bio)}"`);
    if (article.author.profileUrl) lines.push(`  profileUrl: ${article.author.profileUrl}`);
  }

  // Reviewer
  if (article.reviewer && Object.keys(article.reviewer).length > 0) {
    lines.push('reviewer:');
    if (article.reviewer.name) lines.push(`  name: "${escapeYaml(article.reviewer.name)}"`);
    if (article.reviewer.credentials) lines.push(`  credentials: "${escapeYaml(article.reviewer.credentials)}"`);
    if (article.reviewer.reviewDate) lines.push(`  reviewDate: ${article.reviewer.reviewDate}`);
  }

  // Hero image
  if (article.hero_image && Object.keys(article.hero_image).length > 0) {
    lines.push('heroImage:');
    if (article.hero_image.src) lines.push(`  src: ${article.hero_image.src}`);
    if (article.hero_image.alt) lines.push(`  alt: "${escapeYaml(article.hero_image.alt)}"`);
    if (article.hero_image.caption) lines.push(`  caption: "${escapeYaml(article.hero_image.caption)}"`);
  }

  // Next step
  if (article.next_step && Object.keys(article.next_step).length > 0) {
    lines.push('nextStep:');
    if (article.next_step.title) lines.push(`  title: "${escapeYaml(article.next_step.title)}"`);
    if (article.next_step.slug) lines.push(`  slug: ${article.next_step.slug}`);
    if (article.next_step.url) lines.push(`  url: ${article.next_step.url}`);
    if (article.next_step.cta) lines.push(`  cta: "${escapeYaml(article.next_step.cta)}"`);
    if (article.next_step.funnelStage) lines.push(`  funnelStage: ${article.next_step.funnelStage}`);
  }

  // Tags/Keywords
  if (type === 'qa' && article.tags?.length > 0) {
    lines.push('tags:');
    article.tags.forEach(tag => lines.push(`  - ${tag}`));
  }

  if (type === 'blog' && article.keywords?.length > 0) {
    lines.push('keywords:');
    article.keywords.forEach(kw => lines.push(`  - ${kw}`));
  }

  // Voice/AEO
  if (article.speakable_questions?.length > 0) {
    lines.push('speakableQuestions:');
    article.speakable_questions.forEach(q => lines.push(`  - "${escapeYaml(q)}"`));
  }
  if (article.speakable_answer) {
    lines.push(`speakableAnswer: "${escapeYaml(article.speakable_answer)}"`);
  }

  // Area served
  if (article.area_served?.length > 0) {
    lines.push('areaServed:');
    article.area_served.forEach(area => lines.push(`  - ${area}`));
  }

  // AI score
  if (article.ai_score) {
    lines.push(`aiScore: ${article.ai_score}`);
  }

  lines.push('---\n');
  return lines.join('\n');
}

/**
 * Escape special characters for YAML
 */
function escapeYaml(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

/**
 * Export articles to markdown files
 */
async function exportArticles(type, outputDir) {
  const table = type === 'qa' ? 'qa_articles' : 'blog_posts';
  
  console.log(`\n📥 Fetching ${type} articles from Supabase...`);
  
  const { data: articles, error } = await supabase
    .from(table)
    .select('*')
    .eq('published', true);

  if (error) {
    console.error(`❌ Error fetching ${type} articles:`, error.message);
    return { success: 0, failed: 1 };
  }

  console.log(`📄 Found ${articles.length} ${type} articles\n`);

  let success = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      // Create directory structure: content/{type}/{language}/{slug}/
      const articleDir = path.join(
        outputDir,
        type,
        article.language,
        article.slug
      );
      
      fs.mkdirSync(articleDir, { recursive: true });

      // Generate markdown
      const frontmatter = generateFrontmatter(article, type);
      const markdown = frontmatter + '\n' + (article.content || '');

      // Write to index.md
      const filePath = path.join(articleDir, 'index.md');
      fs.writeFileSync(filePath, markdown, 'utf-8');

      console.log(`✅ Exported: ${article.slug} (${article.language})`);
      success++;
    } catch (error) {
      console.error(`❌ Error exporting ${article.slug}:`, error.message);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Main export function
 */
async function main() {
  const outputDir = process.argv[2] || './content';
  
  console.log('🚀 Starting content export from Supabase to GitHub...');
  console.log(`📂 Output directory: ${outputDir}\n`);

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Export QA articles
  const qaResults = await exportArticles('qa', outputDir);

  // Export blog posts
  const blogResults = await exportArticles('blog', outputDir);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Export Summary:');
  console.log(`QA Articles: ${qaResults.success} succeeded, ${qaResults.failed} failed`);
  console.log(`Blog Posts: ${blogResults.success} succeeded, ${blogResults.failed} failed`);
  console.log('='.repeat(50));
  console.log(`\n✨ Content exported to: ${path.resolve(outputDir)}`);
}

main().catch(console.error);
