#!/usr/bin/env node

/**
 * Auto-Generated Sitemap System for Phase 7
 * Generates comprehensive sitemaps with multilingual hreflang support
 * Updates on every content sync
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qvrvcvmoudxchipvzksh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cnZjdm1vdWR4Y2hpcHZ6a3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIyMzksImV4cCI6MjA2ODE4ODIzOX0.4EPE_-5OsZGC10Jeg90q4um8Rdsc1-hXoy5S_gPhl6Q';
const BASE_URL = 'https://delsolprimehomes.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Priority scoring based on content type and update frequency
const getPriority = (article) => {
  const { funnel_stage, last_updated, created_at } = article;
  
  // BOFU gets highest priority
  if (funnel_stage === 'BOFU') return 1.0;
  if (funnel_stage === 'MOFU') return 0.9;
  if (funnel_stage === 'TOFU') return 0.8;
  
  // Recently updated content gets higher priority
  const updateDate = new Date(last_updated || created_at);
  const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceUpdate < 7) return 0.9;
  if (daysSinceUpdate < 30) return 0.8;
  return 0.7;
};

// Change frequency based on funnel stage
const getChangeFreq = (article) => {
  const { funnel_stage } = article;
  
  if (funnel_stage === 'BOFU') return 'weekly';
  if (funnel_stage === 'MOFU') return 'monthly';
  return 'monthly';
};

// Generate multilingual hreflang links
const generateHreflangLinks = (slug, availableLanguages = ['en']) => {
  const languages = ['en', 'es', 'de', 'nl', 'fr', 'pl', 'sv', 'da', 'hu'];
  
  return languages
    .filter(lang => availableLanguages.includes(lang))
    .map(lang => {
      const url = lang === 'en' 
        ? `${BASE_URL}/qa/${slug}`
        : `${BASE_URL}/qa/${lang}/${slug}`;
      return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`;
    })
    .join('\n');
};

// Generate QA sitemap
const generateQASitemap = async () => {
  console.log('📄 Generating QA sitemap...');
  
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('slug, title, last_updated, created_at, funnel_stage, language')
    .eq('published', true)
    .order('last_updated', { ascending: false });

  if (error) {
    console.error('Error fetching QA articles:', error);
    return '';
  }

  const urlEntries = articles.map(article => {
    const lastmod = (article.last_updated || article.created_at).split('T')[0];
    const priority = getPriority(article);
    const changefreq = getChangeFreq(article);
    
    // Detect available languages (simplified - in production, query translations table)
    const availableLanguages = [article.language || 'en'];
    const hreflangLinks = generateHreflangLinks(article.slug, availableLanguages);
    
    return `  <url>
    <loc>${BASE_URL}/qa/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
};

// Generate blog sitemap
const generateBlogSitemap = async () => {
  console.log('📝 Generating blog sitemap...');
  
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug, title, updated_at, created_at, published_at, language')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return '';
  }

  const urlEntries = posts.map(post => {
    const lastmod = (post.updated_at || post.published_at || post.created_at).split('T')[0];
    const availableLanguages = [post.language || 'en'];
    const hreflangLinks = generateHreflangLinks(post.slug, availableLanguages);
    
    return `  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${hreflangLinks}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
};

// Generate main sitemap (static pages)
const generateMainSitemap = () => {
  console.log('🏠 Generating main sitemap...');
  
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/qa', priority: 0.9, changefreq: 'daily' },
    { path: '/blog', priority: 0.9, changefreq: 'daily' },
    { path: '/book-viewing', priority: 0.8, changefreq: 'monthly' },
  ];

  const urlEntries = staticPages.map(page => {
    const lastmod = new Date().toISOString().split('T')[0];
    
    return `  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

// Generate sitemap index
const generateSitemapIndex = () => {
  const currentDate = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/main-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/qa-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/blog-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
};

// Main execution
const main = async () => {
  console.log('🚀 Starting sitemap generation...');
  
  try {
    // Generate all sitemaps
    const qaSitemap = await generateQASitemap();
    const blogSitemap = await generateBlogSitemap();
    const mainSitemap = generateMainSitemap();
    const sitemapIndex = generateSitemapIndex();

    // Write to public folder
    const publicDir = path.join(__dirname, '..', 'public');
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex);
    fs.writeFileSync(path.join(publicDir, 'main-sitemap.xml'), mainSitemap);
    fs.writeFileSync(path.join(publicDir, 'qa-sitemap.xml'), qaSitemap);
    fs.writeFileSync(path.join(publicDir, 'blog-sitemap.xml'), blogSitemap);

    console.log('✅ Sitemaps generated successfully!');
    console.log('   - sitemap.xml (index)');
    console.log('   - main-sitemap.xml');
    console.log('   - qa-sitemap.xml');
    console.log('   - blog-sitemap.xml');
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateQASitemap, generateBlogSitemap, generateMainSitemap, generateSitemapIndex };
