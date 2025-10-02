import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Trusted authority sources for link validation
const TRUSTED_SOURCES = {
  government: [
    'spain.info', 'exteriores.gob.es', 'madrid.org', 'cat.gencat.cat',
    'juntadeandalucia.es', 'gob.es'
  ],
  legal: [
    'notaries.es', 'registradores.org', 'colegiodeabogados.es',
    'cgae.es', 'notariado.org'
  ],
  financial: [
    'bde.es', 'cnmv.es', 'aeat.es', 'mineco.gob.es', 'bancodeespana.es'
  ],
  news: [
    'elpais.com', 'ft.com', 'reuters.com', 'bbc.co.uk', 'theguardian.com',
    'elmundo.es', 'abc.es', 'lavanguardia.com'
  ],
  industry: [
    'apce.es', 'colegioapi.es', 'rics.org', 'propertymark.co.uk',
    'fiabci.org', 'aipp.org.uk'
  ]
};

function calculateAuthorityScore(url: string): number {
  const domain = new URL(url).hostname.replace('www.', '');
  
  if (TRUSTED_SOURCES.government.some(d => domain.includes(d))) return 100;
  if (domain.endsWith('.gov') || domain.endsWith('.gov.es')) return 100;
  if (domain.endsWith('.edu') || domain.endsWith('.edu.es')) return 90;
  if (TRUSTED_SOURCES.legal.some(d => domain.includes(d))) return 95;
  if (TRUSTED_SOURCES.financial.some(d => domain.includes(d))) return 95;
  if (TRUSTED_SOURCES.news.some(d => domain.includes(d))) return 80;
  if (TRUSTED_SOURCES.industry.some(d => domain.includes(d))) return 75;
  
  return 0; // Reject unknown sources
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

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

    // Calculate target number of links (2-4 per 1000 words)
    const wordCount = countWords(content);
    const targetLinks = Math.min(4, Math.max(2, Math.floor(wordCount / 1000) * 2));

    console.log(`Generating ${targetLinks} external links for ${wordCount} words`);

    // Enhanced prompt for finding naturally linkable phrases inline
    const systemPrompt = `You are an expert content editor finding opportunities to add helpful external links that flow naturally within the text.

Your task: Find ${targetLinks} phrases already in the content that would benefit from external links to authoritative sources.

CRITICAL RULES:
1. ONLY use exact text that already exists in the article (2-5 words)
2. Find phrases that are naturally linkable: proper nouns, locations, statistics, concepts
3. Each link must point to high-authority sources (.gov, .edu, major publications, official organizations)
4. The anchor text should make sense as a clickable link in context
5. Avoid over-linking - space links naturally throughout the article
6. Authority score must be 80+

Return valid JSON only with your suggestions.`;

    const userPrompt = `Find ${targetLinks} opportunities to add external links in this article:

TITLE: ${topic || 'Spanish Real Estate'}
TOPIC: ${topic}

CONTENT:
${content}

TRUSTED SOURCES BY CATEGORY:
${JSON.stringify(TRUSTED_SOURCES, null, 2)}

TASK: Identify ${targetLinks} exact phrases from the content above that should become external links.

Return JSON in this exact format:
{
  "links": [
    {
      "anchorText": "exact phrase from content",
      "url": "https://authoritative-source.com",
      "reason": "Brief explanation of why this link adds value",
      "contextSentence": "The complete sentence where this phrase appears",
      "authorityScore": 85
    }
  ]
}

REQUIREMENTS:
- Anchor text must exist EXACTLY as written in the content
- URLs must be from trusted sources with authority score 80+
- Each link should feel natural and helpful to readers
- Spread links throughout the article (avoid clustering)`;

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
      // Extract JSON from markdown code blocks or object
      const jsonMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                        aiContent.match(/(\{[\s\S]*?\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      const parsed = JSON.parse(jsonStr);
      linkSuggestions = parsed.links || parsed;
      if (!Array.isArray(linkSuggestions)) {
        linkSuggestions = [linkSuggestions];
      }
    } catch (e) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Validate and store links
    const validatedLinks = [];
    for (const link of linkSuggestions) {
      try {
        const url = new URL(link.url);
        
        // Validate HTTPS
        if (url.protocol !== 'https:') {
          console.log(`Rejected ${link.url}: Not HTTPS`);
          continue;
        }

        // Calculate authority score
        const authorityScore = calculateAuthorityScore(link.url);
        if (authorityScore === 0) {
          console.log(`Rejected ${link.url}: Not in trusted sources`);
          continue;
        }

        // Find position in text
        const anchorPosition = content.indexOf(link.anchorText);
        if (anchorPosition === -1) {
          console.log(`Rejected ${link.url}: Anchor text not found in content`);
          continue;
        }

        // Format for preview (don't store in DB yet - will be stored after approval)
        validatedLinks.push({
          anchorText: link.anchorText,
          url: link.url,
          reason: link.reason,
          authorityScore: authorityScore,
          sentenceContext: link.contextSentence,
          position: anchorPosition
        });
      } catch (e) {
        console.error(`Error processing link ${link.url}:`, e);
        continue;
      }
    }

    console.log(`Successfully generated ${validatedLinks.length} external link suggestions`);

    return new Response(
      JSON.stringify({ 
        success: true,
        linksGenerated: validatedLinks.length,
        links: validatedLinks
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-external-links:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
