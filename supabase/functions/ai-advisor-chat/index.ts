import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationRequest {
  leadId?: string;
  message: string;
  stage: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { leadId, message, stage, firstName, lastName, email, phone }: ConversationRequest = await req.json();

    // Get the OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Define conversation stages and responses
    const getSystemPrompt = () => `
You are a friendly and knowledgeable AI advisor for Del Sol Prime Homes, specializing in luxury beachfront property in Costa Del Sol (Spain). Your goal is to guide foreign buyers (Dutch, German, French, etc.) through the home-buying process.

You must always:
- Be warm, helpful, and professional
- Keep answers under 2 sentences
- Redirect complex or personal questions to human agents ("I'll have our expert reach out")
- Guide the user toward completing the required information

NEVER give legal, tax, or immigration advice — instead say: "Let me connect you to our expert team to get you personalized support."

Always thank the user and close with reassurance and clear next steps.
`;

    const getStagePrompt = (currentStage: string) => {
      switch (currentStage) {
        case 'welcome':
          return 'Greet the user warmly and ask for their first name. Keep it conversational and friendly.';
        case 'first_name':
          return 'Thank them for their first name and ask for their last name.';
        case 'last_name':
          return 'Thank them and ask for their email address to send custom property matches.';
        case 'email':
          return 'Thank them and ask for their phone number so an expert can contact them.';
        case 'phone':
          return 'Thank them for completing the information and let them know an expert will reach out shortly. Be enthusiastic about helping them find their dream property.';
        default:
          return 'Help the user with their Costa Del Sol property questions while guiding them to complete their contact information.';
      }
    };

    // Prepare the conversation messages
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `${getSystemPrompt()}\n\nCurrent conversation stage: ${stage}\n${getStagePrompt(stage)}`
      },
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Determine next stage based on current stage
    let nextStage = stage;
    switch (stage) {
      case 'welcome':
        nextStage = 'first_name';
        break;
      case 'first_name':
        nextStage = 'last_name';
        break;
      case 'last_name':
        nextStage = 'email';
        break;
      case 'email':
        nextStage = 'phone';
        break;
      case 'phone':
        nextStage = 'completed';
        break;
    }

    // Update or create lead in database
    let updatedLead;
    if (leadId) {
      // Update existing lead
      const { data: lead, error } = await supabaseClient
        .from('leads')
        .update({
          stage: nextStage,
          conversation_log: supabaseClient.sql`conversation_log || ${JSON.stringify([
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
          ])}`,
          updated_at: new Date().toISOString(),
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(email && { email }),
          ...(phone && { phone }),
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      updatedLead = lead;
    } else {
      // Create new lead
      const { data: lead, error } = await supabaseClient
        .from('leads')
        .insert({
          first_name: firstName || '',
          last_name: lastName || '',
          email: email || '',
          phone: phone || '',
          stage: nextStage,
          conversation_log: [
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
          ]
        })
        .select()
        .single();

      if (error) throw error;
      updatedLead = lead;
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      nextStage,
      leadId: updatedLead.id,
      isComplete: nextStage === 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI advisor chat:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm sorry, I'm having trouble right now. Please try again in a moment or call us directly."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});