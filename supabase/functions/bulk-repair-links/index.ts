import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Updated: 2025-01-10 - Refactored to inline link scanning logic for better performance

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
  brokenLinksFound: number;
  error?: string;
  errorType?: 'timeout' | 'network' | 'processing';
}

interface BatchProgress {
  batchNumber: number;
  totalBatches: number;
  articlesInBatch: number;
  results: RepairProgress[];
}

interface BrokenLink {
  url: string;
  anchorText: string;
  articleType: 'blog' | 'qa';
  slug: string;
}

interface LinkSuggestion {
  id: string;
  slug: string;
  title: string;
  topic: string;
  funnelStage: string;
  relevanceScore: number;
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
    
    // Fetch all articles once for lookup
    const { data: allBlogs } = await supabase
      .from('blog_posts')
      .select('id, slug, title, category_key, funnel_stage')
      .eq('published', true);
    
    const { data: allQA } = await supabase
      .from('qa_articles')
      .select('id, slug, title, topic, funnel_stage')
      .eq('published', true);
    
    const blogSlugs = new Set(allBlogs?.map(b => b.slug) || []);
    const qaSlugs = new Set(allQA?.map(q => q.slug) || []);
    
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
            
            const timeoutProgress: RepairProgress = {
              articleId: article.id,
              articleTitle: article.title,
              articleType: article.type,
              status: 'error',
              linksFixed: 0,
              brokenLinksFound: 0,
              error: 'Batch processing timeout',
              errorType: 'timeout'
            };
            batchResults.push(timeoutProgress);
            results.push(timeoutProgress);
            break;
          }

          const progress: RepairProgress = {
            articleId: article.id,
            articleTitle: article.title,
            articleType: article.type,
            status: 'processing',
            linksFixed: 0,
            brokenLinksFound: 0,
          };

          try {
            // INLINE SCANNING: Find broken links directly
            const brokenLinks = scanContentForBrokenLinks(article.content, blogSlugs, qaSlugs);
            progress.brokenLinksFound = brokenLinks.length;

            if (brokenLinks.length === 0) {
              progress.status = 'skipped';
              progress.error = 'No broken links found';
            } else {
              console.log(`Found ${brokenLinks.length} broken links in ${article.title}`);
              
              // Find suggestions for each broken link
              let updatedContent = article.content;
              
              for (const brokenLink of brokenLinks) {
                const suggestions = await findReplacementSuggestions(
                  brokenLink,
                  article.topic,
                  article.funnel_stage || 'TOFU',
                  allBlogs || [],
                  allQA || []
                );
                
                // Auto-apply if we have a high-confidence suggestion
                if (suggestions.length > 0 && suggestions[0].relevanceScore >= autoApproveThreshold) {
                  const replacement = suggestions[0];
                  const newUrl = `/${brokenLink.articleType}/${replacement.slug}`;
                  
                  // Replace in content
                  const oldLinkPattern = new RegExp(
                    `\\[${escapeRegex(brokenLink.anchorText)}\\]\\(${escapeRegex(brokenLink.url)}\\)`,
                    'g'
                  );
                  
                  if (oldLinkPattern.test(updatedContent)) {
                    updatedContent = updatedContent.replace(
                      oldLinkPattern,
                      `[${brokenLink.anchorText}](${newUrl})`
                    );
                    progress.linksFixed++;
                    console.log(`Auto-fixed: ${brokenLink.url} → ${newUrl} (score: ${replacement.relevanceScore})`);
                  }
                }
              }
              
              // Update article if we made any fixes
              if (progress.linksFixed > 0) {
                const table = article.type === 'blog' ? 'blog_posts' : 'qa_articles';
                const { error: updateError } = await supabase
                  .from(table)
                  .update({ 
                    content: updatedContent,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', article.id);
                
                if (updateError) {
                  throw updateError;
                }
                
                progress.status = 'success';
                totalFixed += progress.linksFixed;
              } else {
                progress.status = 'skipped';
                progress.error = 'No high-confidence replacements found';
              }
            }
          } catch (error) {
            console.error(`Error processing article ${article.id}:`, error);
            progress.status = 'error';
            progress.error = error.message;
            
            // Categorize error type
            if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
              progress.errorType = 'timeout';
            } else if (error.message.includes('fetch') || error.message.includes('network')) {
              progress.errorType = 'network';
            } else {
              progress.errorType = 'processing';
            }
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
    return new Response(JSON.stringify({ 
      error: error.message,
      errorType: error.name === 'TimeoutError' ? 'timeout' : 'processing'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to scan content for broken links
function scanContentForBrokenLinks(
  content: string,
  blogSlugs: Set<string>,
  qaSlugs: Set<string>
): BrokenLink[] {
  const brokenLinks: BrokenLink[] = [];
  
  // Regex to find markdown links to /blog/ or /qa/
  const linkPattern = /\[([^\]]+)\]\((\/(?:blog|qa)\/[^)]+)\)/g;
  
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    const anchorText = match[1];
    const url = match[2];
    
    // Extract article type and slug
    const urlMatch = url.match(/\/(blog|qa)\/([^/?\s]+)/);
    if (!urlMatch) continue;
    
    const articleType = urlMatch[1] as 'blog' | 'qa';
    const slug = urlMatch[2];
    
    // Check if slug exists
    const exists = articleType === 'blog' 
      ? blogSlugs.has(slug)
      : qaSlugs.has(slug);
    
    if (!exists) {
      brokenLinks.push({
        url,
        anchorText,
        articleType,
        slug
      });
    }
  }
  
  return brokenLinks;
}

// Helper function to find replacement suggestions
async function findReplacementSuggestions(
  brokenLink: BrokenLink,
  currentTopic: string,
  currentFunnelStage: string,
  blogPosts: any[],
  qaArticles: any[]
): Promise<LinkSuggestion[]> {
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
  const targetArticles = brokenLink.articleType === 'blog' ? blogPosts : qaArticles;
  
  // Map blog category_key to QA topic for better matching
  const topicMapping: Record<string, string> = {
    'buying-guide': 'Buying Process',
    'market-insights': 'Market Insights',
    'locations': 'Locations',
    'legal-financial': 'Legal & Financial',
    'lifestyle': 'Lifestyle'
  };
  
  const mappedTopic = topicMapping[currentTopic] || currentTopic;
  
  // Try Perplexity AI for intelligent suggestions first
  if (perplexityApiKey && targetArticles.length > 0) {
    try {
      console.log(`Using Perplexity AI to find replacements for: ${brokenLink.url}`);
      
      const availableArticles = targetArticles
        .map(a => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          topic: a.topic || a.category_key,
          funnel_stage: a.funnel_stage
        }))
        .slice(0, 100); // Limit to prevent huge prompts

      const prompt = `You are an SEO expert analyzing broken internal links on a Spanish Costa del Sol real estate website.

CONTEXT:
- Current article topic: ${mappedTopic}
- Current funnel stage: ${currentFunnelStage}

BROKEN LINK:
- URL: ${brokenLink.url}
- Anchor text: "${brokenLink.anchorText}"
- Article type: ${brokenLink.articleType}

AVAILABLE REPLACEMENT ARTICLES (${availableArticles.length} total):
${JSON.stringify(availableArticles.slice(0, 50), null, 2)}

TASK:
Find the 5 most relevant replacement articles. Consider:
1. Semantic match with anchor text
2. Topic relevance
3. Funnel stage alignment
4. User intent

Return ONLY a JSON array:
[
  {
    "id": "article-id",
    "slug": "article-slug",
    "relevanceScore": 95
  }
]`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
          const aiSuggestions = JSON.parse(jsonMatch[0]);
          const suggestions: LinkSuggestion[] = aiSuggestions
            .map((s: any) => {
              const article = targetArticles.find(a => a.id === s.id);
              if (!article) return null;
              
              let finalScore = s.relevanceScore * 0.7;
              if ((article.topic || article.category_key) === currentTopic) finalScore += 20;
              if (article.funnel_stage === currentFunnelStage) finalScore += 10;
              
              return {
                id: article.id,
                slug: article.slug,
                title: article.title,
                topic: article.topic || article.category_key,
                funnelStage: article.funnel_stage,
                relevanceScore: Math.round(finalScore)
              };
            })
            .filter(Boolean);
          
          if (suggestions.length > 0) {
            return suggestions.slice(0, 5);
          }
        }
      }
    } catch (error) {
      console.error('Perplexity AI failed, using fallback:', error);
    }
  }
  
  // Fallback: Rule-based scoring
  console.log('Using rule-based scoring for suggestions');
  const suggestions: LinkSuggestion[] = [];
  
  for (const article of targetArticles) {
    let score = 0;
    const articleTopic = article.topic || article.category_key;
    
    if (articleTopic === currentTopic || articleTopic === mappedTopic) score += 50;
    if (article.funnel_stage === currentFunnelStage) score += 30;
    
    const anchorWords = brokenLink.anchorText.toLowerCase().split(/\s+/);
    const titleWords = article.title.toLowerCase().split(/\s+/);
    const matchingWords = anchorWords.filter(w => titleWords.includes(w));
    score += matchingWords.length * 10;
    
    if (score > 0) {
      suggestions.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        topic: articleTopic,
        funnelStage: article.funnel_stage,
        relevanceScore: score
      });
    }
  }
  
  return suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
