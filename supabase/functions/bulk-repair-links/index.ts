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

interface BatchProgress {
  batchNumber: number;
  totalBatches: number;
  articlesInBatch: number;
  results: RepairProgress[];
}

const BATCH_SIZE = 50;
const BATCH_TIMEOUT = 50000; // 50 seconds per batch

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
        .select('id, title, content, slug, category_key')
        .in('id', articleIds)
        .eq('published', true);

      const { data: qaArticles } = await supabase
        .from('qa_articles')
        .select('id, title, content, slug, topic')
        .in('id', articleIds)
        .eq('published', true);

      articlesToProcess = [
        ...(blogs || []).map(b => ({ ...b, type: 'blog', topic: b.category_key })),
        ...(qaArticles || []).map(q => ({ ...q, type: 'qa' }))
      ];
    } else {
      // Get all articles if no specific IDs provided
      const { data: blogs } = await supabase
        .from('blog_posts')
        .select('id, title, content, slug, category_key')
        .eq('published', true);

      const { data: qaArticles } = await supabase
        .from('qa_articles')
        .select('id, title, content, slug, topic')
        .eq('published', true);

      articlesToProcess = [
        ...(blogs || []).map(b => ({ ...b, type: 'blog', topic: b.category_key })),
        ...(qaArticles || []).map(q => ({ ...q, type: 'qa' }))
      ];
    }

    console.log(`Total articles to process: ${articlesToProcess.length}`);
    
    const totalBatches = Math.ceil(articlesToProcess.length / BATCH_SIZE);
    const batchProgresses: BatchProgress[] = [];

    // Process based on action type
    if (action === 'internal' || action === 'all') {
      console.log('Processing internal links in batches...');

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIdx = batchIndex * BATCH_SIZE;
        const endIdx = Math.min(startIdx + BATCH_SIZE, articlesToProcess.length);
        const batch = articlesToProcess.slice(startIdx, endIdx);
        
        console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} articles)`);
        
        const batchResults: RepairProgress[] = [];
        const batchStartTime = Date.now();

        for (const article of batch) {
          // Check batch timeout
          if (Date.now() - batchStartTime > BATCH_TIMEOUT) {
            console.warn(`Batch ${batchIndex + 1} timeout reached, moving to next batch`);
            break;
          }

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

            if (!scanResponse.ok) {
              throw new Error(`Scan failed: ${scanResponse.statusText}`);
            }

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
                  const fixResponse = await fetch(`${supabaseUrl}/functions/v1/validate-and-fix-links`, {
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

                  if (!fixResponse.ok) {
                    throw new Error(`Fix failed: ${fixResponse.statusText}`);
                  }

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
            } else {
              progress.status = 'skipped';
              progress.error = 'No scan results';
            }
          } catch (error) {
            console.error(`Error processing article ${article.id}:`, error);
            progress.status = 'error';
            progress.error = error.message;
          }

          batchResults.push(progress);
          results.push(progress);
        }

        batchProgresses.push({
          batchNumber: batchIndex + 1,
          totalBatches,
          articlesInBatch: batch.length,
          results: batchResults,
        });

        console.log(`Batch ${batchIndex + 1} complete: ${batchResults.filter(r => r.status === 'success').length} successful`);
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
      totalBatches,
      batchSize: BATCH_SIZE,
      batches: batchProgresses,
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
