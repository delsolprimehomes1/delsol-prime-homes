import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting external link health monitoring...');

    // Fetch all external links
    const { data: links, error: fetchError } = await supabase
      .from('external_links')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    const results = {
      total: links.length,
      healthy: 0,
      broken: 0,
      redirect: 0,
      timeout: 0,
      ssl_error: 0,
      ai_validated: 0,
      needs_replacement: 0,
      details: [] as any[]
    };

    // AI-powered validation for broken/questionable links (if Perplexity is available)
    const aiValidation = async (link: any, httpStatus: string) => {
      if (!perplexityApiKey || httpStatus === 'healthy') return null;

      try {
        console.log(`AI validating: ${link.url}`);
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              { 
                role: 'system', 
                content: 'You are a link quality expert. Search the web to verify if a URL is accessible and if there are better alternatives. Return JSON only.' 
              },
              { 
                role: 'user', 
                content: `Check this external link for a Spanish real estate article:

URL: ${link.url}
Anchor Text: ${link.anchor_text}
Current Status: ${httpStatus}

SEARCH THE WEB TO:
1. Verify if this URL is still accessible (try to access it)
2. Check if there's a better, more recent alternative from the same organization
3. Rate the link quality 0-100

Return JSON:
{
  "is_accessible": true/false,
  "quality_score": 75,
  "needs_replacement": false,
  "better_alternative": "https://...",
  "reason": "Brief explanation"
}`
              }
            ],
            temperature: 0.2,
            search_recency_filter: 'year',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0].message.content;
          const analysis = JSON.parse(content);
          results.ai_validated++;
          if (analysis.needs_replacement) results.needs_replacement++;
          return analysis;
        }
      } catch (e) {
        console.error('AI validation error:', e);
      }
      return null;
    };

    // Check each link
    for (const link of links) {
      try {
        console.log(`Checking: ${link.url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(link.url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkHealthBot/1.0)'
          }
        });

        clearTimeout(timeoutId);

        // Extract domain
        const urlObj = new URL(link.url);
        const domain = urlObj.hostname;

        let health_status = 'healthy';
        let redirect_url = null;

        if (response.status >= 200 && response.status < 300) {
          health_status = 'healthy';
          results.healthy++;
        } else if (response.status >= 300 && response.status < 400) {
          health_status = 'redirect';
          redirect_url = response.url !== link.url ? response.url : null;
          results.redirect++;
        } else if (response.status >= 400) {
          health_status = 'broken';
          results.broken++;
        }

        // Run AI validation for broken/redirect links
        const aiAnalysis = await aiValidation(link, health_status);

        // Update link in database
        await supabase
          .from('external_links')
          .update({
            health_status,
            status_code: response.status,
            redirect_url,
            last_health_check: new Date().toISOString(),
            check_count: (link.check_count || 0) + 1,
            domain
          })
          .eq('id', link.id);

        results.details.push({
          id: link.id,
          url: link.url,
          status: response.status,
          health_status,
          redirect_url,
          article_type: link.article_type,
          article_id: link.article_id,
          ai_analysis: aiAnalysis
        });

      } catch (error: any) {
        console.error(`Error checking ${link.url}:`, error.message);
        
        let health_status = 'timeout';
        if (error.name === 'AbortError') {
          results.timeout++;
        } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
          health_status = 'ssl_error';
          results.ssl_error++;
        } else {
          results.broken++;
          health_status = 'broken';
        }

        // Extract domain
        try {
          const urlObj = new URL(link.url);
          const domain = urlObj.hostname;
          
          await supabase
            .from('external_links')
            .update({
              health_status,
              status_code: 0,
              last_health_check: new Date().toISOString(),
              check_count: (link.check_count || 0) + 1,
              domain
            })
            .eq('id', link.id);
        } catch (urlError) {
          console.error('Invalid URL:', link.url);
        }

        results.details.push({
          id: link.id,
          url: link.url,
          error: error.message,
          health_status
        });
      }
    }

    console.log('Health check complete:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Monitor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
