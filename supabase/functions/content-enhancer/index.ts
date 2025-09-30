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
- Voice: Professional, authoritative, helpful - real estate expertise for Costa del Sol property buyers
- Market: 2025 Costa del Sol luxury property market with current trends and data
- Location: Costa del Sol, Málaga Province, Spain

**CRITICAL REQUIREMENTS:**
1. **Word Count**: MUST produce 800-1,200 words minimum (aim for 900-1,000 words)
2. **Stay On Topic**: Expand ONLY the core topic - do not drift to unrelated subjects
3. **Maintain Funnel Stage**: Match the exact intent and depth of the ${stage} stage
4. **Localize Content**: Costa del Sol-specific locations, neighborhoods, market data
5. **Humanize**: Natural, conversational tone with local expertise and first-hand insights

**Your Task:** Expand content to 800-1,200 words while optimizing for:

**SEO (Search Engine Optimization):**
- Natural keyword integration throughout all sections
- Semantic richness with related terms and synonyms
- Clear H2/H3 heading hierarchy with target keywords
- Meta-worthy introduction (50-160 characters summary potential)
- Internal linking opportunities (mention related topics)
- Long-tail keyword phrases in subheadings

**AEO (Answer Engine Optimization):**
- Direct answer in first 2-3 sentences (featured snippet ready)
- Question-answer format sections
- "Quick Answer" box at the top (30-50 words)
- Conversational natural language
- Voice search friendly phrasing
- "People also ask" style subsections

**GEO (Generative Engine Optimization):**
- AI-citeable facts with specific data points
- Clear attribution and expertise signals
- Structured information hierarchy
- Contextual depth for LLM comprehension
- Quotable statistics and insights
- Definitive statements that AI can cite

**E-E-A-T (Experience, Expertise, Authoritativeness, Trust):**
- Local market expertise and first-hand insights
- Specific 2025 examples and current data points
- Professional authoritative tone
- Real neighborhood names and locations
- Price ranges and market trends
- Expert recommendations
- Trust signals (years of experience, local knowledge)

**JSON-LD & Speakable Optimization:**
- Structure content for Article schema markup
- Create FAQ-ready Q&A sections
- Include speakable content blocks (2-3 sentences)
- HowTo sections where applicable
- Breadcrumb-friendly navigation hints
- Location entity mentions for LocalBusiness schema

**Structure Requirements:**
- **Introduction**: Direct answer + context (100-150 words)
- **H2 Sections**: 3-5 main sections with descriptive titles including keywords
- **H3 Subsections**: Break down complex topics
- **Bullet Points**: Scannable lists for key information
- **Real Examples**: Specific Costa del Sol locations, neighborhoods, properties
- **Data Points**: 2025 market insights, prices, statistics
- **Voice Search Q&A**: 2-3 conversational questions with natural answers
- **Conclusion**: Actionable next steps (50-100 words)

**Funnel Stage Requirements:**`;


    const userPrompt = `Expand this ${stage} funnel article to 800-1,200 words while maintaining quality:

**Title:** ${title}
**Topic:** ${topic}
**Location Focus:** ${locationFocus || 'Costa del Sol'}
**Target Audience:** ${targetAudience || 'International property buyers'}
**Tags:** ${tags?.join(', ') || 'N/A'}
**Funnel Stage Context:** ${getFunnelContext(stage)}

**Current Content (${content.split(/\s+/).length} words):**
${content}

**CRITICAL REQUIREMENTS:**
1. **Target Word Count**: 800-1,200 words (aim for 900-1,000 words)
2. **Stay On Topic**: Only expand on "${title}" - do not drift to other subjects
3. **Match Funnel Stage**: Write in ${stage} style (see stage requirements above)
4. **Costa del Sol Specific**: Add real locations, neighborhoods, prices, market data for 2025
5. **Voice Search Q&A**: Include 2-3 conversational Q&A sections with natural language
6. **Expert Insights**: Demonstrate local market knowledge and first-hand experience
7. **Heading Structure**: Use H2 for main sections, H3 for subsections (with keywords)
8. **Scannable Format**: Include bullet points, numbered lists, short paragraphs
9. **Featured Snippet Ready**: Start with direct 2-3 sentence answer to main question
10. **AI-Citeable**: Include specific data points, statistics, and quotable insights
11. **Speakable Content**: Create 2-3 sentence blocks perfect for voice assistants
12. **Schema Markup Ready**: Structure for FAQ, HowTo, Article JSON-LD
13. **E-E-A-T Signals**: Show expertise, experience, authority, and trustworthiness
14. **Keep Facts Accurate**: Maintain all existing factual information

**Output Format:**
- Start with a "Quick Answer" section (30-50 words)
- Follow with expanded introduction (100-150 words)
- 3-5 main H2 sections with descriptive keyword-rich titles
- Each H2 section should be 150-250 words
- Include H3 subsections where needed
- Add "Voice Search Q&A" section with 2-3 questions
- End with actionable conclusion (50-100 words)

Return ONLY the enhanced markdown content in this exact structure, no explanations or meta-commentary.`;

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
      return `Top of Funnel (Awareness Stage):
- **Goal**: Educate and inform potential buyers who are just starting their research
- **Content Style**: Educational, approachable, foundational knowledge
- **Focus**: "What is...", "How does...", "Why should I...", "Understanding..."
- **Tone**: Friendly expert guiding newcomers
- **Keywords**: Broad, general terms (e.g., "Costa del Sol property", "buying in Spain")
- **Structure**: Simple explanations, overviews, introductory concepts
- **Examples**: General market overviews, location guides, basic process explanations
- **CTAs**: Soft (e.g., "Learn more", "Explore options", "Read our guide")
- **Depth**: Surface level with comprehensive coverage of basics
- **Voice Search**: Answer "what", "where", "when" questions conversationally`;
      
    case 'MOFU':
      return `Middle of Funnel (Consideration Stage):
- **Goal**: Help buyers evaluate options and make informed decisions
- **Content Style**: Comparative, analytical, detailed guidance
- **Focus**: "Compare...", "What to consider...", "Best options for...", "How to choose..."
- **Tone**: Trusted advisor helping with decision-making
- **Keywords**: Specific comparisons (e.g., "Marbella vs Estepona", "villa vs apartment")
- **Structure**: Comparison tables, pros/cons lists, detailed breakdowns
- **Examples**: Neighborhood comparisons, process deep-dives, cost analyses
- **CTAs**: Medium engagement (e.g., "Compare properties", "Get personalized advice", "Schedule consultation")
- **Depth**: Detailed analysis with multiple perspectives
- **Voice Search**: Answer "how", "which", "should I" questions with nuanced responses`;
      
    case 'BOFU':
      return `Bottom of Funnel (Decision Stage):
- **Goal**: Convert researched buyers into clients ready to take action
- **Content Style**: Action-oriented, service-specific, conversion-focused
- **Focus**: "How to buy...", "Get started with...", "Our services for...", "Contact us to..."
- **Tone**: Professional partner ready to execute
- **Keywords**: Action-oriented (e.g., "buy villa Marbella", "property viewing service", "legal assistance")
- **Structure**: Step-by-step guides, service descriptions, success stories, pricing
- **Examples**: Specific services, client testimonials, detailed process walkthroughs
- **CTAs**: Strong direct (e.g., "Book viewing", "Contact our team", "Get started today", "Request consultation")
- **Depth**: Comprehensive implementation details with clear next steps
- **Voice Search**: Answer "how do I", "where can I", "who can help" with specific actionable responses`;
      
    default:
      return 'General informational content with balanced approach';
  }
}
