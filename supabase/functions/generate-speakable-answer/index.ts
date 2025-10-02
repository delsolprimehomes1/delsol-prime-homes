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
    const { articleId, title, content, topic, funnelStage } = await req.json();

    if (!articleId || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Extract first 2000 characters of content for analysis
    const contentSnippet = content.slice(0, 2000);

    const systemPrompt = `You are a voice assistant content optimizer specializing in creating conversational, speakable answers for Costa del Sol real estate content.

Your task is to create a 40-60 word summary that:
- Answers the main question in natural, conversational language
- Is optimized for voice assistants (Alexa, Google Assistant, Siri)
- Uses simple, clear sentences
- Avoids jargon and complex terminology
- Sounds natural when spoken aloud
- Provides actionable, helpful information

Topic context: ${topic || 'Costa del Sol real estate'}
Funnel stage: ${funnelStage || 'informational'}`;

    const userPrompt = `Read this article titled "${title}" and create a 40-60 word conversational summary suitable for voice assistants.

Article content:
${contentSnippet}

Create a speakable answer that directly addresses the main question.`;

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
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    const speakableAnswer = data.choices[0].message.content.trim();

    // Validate word count (should be 40-60 words)
    const wordCount = speakableAnswer.split(/\s+/).length;
    
    if (wordCount < 30 || wordCount > 80) {
      console.warn(`Word count ${wordCount} outside optimal range for article ${articleId}`);
    }

    // Update the article in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('qa_articles')
      .update({
        speakable_answer: speakableAnswer,
        voice_search_ready: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', articleId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log(`Generated speakable answer for article ${articleId}: ${wordCount} words`);

    return new Response(
      JSON.stringify({
        success: true,
        articleId,
        speakableAnswer,
        wordCount,
        voiceSearchReady: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating speakable answer:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
