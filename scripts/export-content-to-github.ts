#!/usr/bin/env node

/**
 * Export all articles from Supabase to GitHub markdown files
 * Creates /content/{lang}/{type}/{slug}/index.md with complete frontmatter
 * 
 * Usage: npm run export:content
 */

import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qvrbaovlmhxupzjesykw.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Stats tracking
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  byLanguage: {} as Record<string, number>,
  byType: {} as Record<string, number>,
  missingFields: {
    speakableQuestions: 0,
    geo: 0,
    author: 0,
    reviewer: 0,
    heroImage: 0,
  }
};

// Default values
const DEFAULTS = {
  geo: { lat: 36.5099, lng: -4.8854 }, // Costa del Sol
  author: 'Hans Beeckman',
  city: 'Costa del Sol',
};

/**
 * Escape YAML special characters
 */
function escapeYaml(str: string): string {
  if (!str) return '';
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
  return `"${escaped}"`;
}

/**
 * Generate complete YAML frontmatter
 */
function generateFrontmatter(article: any, type: 'qa' | 'blog'): string {
  const lines: string[] = ['---'];
  
  // Basic metadata
  lines.push(`title: ${escapeYaml(article.title)}`);
  lines.push(`slug: ${article.slug}`);
  lines.push(`language: ${article.language}`);
  lines.push(`type: ${type}`);
  lines.push(`published: ${article.published !== false}`);
  
  // Type-specific fields
  if (type === 'qa') {
    lines.push(`funnelStage: ${article.funnel_stage || 'TOFU'}`);
    lines.push(`topic: ${article.topic || 'general'}`);
    lines.push(`city: ${article.city || DEFAULTS.city}`);
  } else {
    lines.push(`category: ${article.category_key || 'general'}`);
  }
  
  // Summary/Excerpt
  const summary = article.summary || article.excerpt || '';
  if (summary) {
    lines.push(`summary: ${escapeYaml(summary)}`);
  }
  
  // SEO metadata
  if (article.seo || article.meta_title || article.meta_description) {
    lines.push('seo:');
    const seo = typeof article.seo === 'string' ? JSON.parse(article.seo) : (article.seo || {});
    const metaTitle = seo.metaTitle || article.meta_title || article.title;
    const metaDesc = seo.metaDescription || article.meta_description || '';
    const canonical = seo.canonical || article.canonical_url || '';
    
    if (metaTitle) lines.push(`  metaTitle: ${escapeYaml(metaTitle)}`);
    if (metaDesc) lines.push(`  metaDescription: ${escapeYaml(metaDesc)}`);
    if (canonical) lines.push(`  canonical: ${canonical}`);
  }
  
  // Hreflang (generate for all 11 languages)
  const languages = ['en', 'es', 'de', 'nl', 'fr', 'pl', 'sv', 'da', 'hu', 'no', 'fi'];
  lines.push('hreflang:');
  languages.forEach(lang => {
    const url = `https://www.delsolprimes.com/${lang === 'en' ? '' : lang + '/'}${type === 'qa' ? 'qa' : 'blog'}/${article.slug}`;
    lines.push(`  - lang: ${lang}`);
    lines.push(`    url: ${url}`);
  });
  
  // Author
  if (article.author) {
    const author = typeof article.author === 'string' ? JSON.parse(article.author) : article.author;
    if (author && typeof author === 'object' && Object.keys(author).length > 0) {
      lines.push('author:');
      if (author.name) lines.push(`  name: ${escapeYaml(author.name)}`);
      if (author.credentials) lines.push(`  credentials: ${escapeYaml(author.credentials)}`);
      if (author.bio) lines.push(`  bio: ${escapeYaml(author.bio)}`);
      if (author.profileUrl) lines.push(`  profileUrl: ${author.profileUrl}`);
    }
  }
  
  // Reviewer
  if (article.reviewer) {
    const reviewer = typeof article.reviewer === 'string' ? JSON.parse(article.reviewer) : article.reviewer;
    if (reviewer && typeof reviewer === 'object' && Object.keys(reviewer).length > 0) {
      lines.push('reviewer:');
      if (reviewer.name) lines.push(`  name: ${escapeYaml(reviewer.name)}`);
      if (reviewer.credentials) lines.push(`  credentials: ${escapeYaml(reviewer.credentials)}`);
      if (reviewer.reviewDate) lines.push(`  reviewDate: ${reviewer.reviewDate}`);
    }
  }
  
  // Hero Image
  if (article.hero_image) {
    const heroImage = typeof article.hero_image === 'string' ? JSON.parse(article.hero_image) : article.hero_image;
    if (heroImage && typeof heroImage === 'object' && Object.keys(heroImage).length > 0) {
      lines.push('heroImage:');
      if (heroImage.src) lines.push(`  src: ${heroImage.src}`);
      if (heroImage.alt) lines.push(`  alt: ${escapeYaml(heroImage.alt)}`);
      if (heroImage.caption) lines.push(`  caption: ${escapeYaml(heroImage.caption)}`);
    }
  } else if (article.featured_image) {
    lines.push('heroImage:');
    lines.push(`  src: ${article.featured_image}`);
    if (article.image_alt) lines.push(`  alt: ${escapeYaml(article.image_alt)}`);
  }
  
  // Speakable Questions
  if (article.speakable_questions && Array.isArray(article.speakable_questions) && article.speakable_questions.length > 0) {
    lines.push('speakableQuestions:');
    article.speakable_questions.forEach((q: string) => {
      lines.push(`  - ${escapeYaml(q)}`);
    });
  } else {
    stats.missingFields.speakableQuestions++;
  }
  
  // Speakable Answer
  if (article.speakable_answer) {
    lines.push(`speakableAnswer: ${escapeYaml(article.speakable_answer)}`);
  }
  
  // Geo Coordinates
  if (article.geo_coordinates) {
    const geo = typeof article.geo_coordinates === 'string' ? JSON.parse(article.geo_coordinates) : article.geo_coordinates;
    if (geo && typeof geo === 'object') {
      lines.push('geo:');
      lines.push(`  lat: ${geo.lat || DEFAULTS.geo.lat}`);
      lines.push(`  lng: ${geo.lng || geo.lon || DEFAULTS.geo.lng}`);
    }
  } else {
    stats.missingFields.geo++;
    lines.push('geo:');
    lines.push(`  lat: ${DEFAULTS.geo.lat}`);
    lines.push(`  lng: ${DEFAULTS.geo.lng}`);
  }
  
  // Next Step
  if (article.next_step) {
    const nextStep = typeof article.next_step === 'string' ? JSON.parse(article.next_step) : article.next_step;
    if (nextStep && typeof nextStep === 'object' && Object.keys(nextStep).length > 0) {
      lines.push('nextStep:');
      if (nextStep.title) lines.push(`  title: ${escapeYaml(nextStep.title)}`);
      if (nextStep.slug) lines.push(`  slug: ${nextStep.slug}`);
      if (nextStep.url) lines.push(`  url: ${nextStep.url}`);
      if (nextStep.cta) lines.push(`  cta: ${escapeYaml(nextStep.cta)}`);
      if (nextStep.funnelStage) lines.push(`  funnelStage: ${nextStep.funnelStage}`);
    }
  }
  
  // Tags
  if (article.tags && Array.isArray(article.tags) && article.tags.length > 0) {
    lines.push('tags:');
    article.tags.forEach((tag: string) => {
      lines.push(`  - ${tag}`);
    });
  }
  
  // Keywords (for blog)
  if (type === 'blog' && article.keywords && Array.isArray(article.keywords) && article.keywords.length > 0) {
    lines.push('keywords:');
    article.keywords.forEach((kw: string) => {
      lines.push(`  - ${kw}`);
    });
  }
  
  // Area Served
  if (article.area_served && Array.isArray(article.area_served) && article.area_served.length > 0) {
    lines.push('areaServed:');
    article.area_served.forEach((area: string) => {
      lines.push(`  - ${area}`);
    });
  }
  
  // AI Score
  if (article.ai_score) {
    lines.push(`aiScore: ${article.ai_score}`);
  }
  
  // Timestamps
  if (article.created_at) {
    lines.push(`createdAt: ${new Date(article.created_at).toISOString()}`);
  }
  if (article.updated_at) {
    lines.push(`updatedAt: ${new Date(article.updated_at).toISOString()}`);
  }
  
  lines.push('---');
  lines.push(''); // Empty line before content
  
  return lines.join('\n');
}

