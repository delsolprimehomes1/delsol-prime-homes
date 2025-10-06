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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
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

    // Call AI to analyze and suggest improvements
    const aiPrompt = `You are an SEO expert analyzing external links for a real estate article.

Article Title: ${context.title}
Topic: ${context.topic}
Funnel Stage: ${context.funnel_stage}

Existing External Links:
${context.existing_links.map(l => `- [${l.anchor}](${l.url}) - Authority: ${l.authority}, Domain: ${l.domain}`).join('\n')}

Content Excerpt:
${context.content}

Analyze the existing external links and provide:
1. **Quality Assessment**: Rate each link's relevance and authority (0-100)
2. **Improvement Suggestions**: For low-quality links (<70), suggest better alternatives
3. **Missing Links**: Identify topics that need external authority references
4. **Domain Diversity**: Flag if too many links point to the same domain

Priority authoritative sources:
- Government/Official sites (.gov, .gob.es, agenciatributaria.es, registradores.org)
- Regional tourism (spain.info, andalucia.org)
- Professional bodies (notary associations, real estate regulatory)
- Quality news (Financial Times, Reuters, El País)
- Educational institutions

Return JSON:
{
  "link_analysis": [
    {
      "url": "existing_url",
      "quality_score": 85,
      "keep": true,
      "reason": "High authority government source",
      "suggestion": null
    }
  ],
  "new_suggestions": [
    {
      "topic": "Spanish property tax",
      "suggested_url": "https://agenciatributaria.es/...",
      "authority_score": 95,
      "reason": "Official government tax information",
      "anchor_text": "Spanish Tax Agency guidelines"
    }
  ],
  "domain_diversity_issues": ["Too many links to domain.com"],
  "overall_health_score": 75
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an SEO expert specializing in external link optimization. Always return valid JSON.' },
          { role: 'user', content: aiPrompt }
        ],
        response_format: { type: "json_object" }
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
