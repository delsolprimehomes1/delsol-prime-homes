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

// Helper function to find replacement suggestions using Perplexity AI
async function findReplacementSuggestions(
  brokenLink: BrokenLink,
  currentTopic: string,
  currentFunnelStage: string,
  blogPosts: any[],
  qaArticles: any[]
): Promise<LinkSuggestion[]> {
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
  const targetArticles = brokenLink.articleType === 'blog' ? blogPosts : qaArticles;
  
  // Try Perplexity AI for intelligent suggestions first
  if (perplexityApiKey && targetArticles.length > 0) {
    try {
      console.log(`Using Perplexity AI to find replacements for: ${brokenLink.url}`);
      
      // Prepare available articles for Perplexity
      const availableArticles = targetArticles.map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        topic: a.topic,
        funnel_stage: a.funnel_stage,
        excerpt: a.excerpt || a.content?.substring(0, 200)
      }));

      const prompt = `You are an SEO expert analyzing broken internal links on a Spanish Costa del Sol real estate website.

CONTEXT:
- Current article topic: ${currentTopic}
- Current funnel stage: ${currentFunnelStage}

BROKEN LINK:
- URL: ${brokenLink.url}
- Anchor text: "${brokenLink.anchorText}"
- Article type: ${brokenLink.articleType}

AVAILABLE REPLACEMENT ARTICLES (${availableArticles.length} total):
${JSON.stringify(availableArticles, null, 2)}

TASK:
Analyze the broken link's anchor text and context to find the 5 most relevant replacement articles from the available list.

Consider:
1. Semantic relevance (does the replacement match what the anchor text implies?)
2. User intent (what information was the reader expecting to find?)
3. Funnel stage alignment (keep users in an appropriate journey stage)
4. Topic relevance (related real estate content areas)
5. Content depth match (detailed guides vs. quick answers)

Return ONLY a JSON array of the top 5 suggestions, ordered by relevance:
[
  {
    "id": "article-id",
    "slug": "article-slug", 
    "title": "Article Title",
    "relevanceScore": 95,
    "reasoning": "Brief explanation of why this is a good match"
  }
]

Return ONLY the JSON array, no other text.`;

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 2000,
          return_citations: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Parse AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const aiSuggestions = JSON.parse(jsonMatch[0]);
        
        // Map AI suggestions to our format with enhanced scoring
        const suggestions: LinkSuggestion[] = aiSuggestions.map((suggestion: any) => {
          const article = targetArticles.find(a => a.id === suggestion.id);
          if (!article) return null;
          
          // Combine Perplexity score with basic topic/funnel matching
          let finalScore = suggestion.relevanceScore * 0.7; // 70% from AI
          
          if (article.topic === currentTopic) finalScore += 20; // 20% topic match
          if (article.funnel_stage === currentFunnelStage) finalScore += 10; // 10% funnel match
          
          return {
            id: article.id,
            slug: article.slug,
            title: article.title,
            topic: article.topic,
            funnelStage: article.funnel_stage,
            relevanceScore: Math.round(finalScore)
          };
        }).filter(Boolean);

        console.log(`Perplexity found ${suggestions.length} AI-powered suggestions`);
        return suggestions.slice(0, 5);
      }
    } catch (error) {
      console.error('Perplexity AI failed, falling back to rule-based suggestions:', error);
    }
  }
  
  // Fallback: Rule-based scoring (original logic)
  console.log('Using rule-based scoring for suggestions');
  const suggestions: LinkSuggestion[] = [];
  
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
