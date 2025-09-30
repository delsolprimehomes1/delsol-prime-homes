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
3. **Match Content Intent**: Match the exact intent and depth required for this article
4. **Localize Content**: Costa del Sol-specific locations, neighborhoods, market data
5. **Humanize**: Natural, conversational tone with local expertise and first-hand insights
6. **NO INTERNAL TERMINOLOGY**: NEVER mention funnel stages, TOFU, MOFU, BOFU, or any backend strategy terms in the content itself

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

**Content Characteristics:**

**LOCALIZATION & HUMANIZATION (CRITICAL):**
- **Micro-Local Details**: Use specific street names (e.g., "Calle Larios", "Paseo Marítimo"), neighborhoods (e.g., "Golden Mile", "Nueva Andalucía"), local landmarks
- **Seasonal Context**: Mention 2025 seasonal events, weather patterns, local festivals
- **Cultural Integration**: Naturally weave in Spanish terms with context (e.g., "chiringuitos (beachfront restaurants)", "paseo (evening stroll)")
- **Personal Expertise Signals**: Use phrases like "In my experience with Costa del Sol properties...", "I've noticed that clients...", "Local residents often tell me..."
- **Sensory Descriptions**: Paint vivid pictures - the smell of orange blossoms, sound of waves, sight of white villages
- **Local Personality**: Capture the laid-back Mediterranean lifestyle, the blend of traditional and modern, the cosmopolitan yet authentic atmosphere
- **First-Hand Insights**: Share specific observations about traffic patterns, best times to visit markets, hidden local spots
- **Authentic Voice**: Write as a knowledgeable local expert who lives and breathes Costa del Sol, not a distant copywriter

**WRITING STYLE ADAPTATION (Stage-Specific):**`;


    const userPrompt = `Expand this article to 800-1,200 words while maintaining quality:

**Title:** ${title}
**Topic:** ${topic}
**Location Focus:** ${locationFocus || 'Costa del Sol'}
**Target Audience:** ${targetAudience || 'International property buyers'}
**Tags:** ${tags?.join(', ') || 'N/A'}
**Content Approach:** ${getFunnelContext(stage)}

**Current Content (${content.split(/\s+/).length} words):**
${content}

**CRITICAL REQUIREMENTS:**
1. **Target Word Count**: 800-1,200 words (aim for 900-1,000 words)
2. **Stay On Topic**: Only expand on "${title}" - do not drift to other subjects
3. **Match Content Style**: Write according to the content characteristics above
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
15. **NO INTERNAL TERMS**: NEVER mention funnel, TOFU, MOFU, BOFU, or any backend terminology in the content

**Output Format:**
- Start with a "Quick Answer" section (30-50 words)
- Follow with expanded introduction (100-150 words)
- 3-5 main H2 sections with descriptive keyword-rich titles
- Each H2 section should be 150-250 words
- Include H3 subsections where needed
- Add "Voice Search Q&A" section with 2-3 questions
- End with actionable conclusion (50-100 words)

Return ONLY the enhanced markdown content in this exact structure, no explanations or meta-commentary about the enhancement process or internal classification.`;

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
      return `**INSPIRATIONAL STORYTELLER VOICE** - Discovery & Dream Phase

**Writing Style:**
- Paint lifestyle pictures that make readers dream and visualize themselves in Costa del Sol
- Use evocative, sensory language: "imagine waking up to...", "picture yourself strolling through..."
- Tell stories through locations: describe the experience of a morning coffee at Atarazanas Market, the feeling of a sunset walk in Marbella
- Build excitement and curiosity about the Costa del Sol lifestyle
- Keep tone warm, inviting, aspirational but accessible

**Content Focus:**
- **What/Where/Why Questions**: "What makes Málaga special?", "Where are the best beaches?", "Why do expats love Costa del Sol?"
- **Lifestyle Experiences**: Focus on daily life, culture, food, activities, community
- **Broad Introduction**: Overview of areas, general market trends, lifestyle benefits
- **Discovery Elements**: Hidden gems, local secrets, cultural insights
- **Emotional Connection**: Help readers fall in love with the location first

**Language Patterns:**
- "Discover...", "Experience...", "Imagine...", "Step into..."
- Rich sensory details: sounds, smells, sights, feelings
- Storytelling structure: beginning with a scene, building interest
- Conversational and friendly: "You'll find...", "Many expats discover..."
- Paint word pictures: "cobblestone streets lined with orange trees", "golden beaches stretching for miles"

**Target Length**: 800-1,000 words with comprehensive lifestyle introduction
**Voice Search**: Natural answers to "what", "where", "why" questions about Costa del Sol life`;
      
    case 'MOFU':
      return `**KNOWLEDGEABLE LOCAL ADVISOR VOICE** - Analysis & Comparison Phase

**Writing Style:**
- Write as a trusted advisor who has deep local market knowledge and helps people make informed decisions
- Use analytical but accessible language with specific data and comparisons
- Balance facts with insights: "While Marbella offers X, Nueva Andalucía provides Y..."
- Show expertise through detailed comparisons and nuanced understanding
- Maintain professional yet approachable tone of a helpful expert

**Content Focus:**
- **Comparison & Analysis**: "Marbella vs Estepona", "Best areas for investment", "Comparing property types"
- **Decision Support**: Pros/cons, detailed breakdowns, investment analysis
- **Specific Neighborhoods**: Deep dives into particular areas with data
- **Market Intelligence**: Pricing trends, rental yields, appreciation rates
- **Detailed Processes**: Buying procedures, legal considerations, practical steps

**Language Patterns:**
- "When comparing...", "Consider that...", "In my experience advising clients..."
- Data-driven: "Properties in this area average €X per m²...", "Based on 2025 market data..."
- Comparative structure: "On one hand... on the other hand...", "While X offers... Y provides..."
- Expert insights: "I've noticed that...", "Clients often find...", "Local market trends show..."
- Balanced analysis with specific examples from real neighborhoods

**Target Length**: 1,000-1,200 words with thorough analytical depth
**Voice Search**: Nuanced answers to "how", "which", "should I" questions with comparisons`;
      
    case 'BOFU':
      return `**PROFESSIONAL CONSULTANT VOICE** - Action & Decision Phase

**Writing Style:**
- Direct, confident, and action-oriented like a professional ready to help them proceed
- Clear step-by-step guidance with specific next actions
- Authoritative but warm: "Here's exactly what you need to do..."
- Remove uncertainty with precise information and clear processes
- Professional expertise with personal touch: "I'll guide you through..."

**Content Focus:**
- **Action Steps**: "How to book a viewing", "Next steps for buying", "Getting started with..."
- **Service Details**: Specific offerings, what's included, what to expect
- **Clear Processes**: Timeline, requirements, documentation, procedures
- **Immediate Value**: What happens next, how to proceed, who to contact
- **Practical Details**: Costs, timeframes, required documents, logistics

**Language Patterns:**
- "Here's how to...", "The first step is...", "You'll need to...", "I'll help you..."
- Action verbs: "Schedule", "Book", "Start", "Begin", "Secure"
- Clear instructions: numbered steps, bullet point checklists
- Remove barriers: "Simply contact us...", "The process is straightforward..."
- Confidence building: "With over X years experience...", "We specialize in..."
- Direct call-to-action language woven naturally throughout

**Target Length**: 800-1,000 words with actionable, specific details
**Voice Search**: Direct answers to "how do I", "where can I", "who can help" queries`;
      
    default:
      return 'Balanced informational content with practical insights and local expertise';
  }
}
