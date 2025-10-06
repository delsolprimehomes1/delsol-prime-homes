import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();

    console.log(`🔍 Checking for scheduled content at ${now}`);

    // Find clusters scheduled to be published
    const { data: scheduledClusters, error: clusterError } = await supabaseClient
      .from('qa_clusters')
      .select('id, title, scheduled_publish_at, language')
      .eq('publish_status', 'scheduled')
      .lte('scheduled_publish_at', now);

    if (clusterError) {
      console.error('❌ Error fetching scheduled clusters:', clusterError);
      return new Response(
        JSON.stringify({ error: clusterError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Found ${scheduledClusters?.length || 0} clusters ready to publish`);

    const results = [];

    // Publish each cluster and its articles
    for (const cluster of scheduledClusters || []) {
      console.log(`\n🚀 Publishing cluster: ${cluster.title} (${cluster.language})`);
      
      // Update cluster status
      const { error: clusterUpdateError } = await supabaseClient
        .from('qa_clusters')
        .update({
          publish_status: 'published',
          is_active: true,
          auto_published_at: now
        })
        .eq('id', cluster.id);

      if (clusterUpdateError) {
        console.error(`❌ Failed to update cluster ${cluster.id}:`, clusterUpdateError);
        results.push({
          cluster_id: cluster.id,
          cluster_title: cluster.title,
          success: false,
          error: clusterUpdateError.message
        });
        continue;
      }

      // Update all articles in this cluster
      const { data: updatedArticles, error: articlesUpdateError } = await supabaseClient
        .from('qa_articles')
        .update({
          publish_status: 'published',
          published: true,
          auto_published_at: now
        })
        .eq('cluster_id', cluster.id)
        .eq('publish_status', 'scheduled')
        .select();

      if (articlesUpdateError) {
        console.error(`❌ Failed to update articles for cluster ${cluster.id}:`, articlesUpdateError);
        results.push({
          cluster_id: cluster.id,
          cluster_title: cluster.title,
          success: false,
          error: articlesUpdateError.message
        });
        continue;
      }

      results.push({
        cluster_id: cluster.id,
        cluster_title: cluster.title,
        language: cluster.language,
        articles_published: updatedArticles?.length || 0,
        published_at: now,
        success: true
      });

      console.log(`✅ Published cluster: ${cluster.title} (${updatedArticles?.length} articles)`);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n🎉 Auto-publish complete: ${successCount}/${results.length} clusters published successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        published_count: successCount,
        total_checked: results.length,
        results,
        timestamp: now
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('💥 Unexpected error in auto-publish:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
