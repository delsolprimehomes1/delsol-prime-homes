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

    // Enhanced prompt for finding naturally linkable internal phrases
    const systemPrompt = `You are an expert editor finding opportunities to add helpful internal links within article content.

LINKING STRATEGY:
1. Link to articles at different funnel stages (TOFU → MOFU → BOFU progression)
2. Use ONLY exact text that appears in the article (3-8 words)
3. The anchor text should clearly relate to the target article's topic
4. Links should add genuine value and help reader navigation
5. Avoid linking generic phrases - be specific
6. Space links naturally throughout the content

Return valid JSON only.`;

    const userPrompt = `CURRENT ARTICLE CONTENT:
${content.substring(0, 2500)}

AVAILABLE RELATED CONTENT:
${relatedArticles.map((a: any, i: number) => `
${i + 1}. ${a.title}
   Type: ${a.type?.toUpperCase() || 'BLOG'}
   URL Slug: ${a.slug}
   Topic: ${a.topic || 'General'}
   Summary: ${a.excerpt?.substring(0, 150) || 'Related content'}
`).join('\n')}

TASK: Find 2-4 exact phrases in the current article that would naturally link to the related content above.

Return JSON array in this exact format:
[
  {
    "anchorText": "exact phrase from current article",
    "targetArticleId": "${relatedArticles[0]?.id}",
    "targetSlug": "target-article-slug",
    "targetTitle": "Target Article Title",
    "targetType": "qa",
    "reason": "How this link helps the reader",
    "relevanceScore": 88,
    "contextSentence": "Full sentence containing the anchor text"
  }
]

REQUIREMENTS:
- Anchor text must exist EXACTLY in the current article
- Only suggest links with relevance score 80+
- Each link should feel natural and helpful`;

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
        // Find position in text (case-insensitive)
        const contentLower = content.toLowerCase();
        const anchorLower = link.anchorText.toLowerCase();
        const anchorPosition = contentLower.indexOf(anchorLower);
        
        if (anchorPosition === -1) {
          console.log(`Rejected internal link: "${link.anchorText}" not found in content (case-insensitive)`);
          continue;
        }

        // Extract actual text with original casing from content
        const exactText = content.substring(anchorPosition, anchorPosition + link.anchorText.length);

        // Format for preview (don't store in DB yet - will be stored after approval)
        validatedLinks.push({
          exactText: exactText, // Use exact casing from content
          anchorText: exactText, // Keep for backward compatibility
          targetArticleId: link.targetArticleId,
          targetSlug: link.targetSlug,
          targetTitle: link.targetTitle,
          targetType: link.targetType || link.targetArticleType,
          reason: link.reason,
          relevanceScore: link.relevanceScore || 75,
          sentenceContext: link.contextSentence || link.context,
          position: anchorPosition
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
