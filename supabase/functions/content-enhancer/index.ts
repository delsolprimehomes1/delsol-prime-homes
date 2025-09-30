import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content, stage, topic, locationFocus, targetAudience, tags } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Enhancing ${stage} article: "${title}" (current: ${content.split(/\s+/).length} words)`);

    const systemPrompt = `You are an expert SEO content writer specializing in Costa del Sol luxury property market. Current year: 2025.

**Brand Context:**
- Brand: DelSol Prime Homes
- Logo: https://qvrvcvmoudxchipvzksh.supabase.co/storage/v1/object/public/article-visuals/DelSolPrimeHomes-Logo.png
- Voice: Professional, authoritative, helpful - real estate expertise for Costa del Sol property buyers
- Market: 2025 Costa del Sol luxury property market with current trends and data

**Your Task:** Expand content to meet 800-1,200 word minimum while optimizing for:

**SEO (Search Engine Optimization):**
- Natural keyword integration
- Semantic richness and related terms
- Clear heading hierarchy (H2, H3)
- Meta-worthy introductions

**AEO (Answer Engine Optimization):**
- Direct, concise answers upfront
- Structured question-answer format
- Featured snippet-ready content

**GEO (Generative Engine Optimization):**
- AI-citeable facts and data
- Clear attribution and expertise signals
- Contextual depth for LLM comprehension

**E-E-A-T (Experience, Expertise, Authoritativeness, Trust):**
- Local market expertise and insights
- Specific examples and data points (relevant to 2025)
- Professional tone with authority
- First-hand market knowledge

**Structure Requirements:**
- Clear H2 sections with descriptive titles
- Bullet points for scannable content
- Real examples and specific locations
- Data points and market insights (2025 context)
- Voice search-friendly natural language`;

    const userPrompt = `Expand this ${stage} funnel article to 800-1,200 words while maintaining quality:

**Title:** ${title}
**Topic:** ${topic}
**Location Focus:** ${locationFocus || 'Costa del Sol'}
**Target Audience:** ${targetAudience || 'International property buyers'}
**Tags:** ${tags?.join(', ') || 'N/A'}
**Funnel Stage Context:** ${getFunnelContext(stage)}

**Current Content:**
${content}

**Requirements:**
1. Expand to 800-1,200 words with substantial depth
2. Add specific Costa del Sol locations, neighborhoods, and market data
3. Include voice search-optimized Q&A sections
4. Add expert insights demonstrating local knowledge
5. Structure with clear H2/H3 headings
6. Include bullet points for scannability
7. Optimize for featured snippets with direct answers
8. Add contextual information for AI comprehension
9. Maintain professional, authoritative tone
10. Keep all existing factual information accurate

Return ONLY the enhanced markdown content, no explanations.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;
    const wordCount = enhancedContent.split(/\s+/).length;

    console.log(`Enhanced content: ${wordCount} words`);

    return new Response(
      JSON.stringify({ 
        enhancedContent,
        wordCount,
        meetsMinimum: wordCount >= 800
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Content enhancement error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Enhancement failed',
        enhancedContent: null
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function getFunnelContext(stage: string): string {
  switch (stage) {
    case 'TOFU':
      return 'Top of funnel - Educational, informational content for awareness stage. Focus on answering basic questions.';
    case 'MOFU':
      return 'Middle of funnel - Consideration stage content. Compare options, explain processes, build trust.';
    case 'BOFU':
      return 'Bottom of funnel - Decision stage. Specific services, calls-to-action, conversion-focused.';
    default:
      return 'General informational content';
  }
}
