import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, articleType, content, topic } = await req.json();
    
    if (!articleId || !articleType || !content) {
      throw new Error('Missing required fields: articleId, articleType, content');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find related articles (same topic, different articles, different funnel stages)
    const { data: relatedQA } = await supabase
      .from('qa_articles')
      .select('id, title, slug, funnel_stage, topic, excerpt')
      .eq('topic', topic)
      .neq('id', articleId)
      .eq('published', true)
      .limit(10);

    const { data: relatedBlogs } = await supabase
      .from('blog_posts')
      .select('id, title, slug, category_key, excerpt')
      .eq('status', 'published')
      .neq('id', articleId)
      .limit(5);

    const relatedArticles = [
      ...(relatedQA || []).map(a => ({ ...a, type: 'qa' })),
      ...(relatedBlogs || []).map(a => ({ ...a, type: 'blog' }))
    ];

    if (relatedArticles.length === 0) {
      console.log('No related articles found for linking');
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${relatedArticles.length} related articles for internal linking`);

    // Prepare AI prompt for internal link suggestions
    const systemPrompt = `You are an expert at creating contextual internal links for SEO optimization.

LINKING STRATEGY:
1. Link to articles at different funnel stages (TOFU → MOFU → BOFU progression)
2. Create natural anchor text from existing content (3-8 words)
3. Prioritize high-relevance matches
4. Distribute links evenly throughout the content
5. Avoid linking in first or last paragraph

Return JSON array only, no other text.`;

    const userPrompt = `Current Article Content:
${content.substring(0, 3000)}

Available Related Articles:
${JSON.stringify(relatedArticles.map(a => ({
  id: a.id,
  title: a.title,
  type: a.type,
  slug: a.slug,
  funnel_stage: a.funnel_stage,
  excerpt: a.excerpt?.substring(0, 150)
})), null, 2)}

Task: Find 2-4 natural opportunities to link to these related articles.

For each link provide:
{
  "anchorText": "exact phrase from current article (3-8 words)",
  "targetArticleId": "uuid-of-target-article",
  "targetArticleType": "qa" or "blog",
  "targetTitle": "title of target article",
  "targetSlug": "slug-of-target-article",
  "context": "full sentence containing the anchor text",
  "relevanceScore": 1-100,
  "positionHint": "approximate paragraph number"
}

Return array of 2-4 internal link suggestions as JSON.`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let linkSuggestions;
    try {
      const jsonMatch = aiContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || 
                        aiContent.match(/(\[[\s\S]*?\])/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      linkSuggestions = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Validate and store internal links
    const validatedLinks = [];
    for (const link of linkSuggestions) {
      try {
        // Find position in text
        const anchorPosition = content.indexOf(link.anchorText);
        if (anchorPosition === -1) {
          console.log(`Rejected internal link: Anchor text "${link.anchorText}" not found in content`);
          continue;
        }

        // Store in database
        const { data: insertedLink, error } = await supabase
          .from('internal_links')
          .insert({
            source_article_id: articleId,
            source_article_type: articleType,
            target_article_id: link.targetArticleId,
            target_article_type: link.targetArticleType,
            anchor_text: link.anchorText,
            context_snippet: link.context,
            relevance_score: link.relevanceScore || 75,
            position_in_text: anchorPosition,
            verified: false,
          })
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          continue;
        }

        validatedLinks.push({
          ...insertedLink,
          targetTitle: link.targetTitle,
          targetSlug: link.targetSlug
        });
      } catch (e) {
        console.error(`Error processing internal link:`, e);
        continue;
      }
    }

    console.log(`Successfully generated ${validatedLinks.length} internal link suggestions`);

    return new Response(
      JSON.stringify({ 
        success: true,
        linksGenerated: validatedLinks.length,
        links: validatedLinks
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-internal-links:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
