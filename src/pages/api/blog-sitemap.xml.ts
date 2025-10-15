// Blog posts sitemap
import { supabase } from '@/integrations/supabase/client';

export default async function handler() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const baseUrl = 'https://delsolprimehomes.com';
    const urlEntries = (posts || []).map(post => `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updated_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
    
    return new Response(sitemapXML, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
      status: 200
    });
  } catch (error) {
    console.error('Blog Sitemap generation failed:', error);
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
