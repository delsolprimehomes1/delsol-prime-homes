import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { content, title } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Humanizing content for:', title);

    const prompt = `You are a professional content editor specializing in making real estate content more conversational and engaging while maintaining professionalism.

Your task is to humanize the following blog content by:
1. Making the tone more conversational and personal
2. Adding transition phrases and connecting words
3. Using "you" and "your" to directly address the reader
4. Including relatable examples and scenarios
5. Breaking up long paragraphs into digestible chunks
6. Adding emotional touches where appropriate
7. Maintaining all factual information and technical accuracy
8. Keeping the same structure and key points

Original content to humanize:
${content}

Please return the humanized version that feels like it was written by a knowledgeable real estate expert having a friendly conversation with their client.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content editor who specializes in making professional content more human, conversational, and engaging while maintaining accuracy and professionalism.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const humanizedContent = data.choices[0].message.content;

    console.log('Content humanized successfully');

    return new Response(JSON.stringify({ 
      success: true,
      humanizedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error humanizing content:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});