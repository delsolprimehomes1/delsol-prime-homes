import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrokenLink {
  url: string;
  anchorText: string;
  articleType: 'blog' | 'qa';
  slug: string;
  exists: boolean;
}

interface LinkSuggestion {
  id: string;
  slug: string;
  title: string;
  topic: string;
  funnelStage: string;
  relevanceScore: number;
}

interface ArticleReport {
  articleId: string;
  articleType: 'blog' | 'qa';
  title: string;
  slug: string;
  brokenLinks: BrokenLink[];
  suggestions: Record<string, LinkSuggestion[]>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, articleId, articleType, replacements } = await req.json();

    if (action === 'scan') {
      // Scan all articles for broken links
      console.log('Starting broken link scan...');
      
      const reports: ArticleReport[] = [];

      // Fetch all blog posts
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, content, topic, funnel_stage')
        .eq('published', true);

      // Fetch all QA articles
      const { data: qaArticles } = await supabase
        .from('qa_articles')
        .select('id, title, slug, content, topic, funnel_stage')
        .eq('published', true);

      // Create lookup maps for fast validation
      const blogSlugs = new Set(blogPosts?.map(p => p.slug) || []);
      const qaSlugs = new Set(qaArticles?.map(q => q.slug) || []);

      // Scan blog posts
      if (blogPosts) {
        for (const post of blogPosts) {
          const brokenLinks = await scanContentForBrokenLinks(
            post.content,
            blogSlugs,
            qaSlugs
          );

          if (brokenLinks.length > 0) {
            const suggestions: Record<string, LinkSuggestion[]> = {};
            
            for (const broken of brokenLinks) {
              suggestions[broken.url] = await findReplacementSuggestions(
                broken,
                post.topic,
                post.funnel_stage,
                blogPosts || [],
                qaArticles || []
              );
            }

            reports.push({
              articleId: post.id,
              articleType: 'blog',
              title: post.title,
              slug: post.slug,
              brokenLinks,
              suggestions
            });
          }
        }
      }

      // Scan QA articles
      if (qaArticles) {
        for (const article of qaArticles) {
          const brokenLinks = await scanContentForBrokenLinks(
            article.content,
            blogSlugs,
            qaSlugs
          );

          if (brokenLinks.length > 0) {
            const suggestions: Record<string, LinkSuggestion[]> = {};
            
            for (const broken of brokenLinks) {
              suggestions[broken.url] = await findReplacementSuggestions(
                broken,
                article.topic,
                article.funnel_stage,
                blogPosts || [],
                qaArticles || []
              );
            }

            reports.push({
              articleId: article.id,
              articleType: 'qa',
              title: article.title,
              slug: article.slug,
              brokenLinks,
              suggestions
            });
          }
        }
      }

      const summary = {
        totalArticlesScanned: (blogPosts?.length || 0) + (qaArticles?.length || 0),
        articlesWithBrokenLinks: reports.length,
        totalBrokenLinks: reports.reduce((sum, r) => sum + r.brokenLinks.length, 0)
      };

      console.log(`Scan complete: ${summary.totalBrokenLinks} broken links found in ${summary.articlesWithBrokenLinks} articles`);

      return new Response(
        JSON.stringify({ summary, reports }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'fix') {
      // Apply link replacements
      console.log(`Fixing broken links in ${articleType} article ${articleId}...`);

      const table = articleType === 'blog' ? 'blog_posts' : 'qa_articles';
      
      // Fetch current content
      const { data: article } = await supabase
        .from(table)
        .select('content')
        .eq('id', articleId)
        .single();

      if (!article) {
        throw new Error('Article not found');
      }

      let updatedContent = article.content;
      let replacementCount = 0;

      // Apply each replacement
      for (const replacement of replacements) {
        const { oldUrl, newUrl, anchorText } = replacement;
        
        // Find and replace the markdown link
        const oldLinkPattern = new RegExp(
          `\\[${escapeRegex(anchorText)}\\]\\(${escapeRegex(oldUrl)}\\)`,
          'g'
        );
        
        if (oldLinkPattern.test(updatedContent)) {
          updatedContent = updatedContent.replace(
            oldLinkPattern,
            `[${anchorText}](${newUrl})`
          );
          replacementCount++;
          console.log(`Replaced: [${anchorText}](${oldUrl}) → [${anchorText}](${newUrl})`);
        }
      }

      // Update the article
      const { error: updateError } = await supabase
        .from(table)
        .update({ 
          content: updatedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId);

      if (updateError) {
        throw updateError;
      }

      console.log(`Fixed ${replacementCount} broken links`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          replacementCount,
          message: `Fixed ${replacementCount} broken links`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action. Use "scan" or "fix".');

  } catch (error) {
    console.error('Error in validate-and-fix-links:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to scan content for broken links
async function scanContentForBrokenLinks(
  content: string,
  blogSlugs: Set<string>,
  qaSlugs: Set<string>
): Promise<BrokenLink[]> {
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
        slug,
        exists: false
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
  const suggestions: LinkSuggestion[] = [];
  const targetArticles = brokenLink.articleType === 'blog' ? blogPosts : qaArticles;
  
  // Score each potential replacement
  for (const article of targetArticles) {
    let score = 0;
    
    // Same topic = +50 points
    if (article.topic === currentTopic) score += 50;
    
    // Same funnel stage = +30 points
    if (article.funnel_stage === currentFunnelStage) score += 30;
    
    // Title similarity with anchor text (basic keyword matching)
    const anchorWords = brokenLink.anchorText.toLowerCase().split(/\s+/);
    const titleWords = article.title.toLowerCase().split(/\s+/);
    const matchingWords = anchorWords.filter(w => titleWords.includes(w));
    score += matchingWords.length * 10;
    
    if (score > 0) {
      suggestions.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        topic: article.topic,
        funnelStage: article.funnel_stage,
        relevanceScore: score
      });
    }
  }
  
  // Sort by relevance and return top 5
  return suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
