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

    // Map common topics between blogs and QA articles
    const topicMapping: Record<string, string[]> = {
      'buying-process': ['buying', 'purchase', 'investment'],
      'property-types': ['villas', 'apartments', 'properties'],
      'locations': ['marbella', 'costa-del-sol', 'areas'],
      'legal': ['legal', 'taxes', 'regulations'],
      'investment': ['investment', 'roi', 'returns'],
      'lifestyle': ['lifestyle', 'amenities', 'living'],
    };

    const relatedTopics = topicMapping[topic] || [topic];
    console.log(`Looking for articles related to topics:`, relatedTopics);

    // Fetch related QA articles with topic matching
    const { data: relatedQAArticles } = await supabase
      .from('qa_articles')
      .select('id, slug, title, topic, funnel_stage, tags, excerpt, content')
      .eq('published', true)
      .neq('id', articleId)
      .limit(50);

    // Fetch related blog posts
    const { data: relatedBlogPosts } = await supabase
      .from('blog_posts')
      .select('id, slug, title, category_key, funnel_stage, tags, excerpt, content')
      .eq('published', true)
      .neq('id', articleId)
      .limit(50);

    // Filter and score articles based on relevance
    const scoredArticles = [
      ...(relatedQAArticles || []).map(a => {
        let score = 0;
        if (relatedTopics.includes(a.topic)) score += 50;
        const tagOverlap = (a.tags || []).filter((tag: string) => relatedTopics.includes(tag)).length;
        score += tagOverlap * 10;
        return { ...a, type: 'qa', topic: a.topic, relevanceScore: score };
      }),
      ...(relatedBlogPosts || []).map(a => {
        let score = 0;
        if (relatedTopics.includes(a.category_key)) score += 50;
        const tagOverlap = (a.tags || []).filter((tag: string) => relatedTopics.includes(tag)).length;
        score += tagOverlap * 10;
        return { ...a, type: 'blog', topic: a.category_key, relevanceScore: score };
      })
    ]
    .filter(a => a.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 30);

    console.log(`Found ${scoredArticles.length} relevant articles for linking`);

    const relatedArticles = scoredArticles;

    if (relatedArticles.length === 0) {
      console.log('No related articles found for linking');
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${relatedArticles.length} related articles for internal linking`);

    const systemPrompt = `You are an expert SEO content strategist for a Costa del Sol real estate website.

Analyze this article content and identify opportunities for internal linking to related articles.

CURRENT ARTICLE TOPIC: ${topic}
ARTICLE TYPE: ${articleType.toUpperCase()}

STRICT REQUIREMENTS:
1. Find 3-5 natural anchor text phrases that EXIST WORD-FOR-WORD in the article content
2. Only suggest links to articles with MATCHING or HIGHLY RELATED topics
3. Prioritize funnel progression:
   - TOFU articles should link to MOFU articles (deeper exploration)
   - MOFU articles should link to BOFU articles (decision-making)
   - BOFU articles can link to related TOFU/MOFU for context
4. Verify semantic relevance: the link must make sense in the context of the sentence
5. Each link needs a relevance score (0-100):
   - 90-100: Exact topic match, perfect context fit
   - 80-89: Related topic, strong context relevance
   - 70-79: Adjacent topic, good context fit
   - Below 70: Don't suggest

QUALITY STANDARDS:
- NO generic phrases like "click here" or "read more"
- Use descriptive anchor text that exists in the content
- Ensure geographic relevance (Costa del Sol focus)
- Balance link distribution (don't cluster all links in one section)

Return ONLY valid JSON.`;

    const userPrompt = `ARTICLE CONTENT:
${content.substring(0, 3000)}

AVAILABLE RELATED ARTICLES (sorted by relevance):
${relatedArticles.map(a => 
  `- [${a.type.toUpperCase()}] "${a.title}" (/${a.type === 'qa' ? 'qa' : 'blog'}/${a.slug})
    Topic: ${a.topic}
    Funnel Stage: ${a.funnel_stage || 'Unknown'}
    Relevance Score: ${a.relevanceScore}
    Excerpt: ${a.excerpt?.substring(0, 150) || 'No excerpt'}`
).join('\n')}

CRITICAL: All links must be TOPICALLY RELEVANT to "${topic}"

Find 3-5 exact phrases in the article that would naturally link to the most relevant articles.

TOPIC-SPECIFIC FOCUS:
- Match topic semantically (e.g., "buying" relates to "purchase", "investment")
- Consider funnel progression (awareness → consideration → decision)
- Verify the link adds value in its specific context

Return ONLY a JSON array of suggestions in this exact format:
[
  {
    "anchorText": "exact phrase from article",
    "targetArticleId": "article-uuid",
    "targetSlug": "article-slug",
    "targetTitle": "Article Title",
    "targetType": "qa",
    "reason": "Topic match: [topic]. Context: [why it fits]. Funnel: [stage progression]",
    "relevanceScore": 95,
    "contextSentence": "Full sentence containing the anchor text"
  }
]

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
