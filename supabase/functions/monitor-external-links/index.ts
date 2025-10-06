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
      details: [] as any[]
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
          article_id: link.article_id
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
