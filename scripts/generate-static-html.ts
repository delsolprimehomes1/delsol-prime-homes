#!/usr/bin/env tsx
/**
 * Generate Static HTML Snapshots for AI Crawler Discovery
 * 
 * This script generates fully-rendered HTML files for all QA and blog articles
 * with complete metadata, JSON-LD schemas, and content visible without JavaScript.
 * 
 * Output: /public/static/qa/ and /public/static/blog/
 * Usage: npm run build:static
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LANGUAGES = ['en', 'es', 'nl', 'fr', 'de', 'pl', 'sv', 'da'];

/**
 * Generate HTML template with full SEO metadata and content
 */
function generateHTML(article: any, type: 'qa' | 'blog', language: string): string {
  const baseUrl = 'https://delsolprimehomes.com';
  const canonicalUrl = type === 'qa' 
    ? `${baseUrl}/qa/${article.slug}`
    : `${baseUrl}/blog/${article.slug}`;

  // Generate hreflang links
  const hreflangLinks = LANGUAGES.map(lang => 
    `<link rel="alternate" hreflang="${lang}" href="${baseUrl}${lang === 'en' ? '' : `/${lang}`}/${type}/${article.slug}" />`
  ).join('\n    ');

  // Generate JSON-LD schema
  const schema = type === 'qa' ? generateQASchema(article, canonicalUrl) : generateBlogSchema(article, canonicalUrl);

  // Process content for display
  const processedContent = article.content
    .replace(/#{3,6}\s+(.+)/g, '<h3>$1</h3>')
    .replace(/#{2}\s+(.+)/g, '<h2>$1</h2>')
    .replace(/#{1}\s+(.+)/g, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.meta_title || article.title} | DelSol Prime Homes</title>
  <meta name="description" content="${article.meta_description || article.excerpt || ''}" />
  ${article.keywords ? `<meta name="keywords" content="${article.keywords.join(', ')}" />` : ''}
  <link rel="canonical" href="${canonicalUrl}" />
  
  ${hreflangLinks}
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="${type === 'qa' ? 'article' : 'article'}" />
  <meta property="og:title" content="${article.meta_title || article.title}" />
  <meta property="og:description" content="${article.meta_description || article.excerpt || ''}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${article.featured_image || article.image_url || `${baseUrl}/assets/DelSolPrimeHomes-Logo.png`}" />
  <meta property="og:locale" content="${language}_${language.toUpperCase()}" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${article.meta_title || article.title}" />
  <meta name="twitter:description" content="${article.meta_description || article.excerpt || ''}" />
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
  
  <!-- AI Crawler Meta Tags -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="googlebot" content="index, follow" />
  <meta name="bingbot" content="index, follow" />
  <meta name="ai-content-declaration" content="human-generated" />
  ${article.ai_optimization_score ? `<meta name="content-quality-score" content="${article.ai_optimization_score}" />` : ''}
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; color: #1a1a1a; }
    h2 { font-size: 2rem; margin-top: 2rem; margin-bottom: 1rem; color: #2a2a2a; }
    h3 { font-size: 1.5rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #3a3a3a; }
    .speakable { border-left: 4px solid #0066cc; padding-left: 1rem; margin: 1.5rem 0; }
    .metadata { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }
    .content { margin-top: 2rem; }
    .cta { background: #0066cc; color: white; padding: 1rem 2rem; text-decoration: none; display: inline-block; border-radius: 8px; margin-top: 2rem; }
  </style>
</head>
<body>
  <header>
    <h1 class="speakable" data-speakable="true">${article.title}</h1>
    <div class="metadata">
      ${article.published_at ? `<time datetime="${article.published_at}">Published: ${new Date(article.published_at).toLocaleDateString(language)}</time>` : ''}
      ${article.updated_at && article.updated_at !== article.published_at ? ` | Updated: ${new Date(article.updated_at).toLocaleDateString(language)}` : ''}
      ${article.author ? ` | By ${article.author}` : ''}
    </div>
  </header>
  
  <main class="content">
    ${article.excerpt ? `<div class="speakable" data-speakable="true"><p><strong>Quick Answer:</strong> ${article.excerpt}</p></div>` : ''}
    
    <p>${processedContent}</p>
    
    ${type === 'qa' ? '<a href="/book-viewing" class="cta">Book a Free Consultation</a>' : '<a href="/qa" class="cta">Explore More Articles</a>'}
  </main>
  
  <footer style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #eee; color: #666; font-size: 0.9rem;">
    <p>© ${new Date().getFullYear()} DelSol Prime Homes. All rights reserved.</p>
    <p><a href="${canonicalUrl}" style="color: #0066cc;">View interactive version</a></p>
  </footer>
  
  <!-- Redirect to React app if JavaScript enabled -->
  <script>
    window.location.href = '${canonicalUrl}';
  </script>
</body>
</html>`;
}

/**
 * Generate QA Article JSON-LD Schema
 */
function generateQASchema(article: any, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": article.title,
      "text": article.excerpt || article.title,
      "answerCount": 1,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": article.content.substring(0, 500),
        "author": {
          "@type": "Person",
          "name": article.author || "DelSol Prime Homes Expert"
        }
      }
    },
    "url": url,
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at || article.published_at || article.created_at,
    "inLanguage": article.language || "en"
  };
}

/**
 * Generate Blog Article JSON-LD Schema
 */
function generateBlogSchema(article: any, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.excerpt || article.meta_description,
    "image": article.featured_image,
    "author": {
      "@type": "Person",
      "name": article.author || "DelSol Prime Homes"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DelSol Prime Homes",
      "logo": {
        "@type": "ImageObject",
        "url": "https://delsolprimehomes.com/assets/DelSolPrimeHomes-Logo.png"
      }
    },
    "datePublished": article.published_at,
    "dateModified": article.updated_at || article.published_at,
    "url": url,
    "inLanguage": article.language || "en"
  };
}

/**
 * Generate static HTML files for all articles
 */
async function generateStaticFiles() {
  console.log('🚀 Starting static HTML generation...\n');

  const outputDir = path.join(process.cwd(), 'public', 'static');
  
  // Create output directories
  ['qa', 'blog'].forEach(type => {
    const dir = path.join(outputDir, type);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  let totalGenerated = 0;

  // Generate QA article HTML files
  console.log('📝 Generating QA articles...');
  for (const language of LANGUAGES) {
    const { data: qaArticles, error } = await supabase
      .from('qa_articles')
      .select('*')
      .eq('language', language)
      .eq('publish_status', 'published');

    if (error) {
      console.error(`❌ Error fetching QA articles for ${language}:`, error);
      continue;
    }

    if (qaArticles) {
      for (const article of qaArticles) {
        const html = generateHTML(article, 'qa', language);
        const filename = language === 'en' 
          ? `${article.slug}.html`
          : `${language}-${article.slug}.html`;
        const filepath = path.join(outputDir, 'qa', filename);
        
        fs.writeFileSync(filepath, html, 'utf-8');
        totalGenerated++;
      }
      console.log(`  ✅ ${language}: ${qaArticles.length} articles`);
    }
  }

  // Generate blog post HTML files
  console.log('\n📝 Generating blog posts...');
  for (const language of LANGUAGES) {
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('language', language)
      .eq('status', 'published');

    if (error) {
      console.error(`❌ Error fetching blog posts for ${language}:`, error);
      continue;
    }

    if (blogPosts) {
      for (const post of blogPosts) {
        const html = generateHTML(post, 'blog', language);
        const filename = language === 'en' 
          ? `${post.slug}.html`
          : `${language}-${post.slug}.html`;
        const filepath = path.join(outputDir, 'blog', filename);
        
        fs.writeFileSync(filepath, html, 'utf-8');
        totalGenerated++;
      }
      console.log(`  ✅ ${language}: ${blogPosts.length} posts`);
    }
  }

  console.log(`\n✨ Successfully generated ${totalGenerated} static HTML files`);
  console.log(`📁 Output directory: ${outputDir}`);
}

// Run the generator
generateStaticFiles().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
