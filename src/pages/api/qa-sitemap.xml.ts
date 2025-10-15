// QA articles sitemap with multilingual support
import { supabase } from '@/integrations/supabase/client';
import { generateMultilingualSitemapXML } from '@/utils/multilingual-sitemap';

export default async function handler() {
  try {
    const { data: articles, error } = await supabase
      .from('qa_articles')
      .select('slug, last_updated, language')
      .order('last_updated', { ascending: false });

    if (error) throw error;

    const sitemapXML = generateMultilingualSitemapXML(articles || [], 'https://delsolprimehomes.com');
    
    return new Response(sitemapXML, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
      status: 200
    });
  } catch (error) {
    console.error('QA Sitemap generation failed:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      headers: {
        'Content-Type': 'application/xml',
      },
      status: 500
    });
  }
}