/**
 * Export a single article to markdown
 */
async function exportArticle(article: any, type: 'qa' | 'blog'): Promise<void> {
  try {
    const lang = article.language || 'en';
    const slug = article.slug;
    
    // Create directory structure
    const dir = join(process.cwd(), 'content', lang, type, slug);
    await mkdir(dir, { recursive: true });
    
    // Generate frontmatter
    const frontmatter = generateFrontmatter(article, type);
    
    // Get content
    const content = article.content || '';
    
    // Combine frontmatter and content
    const markdown = frontmatter + '\n' + content;
    
    // Write file
    const filePath = join(dir, 'index.md');
    await writeFile(filePath, markdown, 'utf-8');
    
    // Update stats
    stats.success++;
    stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    // Log progress
    const progress = `${stats.success}/${stats.total}`;
    console.log(`✅ [${progress}] Exported: ${lang}/${type}/${slug}`);
    
  } catch (error) {
    stats.failed++;
    console.error(`❌ Failed to export ${article.slug}:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Main export function
 */
async function exportAllContent(): Promise<void> {
  console.log('🚀 Starting content export from Supabase to GitHub...\n');
  
  try {
    // Fetch QA articles
    console.log('📥 Fetching QA articles...');
    const { data: qaArticles, error: qaError } = await supabase
      .from('qa_articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (qaError) {
      console.error('❌ Error fetching QA articles:', qaError);
      throw qaError;
    }
    
    // Fetch blog posts
    console.log('📥 Fetching blog posts...');
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (blogError) {
      console.error('❌ Error fetching blog posts:', blogError);
      throw blogError;
    }
    
    // Calculate totals
    const qaCount = qaArticles?.length || 0;
    const blogCount = blogPosts?.length || 0;
    stats.total = qaCount + blogCount;
    
    console.log(`\n📊 Found ${qaCount} QA articles and ${blogCount} blog posts (${stats.total} total)\n`);
    
    if (stats.total === 0) {
      console.log('⚠️  No content found in database. Exiting...');
      return;
    }
    
    // Export QA articles
    if (qaArticles && qaArticles.length > 0) {
      console.log('📝 Exporting QA articles...\n');
      for (const article of qaArticles) {
        await exportArticle(article, 'qa');
      }
    }
    
    // Export blog posts
    if (blogPosts && blogPosts.length > 0) {
      console.log('\n📝 Exporting blog posts...\n');
      for (const post of blogPosts) {
        await exportArticle(post, 'blog');
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully exported: ${stats.success} articles`);
    console.log(`❌ Failed to export: ${stats.failed} articles`);
    console.log('\n📊 By Language:');
    Object.entries(stats.byLanguage)
      .sort(([, a], [, b]) => b - a)
      .forEach(([lang, count]) => {
        console.log(`   ${lang.toUpperCase()}: ${count} articles`);
      });
    console.log('\n📊 By Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`   ${type.toUpperCase()}: ${count} articles`);
    });
    console.log('\n⚠️  Missing Fields:');
    console.log(`   Speakable Questions: ${stats.missingFields.speakableQuestions} articles`);
    console.log(`   Geo Coordinates: ${stats.missingFields.geo} articles (using defaults)`);
    console.log(`   Author: ${stats.missingFields.author} articles`);
    console.log(`   Reviewer: ${stats.missingFields.reviewer} articles`);
    console.log(`   Hero Image: ${stats.missingFields.heroImage} articles`);
    console.log('='.repeat(60));
    console.log('\n✨ Export complete! Content ready for Git commit.\n');
    console.log('💡 Next steps:');
    console.log('   1. Review exported files in /content/ directory');
    console.log('   2. Commit to Git: git add content && git commit -m "feat: export content from Supabase"');
    console.log('   3. Push to GitHub: git push origin main');
    console.log('   4. Verify GitHub Actions trigger\n');
    
  } catch (error) {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  }
}

// Run export
exportAllContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
