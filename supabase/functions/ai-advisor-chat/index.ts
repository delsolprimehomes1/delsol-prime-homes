import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ConversationRequest {
  leadId?: string;
  message: string;
  stage: string;
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

const generateAIResponse = async (message: string, stage: string, userData: any) => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const systemPrompt = `You are a friendly and knowledgeable AI advisor for Del Sol Prime Homes, specializing in luxury beachfront property in Costa Del Sol, Spain. Your goal is to guide foreign buyers through the home-buying process.

Current stage: ${stage}
User data collected: ${JSON.stringify(userData)}

Guidelines:
- Be warm, helpful, and professional
- Keep responses under 2 sentences
- For complex questions, say "I'll connect you to our expert team"
- Guide users through data collection: first name, last name, email, phone
- Never give legal, tax, or immigration advice
- Always be closing - guide toward completion

Conversation stages:
- welcome: Greet and ask for first name
- first_name: Ask for last name
- last_name: Ask for email
- email: Ask for phone number
- phone: Complete and offer next steps
- completed: Provide final CTAs`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return "I'm having a connection issue. Let me connect you with our team who can help you immediately!";
  }
};

const determineNextStage = (currentStage: string, userData: any): string => {
  switch (currentStage) {
    case 'welcome':
      return userData.firstName ? 'first_name' : 'welcome';
    case 'first_name':
      return userData.lastName ? 'last_name' : 'first_name';
    case 'last_name':
      return userData.email ? 'email' : 'last_name';
    case 'email':
      return userData.phone ? 'phone' : 'email';
    case 'phone':
      return 'completed';
    default:
      return 'welcome';
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, message, stage, userData = {} }: ConversationRequest = await req.json();
    
    console.log('Received request:', { leadId, message, stage, userData });

    // Generate AI response
    const aiResponse = await generateAIResponse(message, stage, userData);
    
    // Determine next stage
    const nextStage = determineNextStage(stage, userData);
    
    // Update or create lead in database
    let updatedLeadId = leadId;
    
    if (leadId) {
      // Update existing lead
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          stage: nextStage,
          conversation_log: supabase.raw(`conversation_log || ?::jsonb`, [
            JSON.stringify([
              { role: 'user', message, timestamp: new Date().toISOString() },
              { role: 'assistant', message: aiResponse, timestamp: new Date().toISOString() }
            ])
          ]),
          ...(userData.firstName && { first_name: userData.firstName }),
          ...(userData.lastName && { last_name: userData.lastName }),
          ...(userData.email && { email: userData.email }),
          ...(userData.phone && { phone: userData.phone }),
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);
      
      if (updateError) {
        console.error('Update lead error:', updateError);
      }
    } else {
      // Create new lead
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          stage: nextStage,
          conversation_log: [
            { role: 'user', message, timestamp: new Date().toISOString() },
            { role: 'assistant', message: aiResponse, timestamp: new Date().toISOString() }
          ]
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Insert lead error:', insertError);
      } else {
        updatedLeadId = newLead?.id;
      }
    }

    // If conversation is completed, trigger webhook (optional)
    if (nextStage === 'completed' && userData.firstName && userData.lastName && userData.email && userData.phone) {
      console.log('Lead conversion completed:', userData);
      // Here you could add webhook call to external system
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      nextStage,
      leadId: updatedLeadId,
      isCompleted: nextStage === 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-advisor-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      response: "I'm experiencing some technical difficulties. Let me connect you with our team right away!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});