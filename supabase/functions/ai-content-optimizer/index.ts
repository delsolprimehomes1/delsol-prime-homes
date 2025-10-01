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
    const { content, funnelStage, topic, wordCount, title, excerpt } = await req.json();

    // Detect issues
    const issues = detectIssues(content, funnelStage, wordCount);
    
    if (issues.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No issues detected. Content is already optimized!" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Detected issues:", issues);

    // Get target word count range
    const ranges = {
      TOFU: [850, 1100],
      MOFU: [950, 1200],
      BOFU: [1200, 1500]
    };
    const [minWords, maxWords] = ranges[funnelStage];

    // Build optimization prompt based on issues
    const optimizationPrompt = buildOptimizationPrompt(
      content, 
      issues, 
      funnelStage, 
      topic, 
      wordCount,
      minWords,
      maxWords,
      title,
      excerpt
    );

    console.log("Calling Lovable AI for content optimization...");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert content optimizer for real estate blog posts on the Costa del Sol. 
Your job is to optimize content while maintaining factual accuracy, tone, and key information.
Always preserve all important details about properties, locations, prices, and regulations.
Output ONLY the optimized markdown content, no explanations or meta-commentary.`
          },
          {
            role: "user",
            content: optimizationPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const optimizedContent = data.choices[0].message.content;

    console.log("Content optimization complete");

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: optimizedContent,
        issuesFixed: issues,
        originalWordCount: wordCount,
        newWordCount: optimizedContent.trim().split(/\s+/).filter(Boolean).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-content-optimizer:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectIssues(content: string, funnelStage: string, wordCount: number): string[] {
  const issues: string[] = [];
  const ranges = {
    TOFU: [850, 1100],
    MOFU: [950, 1200],
    BOFU: [1200, 1500]
  };
  const [minWords, maxWords] = ranges[funnelStage];

  // Word count issues
  if (wordCount < minWords) {
    issues.push('word_count_below');
  } else if (wordCount > maxWords) {
    issues.push('word_count_above');
  }

  // Content structure issues
  if (!content.includes('## Quick Answer')) {
    issues.push('missing_quick_answer');
  }
  
  const h2Count = (content.match(/^## /gm) || []).length;
  if (h2Count < 3) {
    issues.push('insufficient_sections');
  }

  // SEO issues
  if (!content.includes('### Voice Search Q&A')) {
    issues.push('missing_voice_search');
  }

  return issues;
}

function buildOptimizationPrompt(
  content: string, 
  issues: string[], 
  funnelStage: string, 
  topic: string, 
  currentWordCount: number,
  minWords: number,
  maxWords: number,
  title: string,
  excerpt: string
): string {
  let prompt = `Optimize this ${funnelStage} blog post about "${topic}" for the Costa del Sol real estate market.\n\n`;
  
  prompt += `**Title:** ${title}\n`;
  prompt += `**Excerpt:** ${excerpt}\n\n`;
  prompt += `**Current Word Count:** ${currentWordCount} words\n`;
  prompt += `**Target Range:** ${minWords}-${maxWords} words\n\n`;
  
  prompt += `**Issues to Fix:**\n`;
  issues.forEach(issue => {
    switch (issue) {
      case 'word_count_below':
        prompt += `- Content is too short (${minWords - currentWordCount} words below minimum). Expand with relevant details, examples, and practical information.\n`;
        break;
      case 'word_count_above':
        prompt += `- Content is too long (${currentWordCount - maxWords} words above maximum). Condense while keeping all key information.\n`;
        break;
      case 'missing_quick_answer':
        prompt += `- Add a "## Quick Answer" section at the start with a 2-3 sentence direct answer.\n`;
        break;
      case 'insufficient_sections':
        prompt += `- Add more H2 sections to improve structure and readability.\n`;
        break;
      case 'missing_voice_search':
        prompt += `- Add a "### Voice Search Q&A" section with 3-5 common voice search questions and brief answers.\n`;
        break;
    }
  });

  prompt += `\n**Optimization Guidelines:**\n`;
  prompt += `- Maintain all factual information (prices, locations, regulations)\n`;
  prompt += `- Keep the same tone and writing style\n`;
  prompt += `- Preserve all important details\n`;
  prompt += `- Ensure SEO optimization with natural keyword usage\n`;
  prompt += `- Use markdown formatting (H2 ##, H3 ###, bold, lists)\n`;
  prompt += `- Focus on practical, actionable information\n\n`;

  prompt += `**Original Content:**\n\n${content}\n\n`;
  prompt += `**Output only the optimized markdown content:**`;

  return prompt;
}
