import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, articleTitle, articleContent, funnelStage, tags } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct context-aware prompt for visual analysis
    const contextPrompt = `Analyze this image for a Costa del Sol luxury property article titled "${articleTitle}".

Article Context:
- Funnel Stage: ${funnelStage}
- Tags: ${tags?.join(', ') || 'N/A'}
- Content Preview: ${articleContent?.substring(0, 300) || 'N/A'}...

Generate comprehensive metadata for AI/LLM understanding and accessibility:

1. **Alt Text** (50-125 chars): Concise, descriptive text for screen readers and image indexing
2. **Title Attribute** (100-150 chars): Detailed hover text that adds context
3. **Long Description** (200-300 chars): Comprehensive explanation for AI/LLM citation and understanding
4. **Keywords** (5-8 terms): Visual content tags for SEO and categorization
5. **Context Relevance** (100-150 chars): How this visual supports the article's message

Focus on:
- Real estate and property investment themes
- Costa del Sol, Marbella, luxury market context
- 2025 market conditions
- DelSol Prime Homes branding
- Accessibility compliance (WCAG 2.1)
- AI/LLM citability

Return ONLY valid JSON in this exact format:
{
  "altText": "string",
  "title": "string",
  "description": "string",
  "keywords": ["string"],
  "contextRelevance": "string"
}`;

    console.log('Analyzing visual content with AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: contextPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze visual content', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('No AI response received');
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from AI response
    let metadata;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                       aiResponse.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      metadata = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI Response:', aiResponse);
      return new Response(
        JSON.stringify({ error: 'Failed to parse metadata', aiResponse }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!metadata.altText || !metadata.title || !metadata.description) {
      console.error('Missing required metadata fields');
      return new Response(
        JSON.stringify({ error: 'Incomplete metadata generated', metadata }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Visual metadata generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        metadata: {
          altText: metadata.altText,
          title: metadata.title,
          description: metadata.description,
          keywords: metadata.keywords || [],
          contextRelevance: metadata.contextRelevance || ''
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-visual-content:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
