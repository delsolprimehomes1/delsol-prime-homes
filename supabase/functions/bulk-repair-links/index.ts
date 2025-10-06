import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Updated: 2025-01-06 - Redeploying to pick up updated PERPLEXITY_API_KEY

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RepairProgress {
  articleId: string;
  articleTitle: string;
  articleType: string;
  status: 'processing' | 'success' | 'error' | 'skipped';
  linksFixed: number;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, articleIds, autoApproveThreshold = 80 } = await req.json();

    console.log(`Starting bulk repair with action: ${action}`);

    const results: RepairProgress[] = [];
    let totalFixed = 0;

    // Get articles to process
    let articlesToProcess: any[] = [];

    if (articleIds && articleIds.length > 0) {
      // Process specific articles
      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('id, title, content, slug')
        .in('id', articleIds)
        .eq('published', true);

      const { data: qaArticles } = await supabase
        .from('qa_articles')
        .select('id, title, content, slug')
        .in('id', articleIds)
        .eq('published', true);

      articlesToProcess = [
        ...(blogs || []).map(b => ({ ...b, type: 'blog' })),
        ...(qaArticles || []).map(q => ({ ...q, type: 'qa' }))
      ];
    } else {
      // Get all articles if no specific IDs provided
      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('id, title, content, slug')
        .eq('published', true);

      const { data: qaArticles } = await supabase
        .from('qa_articles')
        .select('id, title, content, slug')
        .eq('published', true);

      articlesToProcess = [
        ...(blogs || []).map(b => ({ ...b, type: 'blog' })),
        ...(qaArticles || []).map(q => ({ ...q, type: 'qa' }))
      ];
    }

    // Process based on action type
    if (action === 'internal' || action === 'all') {
      console.log('Processing internal links...');

      for (const article of articlesToProcess) {
        const progress: RepairProgress = {
          articleId: article.id,
          articleTitle: article.title,
          articleType: article.type,
          status: 'processing',
          linksFixed: 0,
        };

        try {
          // Scan for broken links
          const scanResponse = await fetch(`${supabaseUrl}/functions/v1/validate-and-fix-links`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'scan',
              articleId: article.id,
              articleType: article.type,
            }),
          });

          const scanResult = await scanResponse.json();

          if (scanResult.reports && scanResult.reports.length > 0) {
            const report = scanResult.reports.find((r: any) => r.articleId === article.id);

            if (report && report.brokenLinks && report.brokenLinks.length > 0) {
              // Auto-select best suggestions
              const replacements: Record<string, string> = {};

              for (const brokenLink of report.brokenLinks) {
                if (brokenLink.suggestions && brokenLink.suggestions.length > 0) {
                  const bestSuggestion = brokenLink.suggestions[0];
                  if (bestSuggestion.relevance >= autoApproveThreshold) {
                    replacements[brokenLink.url] = bestSuggestion.url;
                    progress.linksFixed++;
                  }
                }
              }

              // Apply fixes if we have any
              if (Object.keys(replacements).length > 0) {
                await fetch(`${supabaseUrl}/functions/v1/validate-and-fix-links`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    action: 'fix',
                    articleId: article.id,
                    articleType: article.type,
                    replacements,
                  }),
                });

                progress.status = 'success';
                totalFixed += progress.linksFixed;
              } else {
                progress.status = 'skipped';
                progress.error = 'No high-confidence replacements found';
              }
            } else {
              progress.status = 'skipped';
              progress.error = 'No broken links found';
            }
          }
        } catch (error) {
          console.error(`Error processing article ${article.id}:`, error);
          progress.status = 'error';
          progress.error = error.message;
        }

        results.push(progress);
      }
    }

    if (action === 'external' || action === 'all') {
      console.log('Processing external links...');

      // Run health check with auto-replace
      await fetch(`${supabaseUrl}/functions/v1/monitor-external-links`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ autoReplace: true }),
      });
    }

    const summary = {
      totalArticlesProcessed: articlesToProcess.length,
      totalLinksFixed: totalFixed,
      successful: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      details: results,
    };

    console.log('Bulk repair complete:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in bulk-repair-links:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
