import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, title, excerpt, speakableAnswer } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const systemPrompt = `You are an AI optimization expert. Create ultra-concise 160-character summaries that:
- Answer the main question IMMEDIATELY (first 5 words)
- Include key numerical data if available
- Use active voice and present tense
- Optimize for AI extraction and citation
- Stay EXACTLY at 150-160 characters

Example input: "How much does it cost to buy property in Spain?"
Example output: "Spain property costs: 10-15% extra fees (taxes, notary, registry). Total budget: €250k+ for coastal villas. Non-residents welcome."`;

    const userPrompt = `Title: ${title}
Excerpt: ${excerpt}
Speakable: ${speakableAnswer || 'N/A'}

Create a 150-160 character summary optimized for AI citation.`;

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
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    let aiSummary = data.choices[0].message.content.trim();
    
    // Enforce 160 char limit
    if (aiSummary.length > 160) {
      aiSummary = aiSummary.substring(0, 157) + '...';
    }

    // Update meta description in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current SEO data
    const { data: currentArticle, error: fetchError } = await supabase
      .from('qa_articles')
      .select('seo')
      .eq('id', articleId)
      .single();

    if (fetchError) throw fetchError;

    // Update with new meta description
    const updatedSeo = {
      ...(currentArticle?.seo || {}),
      metaDescription: aiSummary
    };

    const { error: updateError } = await supabase
      .from('qa_articles')
      .update({
        seo: updatedSeo,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        articleId,
        aiSummary,
        characterCount: aiSummary.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating 160-char summary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
