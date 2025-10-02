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

    // Prepare AI prompt
    const systemPrompt = `You are an expert at identifying opportunities to insert authoritative external links into real estate content.

TRUSTED SOURCES (prioritize these):
- Government: spain.info, exteriores.gob.es, madrid.org, gob.es
- Legal: notaries.es, registradores.org, colegiodeabogados.es
- Financial: bde.es, cnmv.es, aeat.es, bancodeespana.es
- News: elpais.com, ft.com, reuters.com, bbc.co.uk, theguardian.com
- Industry: apce.es, colegioapi.es, rics.org

RULES:
1. Only suggest links to the trusted sources above
2. Link to HTTPS URLs only
3. Choose anchor text that naturally exists in the article (2-5 words)
4. Provide the full sentence containing the anchor text as context
5. Each link must be highly relevant to the surrounding content
6. Avoid linking in headings, first paragraph, or last paragraph
7. Space links at least 100 words apart

Return JSON array only, no other text.`;

    const userPrompt = `Article topic: ${topic || 'Spanish property market'}

Article content:
${content}

Task: Identify exactly ${targetLinks} opportunities to insert external links to authoritative sources.

For each link provide:
{
  "anchorText": "exact phrase from article (2-5 words)",
  "url": "https://full-url-to-trusted-source",
  "context": "full sentence containing the anchor text",
  "relevanceScore": 1-100,
  "positionHint": "approximate character position or paragraph number"
}

Return array of ${targetLinks} link suggestions as JSON.`;

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
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || 
                        aiContent.match(/(\[[\s\S]*?\])/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      linkSuggestions = JSON.parse(jsonStr);
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

        // Store in database
        const { data: insertedLink, error } = await supabase
          .from('external_links')
          .insert({
            article_id: articleId,
            article_type: articleType,
            url: link.url,
            anchor_text: link.anchorText,
            context_snippet: link.context,
            authority_score: authorityScore,
            relevance_score: link.relevanceScore || 75,
            ai_confidence: 0.85,
            position_in_text: anchorPosition,
            verified: false,
          })
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          continue;
        }

        validatedLinks.push(insertedLink);
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
