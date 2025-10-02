import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisResult {
  suggestedTitle: string;
  metaDescription: string;
  keyTakeaways: string[];
  faqs: Array<{ question: string; answer: string }>;
  speakableSummary: string;
  topic: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  internalLinks: Array<{ anchor: string; suggestedSlug: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, title } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Initialize Supabase client for internal link suggestions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch existing content for internal link suggestions
    const { data: existingArticles } = await supabase
      .from('qa_articles')
      .select('slug, title, topic, funnel_stage')
      .eq('language', 'en')
      .eq('published', true)
      .limit(20);

    const { data: existingBlogs } = await supabase
      .from('blog_posts')
      .select('slug, title, category_key, funnel_stage')
      .eq('language', 'en')
      .eq('status', 'published')
      .limit(20);

    const existingContent = [
      ...(existingArticles || []).map(a => ({ slug: a.slug, title: a.title, type: 'qa', topic: a.topic, stage: a.funnel_stage })),
      ...(existingBlogs || []).map(b => ({ slug: b.slug, title: b.title, type: 'blog', topic: b.category_key, stage: b.funnel_stage }))
    ];

    const prompt = `Analyze this blog post content and extract structured data. The content is about luxury real estate in Costa del Sol, Spain.

CONTENT:
${content}

${title ? `DRAFT TITLE: ${title}` : ''}

EXISTING CONTENT FOR INTERNAL LINKS:
${JSON.stringify(existingContent, null, 2)}

Provide a JSON response with this exact structure:
{
  "suggestedTitle": "SEO-optimized title (max 60 characters, include location and main keyword)",
  "metaDescription": "Compelling meta description (max 155 characters)",
  "keyTakeaways": [
    "Main actionable point 1",
    "Main actionable point 2",
    "Main actionable point 3"
  ],
  "faqs": [
    {
      "question": "Natural language question about the topic?",
      "answer": "Concise answer (2-3 sentences)"
    }
  ],
  "speakableSummary": "40-60 word summary optimized for voice assistants",
  "topic": "investment|buying-process|lifestyle|market-intelligence|property-search",
  "funnelStage": "TOFU|MOFU|BOFU",
  "internalLinks": [
    {
      "anchor": "descriptive anchor text",
      "suggestedSlug": "matching-slug-from-existing-content"
    }
  ]
}

GUIDELINES:
- Title should be compelling and SEO-friendly
- Meta description should include a call-to-action
- Extract 3-5 key takeaways that are actionable
- Generate 3-5 FAQs that address common questions
- Speakable summary should be conversational and complete
- Classify topic based on content theme
- Funnel stage: TOFU (awareness), MOFU (consideration), BOFU (decision)
- Suggest 2-3 internal links that are contextually relevant from the existing content list

Return ONLY valid JSON, no additional text.`;

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
            role: 'system',
            content: 'You are an expert SEO content analyst specializing in luxury real estate. Extract structured data from blog content in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON response
    let analysis: AnalysisResult;
    try {
      // Remove markdown code blocks if present
      const jsonStr = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Failed to parse AI analysis result');
    }

    console.log('Analysis complete:', analysis);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-blog-content:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
