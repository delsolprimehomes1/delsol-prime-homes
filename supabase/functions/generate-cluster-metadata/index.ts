import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      imageUrl, 
      imagePrompt, 
      articleTitle, 
      articleContent, 
      funnelStage, 
      tags = [], 
      language = 'en' 
    } = await req.json();

    if (!imageUrl || !imagePrompt) {
      return new Response(JSON.stringify({ error: 'Image URL and prompt are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare content preview (first 400 characters)
    const contentPreview = articleContent ? articleContent.slice(0, 400) : '';

    const systemPrompt = `You are analyzing a generated image for a Costa del Sol luxury real estate content cluster.

Your task is to generate cluster-level metadata that groups multiple related articles together. This metadata should be:
- Broader than individual article titles
- Suitable for organizing a content hub
- Informed by both the visual content and the context

Return ONLY valid JSON with no markdown formatting or explanation.`;

    const userPrompt = `IMAGE GENERATION PROMPT USED:
"${imagePrompt}"

ARTICLE CONTEXT:
- Title: ${articleTitle}
- Content Preview: ${contentPreview}
- Funnel Stage: ${funnelStage}
- Tags: ${tags.join(', ')}
- Language: ${language}

TASK: Based on the IMAGE and the PROMPT used to create it, generate cluster-level metadata:

1. **Cluster Title** (50-80 chars): A compelling title that represents the overarching topic this image and content belong to. Should be broad enough to group multiple related articles.

2. **Cluster Description** (150-250 chars): A comprehensive description of what this content cluster covers, informed by the visual theme and article context.

3. **Topic** (20-40 chars): The main subject/category (e.g., "Property Investment", "Market Analysis", "Buyer Guides")

Requirements:
- Focus on Costa del Sol real estate context
- Consider the funnel stage (${funnelStage})
- Match the language: ${language}
- Base decisions on BOTH the image content AND the generation prompt
- Ensure cluster metadata is broader than individual article metadata

Return ONLY valid JSON:
{
  "clusterTitle": "string",
  "clusterDescription": "string",
  "topic": "string"
}`;

    console.log('Calling Lovable AI for cluster metadata generation...');

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
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to generate metadata with AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error('No content in AI response:', aiData);
      return new Response(JSON.stringify({ error: 'AI returned no content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse the JSON response
    let metadata;
    try {
      // Remove markdown code blocks if present
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      metadata = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedText);
      return new Response(JSON.stringify({ error: 'Failed to parse AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate response structure
    if (!metadata.clusterTitle || !metadata.clusterDescription || !metadata.topic) {
      console.error('Invalid metadata structure:', metadata);
      return new Response(JSON.stringify({ error: 'AI returned incomplete metadata' }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully generated cluster metadata');

    return new Response(
      JSON.stringify({
        success: true,
        metadata: {
          clusterTitle: metadata.clusterTitle,
          clusterDescription: metadata.clusterDescription,
          topic: metadata.topic,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-cluster-metadata:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
