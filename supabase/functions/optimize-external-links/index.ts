import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { articleId, articleType } = await req.json();

    console.log(`Optimizing external links for ${articleType} article:`, articleId);

    // Fetch article
    const { data: article, error: articleError } = await supabase
      .from(articleType === 'blog' ? 'blog_posts' : 'qa_articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (articleError) throw articleError;

    // Fetch existing external links
    const { data: existingLinks, error: linksError } = await supabase
      .from('external_links')
      .select('*')
      .eq('article_id', articleId)
      .eq('article_type', articleType);

    if (linksError) throw linksError;

    // Prepare context for AI
    const context = {
      title: article.title,
      content: article.content.substring(0, 3000), // First 3000 chars
      topic: article.topic || article.category_key,
      funnel_stage: article.funnel_stage,
      existing_links: existingLinks.map(l => ({
        url: l.url,
        anchor: l.anchor_text,
        authority: l.authority_score,
        domain: l.domain
      }))
    };

    // Call Perplexity AI to analyze with real-time web search
    const aiPrompt = `You are an SEO expert with web search access. Analyze external links for this Spanish real estate article.

Article Title: ${context.title}
Topic: ${context.topic}
Funnel Stage: ${context.funnel_stage}

Existing External Links (${context.existing_links.length}):
${context.existing_links.map(l => `- [${l.anchor}](${l.url}) - Authority: ${l.authority}, Domain: ${l.domain}`).join('\n')}

Content Excerpt (first 3000 chars):
${context.content}

YOUR TASK - SEARCH THE WEB TO:

1. **VERIFY EXISTING LINKS**: Check if each URL is still live and authoritative
   - Search for the URL or topic to verify it's still accessible
   - Check if there are better, more recent alternatives from the same organization
   - Rate quality 0-100 (consider authority, recency, relevance)

2. **FIND BETTER ALTERNATIVES**: For links scoring <70
   - Search for more authoritative sources on the same topic
   - Prioritize 2024-2025 content from high-authority domains
   - Suggest specific replacement URLs

3. **IDENTIFY MISSING TOPICS**: Find content gaps needing external authority
   - Search for official sources on key topics mentioned
   - Focus on: regulations, statistics, legal requirements, market data

4. **CHECK DOMAIN DIVERSITY**: Flag if too many links to same domain

PRIORITY SOURCES TO SEARCH:
- Spanish Tax Agency (agenciatributaria.es)
- Property Registrars (registradores.org)
- Spanish Government (.gov.es, .gob.es)
- National Statistics (ine.es)
- Regional tourism (spain.info, andalucia.org)
- EU sources (europa.eu)
- Major news 2024-2025 (Financial Times, Reuters, El País)
- Professional bodies (notarios.org, arquitectos.org)

Return JSON:
{
  "link_analysis": [
    {
      "url": "existing_url",
      "quality_score": 85,
      "is_live": true,
      "keep": true,
      "reason": "High authority government source, still accessible",
      "better_alternative": null
    }
  ],
  "new_suggestions": [
    {
      "topic": "Spanish property tax rates 2025",
      "suggested_url": "https://agenciatributaria.es/...",
      "authority_score": 98,
      "year": 2025,
      "reason": "Official 2025 tax guide from Spanish Tax Agency",
      "anchor_text": "2025 property tax regulations"
    }
  ],
  "domain_diversity_issues": ["3 links to same-domain.com - reduce to 2"],
  "overall_health_score": 82
}`;

    const aiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: 'You are an SEO expert with web search access specializing in external link optimization for Spanish real estate. Search the web to verify links and find authoritative sources. Always return valid JSON.' },
          { role: 'user', content: aiPrompt }
        ],
        temperature: 0.2,
        search_recency_filter: 'year',
        return_related_questions: false,
        return_citations: true,
        search_domain_filter: ['gov.es', 'gob.es', 'agenciatributaria.es', 'registradores.org', 'europa.eu', 'ine.es', 'spain.info']
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    console.log('AI Analysis:', analysis);

    return new Response(JSON.stringify({
      article_id: articleId,
      article_type: articleType,
      article_title: article.title,
      analysis,
      existing_links_count: existingLinks.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Optimization error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
