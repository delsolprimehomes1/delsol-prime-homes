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
    const { batchSize = 10, startFrom = 0 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch articles without speakable_answer
    const { data: articles, error: fetchError } = await supabase
      .from('qa_articles')
      .select('id, title, content, topic, funnel_stage, language')
      .is('speakable_answer', null)
      .eq('published', true)
      .range(startFrom, startFrom + batchSize - 1)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No articles left to process',
          processed: 0,
          remaining: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing batch of ${articles.length} articles starting from ${startFrom}`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Process articles sequentially to avoid rate limits
    for (const article of articles) {
      try {
        const contentSnippet = article.content.slice(0, 2000);

        const systemPrompt = `You are a voice assistant content optimizer specializing in creating conversational, speakable answers for Costa del Sol real estate content.

Your task is to create a 40-60 word summary that:
- Answers the main question in natural, conversational language
- Is optimized for voice assistants (Alexa, Google Assistant, Siri)
- Uses simple, clear sentences
- Avoids jargon and complex terminology
- Sounds natural when spoken aloud
- Provides actionable, helpful information

Topic context: ${article.topic || 'Costa del Sol real estate'}
Funnel stage: ${article.funnel_stage || 'informational'}`;

        const userPrompt = `Read this article titled "${article.title}" and create a 40-60 word conversational summary suitable for voice assistants.

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
          console.error(`AI error for article ${article.id}:`, response.status, errorText);
          failureCount++;
          results.push({
            id: article.id,
            title: article.title,
            success: false,
            error: `AI generation failed: ${response.status}`
          });
          continue;
        }

        const data = await response.json();
        const speakableAnswer = data.choices[0].message.content.trim();
        const wordCount = speakableAnswer.split(/\s+/).length;

        // Update the article
        const { error: updateError } = await supabase
          .from('qa_articles')
          .update({
            speakable_answer: speakableAnswer,
            voice_search_ready: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Update error for article ${article.id}:`, updateError);
          failureCount++;
          results.push({
            id: article.id,
            title: article.title,
            success: false,
            error: updateError.message
          });
        } else {
          successCount++;
          results.push({
            id: article.id,
            title: article.title,
            success: true,
            wordCount,
            speakableAnswer: speakableAnswer.substring(0, 100) + '...'
          });
          console.log(`✅ Generated speakable answer for: ${article.title} (${wordCount} words)`);
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
        failureCount++;
        results.push({
          id: article.id,
          title: article.title,
          success: false,
          error: error.message
        });
      }
    }

    // Count remaining articles
    const { count: remainingCount } = await supabase
      .from('qa_articles')
      .select('*', { count: 'exact', head: true })
      .is('speakable_answer', null)
      .eq('published', true);

    console.log(`Batch complete: ${successCount} successful, ${failureCount} failed, ${remainingCount || 0} remaining`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: articles.length,
        successful: successCount,
        failed: failureCount,
        remaining: remainingCount || 0,
        results,
        nextStartFrom: startFrom + batchSize
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Batch processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
