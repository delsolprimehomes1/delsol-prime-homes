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
    const { articleId, articleType, content, topic, language } = await req.json();
    
    if (!articleId || !articleType || !content || !language) {
      throw new Error('Missing required fields: articleId, articleType, content, language');
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate target number of links (2-4 per 1000 words)
    const wordCount = countWords(content);
    const targetLinks = Math.min(4, Math.max(2, Math.floor(wordCount / 1000) * 2));

    console.log(`Generating ${targetLinks} external links for ${wordCount} words`);

    const systemPrompt = `You are an expert SEO content researcher specializing in real estate and Costa del Sol region.
Your task is to find ${targetLinks} highly authoritative, recent external links that are TOPICALLY RELEVANT to the article subject.

ARTICLE LANGUAGE: ${language.toUpperCase()}
ARTICLE TOPIC: ${topic}

LANGUAGE MATCHING REQUIREMENTS:
- Prioritize sources in ${language.toUpperCase()} language when available
- For English: International sources (BBC, Reuters, official EU sites)
- For Spanish: Spanish national sources (El País, official .es government sites)
- For Dutch/German/French: Prefer EU sources and international English sources when native sources unavailable
- Official government sites (.gov, .gob.es, europa.eu) are acceptable in any language as they're authoritative

PRIORITY SOURCES (in order):
1. Government & Official Sites (.gov, .es official tourism, Spanish property registries)
2. Major News Organizations (BBC, Reuters, EL PAÍS, local Spanish news)
3. Educational Institutions (.edu, universities with real estate programs)
4. Established Real Estate Publications (specific to Spanish/Costa del Sol market)
5. Financial & Legal Advisory Sites (Spanish property law, taxation)
6. Tourism & Cultural Organizations (Costa del Sol specific)

STRICT QUALITY REQUIREMENTS:
- Must be TOPICALLY RELEVANT to: ${topic}
- Must be from 2023-2025 (prefer 2024-2025)
- Must be HTTPS
- Must be authoritative (no blogs, forums, or user-generated content)
- Must add factual value (statistics, regulations, market data, official guidance)
- Diverse domains (max 2 links from same domain)
- Geographic relevance to Costa del Sol when applicable

TOPIC VALIDATION:
- For "buying" topics: Link to mortgage info, legal requirements, buying process guides
- For "investment" topics: Link to ROI data, market trends, financial regulations
- For "location" topics: Link to area guides, demographics, local amenities
- For "legal" topics: Link to Spanish property law, tax regulations, official registries
- For "lifestyle" topics: Link to cultural attractions, climate data, expat resources

Return ONLY valid JSON.`;

    const userPrompt = `Article Language: ${language.toUpperCase()}
Article Topic: ${topic}
Article Type: ${articleType}

Content Excerpt (first 2000 characters):
${content.substring(0, 2000)}

CRITICAL: All links must be TOPICALLY RELEVANT to "${topic}"
LANGUAGE PRIORITY: Prefer ${language} sources when available, otherwise authoritative international sources

Find ${targetLinks} authoritative external links that:
1. Directly relate to the article's topic: ${topic}
2. Come from the priority sources listed (government, news, education)
3. Are recent (2023-2025, prefer 2024-2025)
4. Add genuine value with facts, data, or official guidance specific to ${topic}
5. Have anchor text that naturally fits in the article content
6. Are from diverse domains (max 2 per domain)
7. Include geographic relevance to Costa del Sol when applicable

TOPIC-SPECIFIC FOCUS:
- If topic is about buying/purchasing: Focus on legal requirements, mortgage info, buying process
- If topic is about investment: Focus on ROI data, market analysis, financial regulations
- If topic is about specific locations: Focus on area statistics, demographics, local regulations
- If topic is about legal matters: Focus on Spanish property law, tax regulations, official procedures
- If topic is about lifestyle: Focus on climate, culture, amenities, expat resources

Return ONLY a JSON array in this exact format:
[
  {
    "url": "https://example.com/page",
    "anchorText": "descriptive anchor text that exists in article",
    "contextSnippet": "the sentence or paragraph where this link would fit",
    "reasoning": "Topic relevance: [how it relates to ${topic}]. Authority: [why source is credible]. Value: [what factual info it adds]"
  }
]

Validate that each link's content ACTUALLY relates to ${topic} before suggesting it.`;

    // Call Perplexity AI with web search
    const aiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',  // Updated to current Perplexity AI model (Jan 2025)
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        search_recency_filter: 'year',
        return_related_questions: false,
        return_citations: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Perplexity AI error:', aiResponse.status, errorText);
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
        
        // Calculate combined score (authority 50%, freshness 40%, relevance 10%)
        // Increased freshness weight for Perplexity's real-time search
        const combinedScore = Math.round(
          (authorityScore * 0.5) + 
          (freshnessScore * 0.4) + 
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
