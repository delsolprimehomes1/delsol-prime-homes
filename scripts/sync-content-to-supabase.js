#!/usr/bin/env node

/**
 * Sync markdown content from GitHub to Supabase
 * Usage: node scripts/sync-content-to-supabase.js [path-to-content-dir]
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
 * Parse markdown with frontmatter
 */
function parseMarkdown(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content };
  }

  const [, yamlContent, markdownContent] = match;
  const frontmatter = parseYAML(yamlContent);

  return {
    frontmatter,
    content: markdownContent.trim(),
  };
}

/**
 * Simple YAML parser for frontmatter
 */
function parseYAML(yaml) {
  const obj = {};
  const lines = yaml.split('\n');
  let currentKey = null;
  let currentArray = null;
  let currentObject = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Array item
    if (trimmed.startsWith('- ')) {
      const value = trimmed.substring(2).replace(/^["']|["']$/g, '');
      if (currentArray) {
        currentArray.push(value);
      }
      continue;
    }

    // Key-value pair
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();

      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');

      // Check if it's an array
      if (value === '' && lines[lines.indexOf(line) + 1]?.trim().startsWith('- ')) {
        currentArray = [];
        obj[key] = currentArray;
        currentKey = key;
      } else if (value === '') {
        // Object
        currentObject = {};
        obj[key] = currentObject;
        currentKey = key;
      } else {
        obj[key] = value;
        currentArray = null;
        currentObject = null;
      }
    }
  }

  return obj;
}

/**
 * Transform frontmatter to database format
 */
function transformToDBFormat(frontmatter, content, type) {
  const base = {
    slug: frontmatter.slug,
    title: frontmatter.title,
    content,
    language: frontmatter.language || 'en',
    published: frontmatter.published !== false,
    frontmatter_yaml: JSON.stringify(frontmatter),
  };

  // SEO
  if (frontmatter.seo) {
    base.seo = {
      metaTitle: frontmatter.seo.metaTitle || frontmatter.title,
      metaDescription: frontmatter.seo.metaDescription || frontmatter.excerpt,
      canonical: frontmatter.seo.canonical,
      hreflang: frontmatter.seo.hreflang || [],
    };
  }

  // Author
  if (frontmatter.author) {
    base.author = {
      name: frontmatter.author.name,
      credentials: frontmatter.author.credentials,
      bio: frontmatter.author.bio,
      profileUrl: frontmatter.author.profileUrl,
    };
  }

  // Reviewer
  if (frontmatter.reviewer) {
    base.reviewer = {
      name: frontmatter.reviewer.name,
      credentials: frontmatter.reviewer.credentials,
      reviewDate: frontmatter.reviewer.reviewDate,
    };
  }

  // Hero image
  if (frontmatter.heroImage) {
    base.hero_image = {
      src: frontmatter.heroImage.src,
      alt: frontmatter.heroImage.alt,
      caption: frontmatter.heroImage.caption,
      geoCoordinates: frontmatter.heroImage.geoCoordinates,
    };
  }

  // Next step
  if (frontmatter.nextStep) {
    base.next_step = {
      title: frontmatter.nextStep.title,
      slug: frontmatter.nextStep.slug,
      url: frontmatter.nextStep.url,
      cta: frontmatter.nextStep.cta,
      funnelStage: frontmatter.nextStep.funnelStage,
    };
  }

  // Type-specific fields
  if (type === 'qa') {
    base.excerpt = frontmatter.excerpt || frontmatter.summary;
    base.funnel_stage = frontmatter.funnelStage || 'TOFU';
    base.topic = frontmatter.topic;
    base.city = frontmatter.city || 'Costa del Sol';
    base.tags = frontmatter.tags || [];
    base.speakable_questions = frontmatter.speakableQuestions || [];
    base.speakable_answer = frontmatter.speakableAnswer;
    base.area_served = frontmatter.areaServed || [];
  } else if (type === 'blog') {
    base.excerpt = frontmatter.excerpt;
    base.category_key = frontmatter.category;
    base.status = frontmatter.published ? 'published' : 'draft';
    base.tags = frontmatter.tags || [];
    base.keywords = frontmatter.keywords || [];
    base.funnel_stage = frontmatter.funnelStage || 'TOFU';
  }

  return base;
}

/**
 * Sync a single file
 */
async function syncFile(filePath, type) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, content: markdownContent } = parseMarkdown(content);

    if (!frontmatter.slug) {
      console.warn(`⚠️  Skipping ${filePath}: No slug in frontmatter`);
      return { success: false, error: 'No slug' };
    }

    const dbData = transformToDBFormat(frontmatter, markdownContent, type);
    const table = type === 'qa' ? 'qa_articles' : 'blog_posts';

    // Upsert to database
    const { data, error } = await supabase
      .from(table)
      .upsert(dbData, {
        onConflict: 'slug,language',
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error syncing ${filePath}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Synced: ${frontmatter.slug} (${frontmatter.language})`);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Recursively find all markdown files
 */
function findMarkdownFiles(dir, type) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, type));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main sync function
 */
async function main() {
  const contentDir = process.argv[2] || './content';
  
  console.log('🚀 Starting content sync to Supabase...\n');

  // Sync QA articles
  const qaDir = path.join(contentDir, 'qa');
  const qaFiles = findMarkdownFiles(qaDir, 'qa');
  console.log(`📄 Found ${qaFiles.length} QA articles\n`);

  let qaSuccess = 0;
  let qaFailed = 0;

  for (const file of qaFiles) {
    const result = await syncFile(file, 'qa');
    if (result.success) qaSuccess++;
    else qaFailed++;
  }

  // Sync blog posts
  const blogDir = path.join(contentDir, 'blog');
  const blogFiles = findMarkdownFiles(blogDir, 'blog');
  console.log(`\n📄 Found ${blogFiles.length} blog posts\n`);

  let blogSuccess = 0;
  let blogFailed = 0;

  for (const file of blogFiles) {
    const result = await syncFile(file, 'blog');
    if (result.success) blogSuccess++;
    else blogFailed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Sync Summary:');
  console.log(`QA Articles: ${qaSuccess} succeeded, ${qaFailed} failed`);
  console.log(`Blog Posts: ${blogSuccess} succeeded, ${blogFailed} failed`);
  console.log('='.repeat(50));
}

main().catch(console.error);
