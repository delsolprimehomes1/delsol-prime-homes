// API endpoint for AI-optimized sitemap - /api/sitemap-ai.xml

import { generateAISitemap } from '@/utils/ai-feed-generator';

export default async function handler() {
  try {
    const sitemapXML = await generateAISitemap();
    
    return new Response(sitemapXML, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
        'X-Robots-Tag': 'noindex',
        'X-Sitemap-Type': 'ai-optimized',
        'X-Content-Focus': 'citation-ready-articles'
      },
      status: 200
    });
  } catch (error) {
    console.error('AI Sitemap generation failed:', error);
    
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<!-- AI Sitemap generation failed: ${error instanceof Error ? error.message : 'Unknown error'} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: {
        'Content-Type': 'application/xml',
      },
      status: 500
    });
  }
}