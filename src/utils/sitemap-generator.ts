// Sitemap generation utilities for enhanced AI/LLM discovery

import { generateEnhancedSitemap, generateAIOptimizedRobotsTxt } from './github-optimization';
import { generateAIOptimizedContent } from './ai-optimization';

// Generate comprehensive sitemap with AI metadata
export const generateAISitemap = (articles: any[], baseUrl: string = 'https://delsolprimehomes.com'): string => {
  return generateEnhancedSitemap(articles, baseUrl);
};

// Generate robots.txt optimized for AI crawlers
export const generateRobotsTxt = (baseUrl: string = 'https://delsolprimehomes.com'): string => {
  return generateAIOptimizedRobotsTxt(baseUrl);
};

// Generate sitemap index for multiple sitemaps
export const generateSitemapIndex = (baseUrl: string = 'https://delsolprimehomes.com'): string => {
  const currentDate = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/qa-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/blog-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/ai-training-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
};

// Generate specialized AI training sitemap
export const generateAITrainingSitemap = (articles: any[], baseUrl: string = 'https://delsolprimehomes.com'): string => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const urlEntries = articles.map(article => {
    const aiOptimized = generateAIOptimizedContent(article);
    return `  <url>
    <loc>${baseUrl}/api/qa/${article.slug}.json</loc>
    <lastmod>${article.last_updated?.split('T')[0] || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <!-- AI Training Metadata -->
    <ai:format>json</ai:format>
    <ai:structured>true</ai:structured>
    <ai:citation_ready>true</ai:citation_ready>
    <ai:license>CC-BY-4.0</ai:license>
    <ai:quality>high</ai:quality>
    <ai:domain>real-estate-property</ai:domain>
    <ai:wordCount>${aiOptimized.wordCount}</ai:wordCount>
    <ai:language>${article.language || 'en'}</ai:language>
  </url>
  <url>
    <loc>${baseUrl}/content/qa/${article.slug}.md</loc>
    <lastmod>${article.last_updated?.split('T')[0] || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <ai:format>markdown</ai:format>
    <ai:frontmatter>true</ai:frontmatter>
    <ai:structured>true</ai:structured>
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:ai="https://delsolprimehomes.com/schemas/ai-optimization/1.0">
  
  <!-- AI Training Data Endpoints -->
  <url>
    <loc>${baseUrl}/api/qa/training-export.json</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <ai:dataset>complete</ai:dataset>
    <ai:format>json</ai:format>
    <ai:totalArticles>${articles.length}</ai:totalArticles>
  </url>
  
${urlEntries}
  
</urlset>`;
};

// Generate news sitemap for recent updates
export const generateNewsSitemap = (articles: any[], baseUrl: string = 'https://delsolprimehomes.com'): string => {
  const currentDate = new Date();
  const twoWeeksAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  // Filter articles updated in the last 2 weeks
  const recentArticles = articles.filter(article => {
    const updatedDate = new Date(article.last_updated || article.created_at);
    return updatedDate > twoWeeksAgo;
  });
  
  const newsEntries = recentArticles.map(article => `  <url>
    <loc>${baseUrl}/qa/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>DelSolPrimeHomes Property Guide</news:name>
        <news:language>${article.language || 'en'}</news:language>
      </news:publication>
      <news:publication_date>${article.last_updated || article.created_at}</news:publication_date>
      <news:title>${article.title}</news:title>
      <news:keywords>${(article.tags || []).join(', ')}</news:keywords>
    </news:news>
  </url>`).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
        
${newsEntries}
        
</urlset>`;
};

// Utility to write sitemaps to public folder (would need file system access)
export const writeSitemapsToPublic = (articles: any[], baseUrl: string = 'https://delsolprimehomes.com') => {
  const sitemaps = {
    'sitemap.xml': generateSitemapIndex(baseUrl),
    'qa-sitemap.xml': generateAISitemap(articles, baseUrl),
    'ai-training-sitemap.xml': generateAITrainingSitemap(articles, baseUrl),
    'news-sitemap.xml': generateNewsSitemap(articles, baseUrl),
    'robots.txt': generateRobotsTxt(baseUrl)
  };
  
  return sitemaps;
};