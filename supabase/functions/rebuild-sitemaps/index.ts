import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting sitemap rebuild...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch all published QA articles
    const { data: qaArticles, error: qaError } = await supabase
      .from('qa_articles')
      .select('slug, language, updated_at, ai_optimization_score, funnel_stage')
      .eq('published', true)
      .order('updated_at', { ascending: false });

    if (qaError) {
      console.error('Error fetching QA articles:', qaError);
      throw qaError;
    }

    // Fetch all published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, language, updated_at, funnel_stage')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (blogError) {
      console.error('Error fetching blog posts:', blogError);
      throw blogError;
    }

    console.log(`📊 Found ${qaArticles?.length || 0} QA articles and ${blogPosts?.length || 0} blog posts`);

    // Generate priority based on funnel stage and update recency
    const getPriority = (item: any) => {
      const baseScore = {
        'BOFU': 0.9,
        'MOFU': 0.8,
        'TOFU': 0.7
      }[item.funnel_stage] || 0.6;

      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const freshnessBoost = daysSinceUpdate <= 7 ? 0.1 : daysSinceUpdate <= 30 ? 0.05 : 0;
      
      return Math.min(baseScore + freshnessBoost, 1.0).toFixed(1);
    };

    const getChangeFreq = (item: any) => {
      if (item.funnel_stage === 'BOFU') return 'weekly';
      if (item.funnel_stage === 'MOFU') return 'weekly';
      return 'monthly';
    };

    // Generate QA sitemap XML
    const generateSitemap = (items: any[], type: 'qa' | 'blog') => {
      const urls = items.map(item => `
    <url>
      <loc>https://delsolprimehomes.com/${item.language}/${type}/${item.slug}</loc>
      <lastmod>${item.updated_at.split('T')[0]}</lastmod>
      <changefreq>${getChangeFreq(item)}</changefreq>
      <priority>${getPriority(item)}</priority>
    </url>`).join('');
      
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls}
</urlset>`;
    };

    const qaSitemap = generateSitemap(qaArticles || [], 'qa');
    const blogSitemap = generateSitemap(blogPosts || [], 'blog');

    // Generate sitemap index
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://delsolprimehomes.com/qa-sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://delsolprimehomes.com/blog-sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

    // Upload to Supabase Storage
    const uploadSitemap = async (filename: string, content: string) => {
      const { error } = await supabase.storage
        .from('article-visuals')
        .upload(`sitemaps/${filename}`, content, { 
          contentType: 'application/xml',
          upsert: true 
        });
      
      if (error) {
        console.error(`Error uploading ${filename}:`, error);
        throw error;
      }
      
      console.log(`✅ Uploaded ${filename}`);
    };

    await Promise.all([
      uploadSitemap('qa-sitemap.xml', qaSitemap),
      uploadSitemap('blog-sitemap.xml', blogSitemap),
      uploadSitemap('sitemap.xml', sitemapIndex)
    ]);

    console.log('🎉 Sitemap rebuild complete!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: new Date().toISOString(),
        counts: {
          qaArticles: qaArticles?.length || 0,
          blogPosts: blogPosts?.length || 0
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ Error rebuilding sitemaps:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
