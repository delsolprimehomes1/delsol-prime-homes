import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Priority source categories with enhanced scoring
const AUTHORITY_SOURCES = {
  government: {
    score: 100,
    domains: ['agenciatributaria.es', 'registradores.org', '.gob.es', '.gov', 'europa.eu', '.gov.es', '.gc.ca', '.gov.uk']
  },
  tourism: {
    score: 95,
    domains: ['spain.info', 'andalucia.org', 'costadelsol', 'turismo', 'malagaturismo.com']
  },
  professional: {
    score: 90,
    domains: ['notari', 'registra', 'colegio', 'rics.org', 'fiabci.org', 'arquitectos.org', 'cgpe.es']
  },
  news: {
    score: 85,
    domains: ['elpais.com', 'ft.com', 'reuters.com', 'bbc.', 'economist.com', 'elmundo.es', 'theguardian.com']
  },
  educational: {
    score: 88,
    domains: ['.edu', '.ac.', '.edu.es']
  },
  industry: {
    score: 80,
    domains: ['forbes.com', 'bloomberg.com', 'propertyweek.com']
  },
  regional: {
    score: 95,
    domains: ['junta', 'gencat', 'madrid.org', 'agencia', 'instituto']
  }
};

// Domain blacklist - avoid these
const BLACKLISTED_DOMAINS = [
  'wikipedia.org', 'facebook.com', 'twitter.com', 'instagram.com',
  'medium.com', 'blogspot.com', 'pinterest.com', 'youtube.com'
];

// Calculate authority score with enhanced logic
function calculateAuthorityScore(url: string): number {
  try {
    const domain = new URL(url).hostname.replace('www.', '').toLowerCase();
    
    // Check blacklist first
    if (BLACKLISTED_DOMAINS.some(blocked => domain.includes(blocked))) {
      return 0;
    }
    
    // Check priority sources
    for (const category of Object.values(AUTHORITY_SOURCES)) {
      if (category.domains.some(d => domain.includes(d))) {
        return category.score;
      }
    }
    
    // Default for unknown domains
    return 65;
  } catch {
    return 0;
  }
}

// Calculate freshness score (prefer recent content)
function calculateFreshnessScore(url: string, content: string): number {
  const currentYear = new Date().getFullYear();
  const yearMatch = content.match(/20\d{2}/g);
  
  if (yearMatch) {
    const years = yearMatch.map(y => parseInt(y));
    const mostRecent = Math.max(...years);
    const age = currentYear - mostRecent;
    
    if (age === 0) return 100;
    if (age === 1) return 90;
    if (age === 2) return 75;
    if (age <= 5) return 50;
    return 25;
  }
  
  return 50;
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

TASK: Identify ${targetLinks} exact phrases from the content above that should become external links.

PRIORITY SOURCES (but not limited to):
- Spanish government: .gov.es, .gob.es domains
- Tourism boards: spain.info, andalucia.org, malagaturismo.com
- Official stats: ine.es (National Statistics)
- Legal/notary: notaries.es, registradores.org
- News: Financial Times, Reuters, El País
- BUT ALSO search for other authoritative .gov, .edu, .org sites relevant to the content

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

    // Validate and filter links with enhanced logic
    const validatedLinks = [];
    const domainCount = new Map<string, number>();
    
    for (const link of linkSuggestions) {
      try {
        const url = new URL(link.url);
        const domain = url.hostname;
        
        // Validate HTTPS
        if (url.protocol !== 'https:') {
          console.log(`Rejected ${link.url}: Not HTTPS`);
          continue;
        }

        // Check domain diversity (max 2 links per domain)
        const currentCount = domainCount.get(domain) || 0;
        if (currentCount >= 2) {
          console.log(`Rejected ${link.url}: Domain limit (already ${currentCount} links to ${domain})`);
          continue;
        }

        // Calculate authority score
        const authorityScore = calculateAuthorityScore(link.url);
        if (authorityScore === 0) {
          console.log(`Rejected ${link.url}: Blacklisted domain`);
          continue;
        }
        if (authorityScore < 70) {
          console.log(`Rejected ${link.url}: Authority score too low (${authorityScore})`);
          continue;
        }

        // Calculate freshness score
        const freshnessScore = calculateFreshnessScore(link.url, content);

        // Find position in text (case-insensitive)
        const contentLower = content.toLowerCase();
        const anchorLower = link.anchorText.toLowerCase();
        const anchorPosition = contentLower.indexOf(anchorLower);
        
        if (anchorPosition === -1) {
          console.log(`Rejected "${link.anchorText}": Not found in content`);
          continue;
        }

        // Extract actual text with original casing from content
        const exactText = content.substring(anchorPosition, anchorPosition + link.anchorText.length);
        
        // Calculate combined score (authority 60%, freshness 30%, relevance 10%)
        const combinedScore = Math.round(
          (authorityScore * 0.6) + 
          (freshnessScore * 0.3) + 
          ((link.relevanceScore || 75) * 0.1)
        );
        
        // Format for preview
        validatedLinks.push({
          exactText,
          anchorText: exactText,
          url: link.url,
          reason: link.reason,
          authorityScore,
          freshnessScore,
          combinedScore,
          domain,
          sentenceContext: link.contextSentence,
          position: anchorPosition
        });

        // Track domain usage
        domainCount.set(domain, currentCount + 1);
      } catch (e) {
        console.error(`Error processing link ${link.url}:`, e);
        continue;
      }
    }

    // Sort by combined score and take top results
    validatedLinks.sort((a, b) => b.combinedScore - a.combinedScore);

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
