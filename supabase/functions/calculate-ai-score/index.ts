import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIScoreMetrics {
  voiceSearch: number;
  schemaValidation: number;
  externalLinks: number;
  headingStructure: number;
  multilingual: number;
  images: number;
  eeat: number;
  internalLinking: number;
  totalScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { articleId, articleIds, recalculateAll, recalculate_all } = body;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Received request:', { articleId, articleIds, recalculateAll, recalculate_all });

    // Fetch articles to score
    let articlesToScore = [];
    
    if (recalculateAll || recalculate_all) {
      const { data, error } = await supabase
        .from('qa_articles')
        .select('*');
      if (error) throw error;
      articlesToScore = data || [];
    } else if (articleIds && Array.isArray(articleIds)) {
      const { data, error } = await supabase
        .from('qa_articles')
        .select('*')
        .in('id', articleIds);
      if (error) throw error;
      articlesToScore = data || [];
    } else if (articleId) {
      const { data, error } = await supabase
        .from('qa_articles')
        .select('*')
        .eq('id', articleId)
        .single();
      if (error) throw error;
      articlesToScore = data ? [data] : [];
    }

    const results = [];
    
    for (const article of articlesToScore) {
      const score = await calculateArticleScore(article, supabase);
      
      // Update article with new score
      const { error: updateError } = await supabase
        .from('qa_articles')
        .update({
          ai_optimization_score: score.totalScore,
          voice_search_ready: score.voiceSearch >= 1.8,
          citation_ready: score.schemaValidation >= 1.8 && score.externalLinks >= 1.0,
          markdown_frontmatter: {
            ...((typeof article.markdown_frontmatter === 'object' && article.markdown_frontmatter !== null) 
              ? article.markdown_frontmatter 
              : {}),
            ai_metrics: score as any,
            last_scored_at: new Date().toISOString()
          }
        })
        .eq('id', article.id);
      
      if (updateError) {
        console.error(`Error updating article ${article.slug}:`, updateError);
      }
      
      results.push({
        id: article.id,
        slug: article.slug,
        title: article.title,
        score: score
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating AI score:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function calculateArticleScore(article: any, supabase: any): Promise<AIScoreMetrics> {
  const content = article.content || '';
  const title = article.title || '';
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  // 1. VOICE SEARCH READINESS (0-2 points)
  let voiceSearch = 0;
  const speakableQuestions = article.speakable_questions?.length || 0;
  if (speakableQuestions >= 3) voiceSearch += 0.5;
  const isQuestionFormat = /^(how|what|where|when|why|which|can|should|do|does|is|are|will)/i.test(title);
  if (isQuestionFormat) voiceSearch += 0.5;
  const conversationalPatterns = ['you can', 'you should', 'you need'];
  const conversationalMatches = conversationalPatterns.filter(p => content.toLowerCase().includes(p)).length;
  voiceSearch += Math.min(0.5, conversationalMatches * 0.1);
  const speakableAnswer = article.speakable_answer || '';
  const speakableWordCount = speakableAnswer.split(/\s+/).length;
  if (speakableWordCount >= 40 && speakableWordCount <= 60) voiceSearch += 0.5;
  voiceSearch = Math.min(2.0, voiceSearch);
  
  // 2. JSON-LD SCHEMA (0-2 points)
  let schemaValidation = 0;
  if (article.seo?.schema || (article.funnel_stage && article.topic)) schemaValidation += 0.8;
  if (speakableQuestions > 0 || speakableAnswer.length > 0) schemaValidation += 0.4;
  if (article.geo_coordinates || article.seo?.geoCoordinates) schemaValidation += 0.4;
  if (article.language) schemaValidation += 0.4;
  schemaValidation = Math.min(2.0, schemaValidation);
  
  // 3. EXTERNAL LINKS (0-1.5 points)
  let externalLinks = 0;
  const { data: externalLinksData } = await supabase
    .from('external_links')
    .select('*')
    .eq('article_id', article.id)
    .eq('article_type', 'qa');
  
  const externalLinkCount = externalLinksData?.length || 0;
  const linksPerThousand = (externalLinkCount / wordCount) * 1000;
  
  if (linksPerThousand >= 2) externalLinks += 0.6;
  else if (linksPerThousand >= 1) externalLinks += 0.3;
  
  // Authority score check
  const avgAuthorityScore = externalLinksData?.length > 0
    ? externalLinksData.reduce((sum: number, link: any) => sum + (link.authority_score || 0), 0) / externalLinksData.length
    : 0;
  if (avgAuthorityScore >= 80) externalLinks += 0.5;
  else if (avgAuthorityScore >= 60) externalLinks += 0.3;
  
  // All HTTPS check
  const allHttps = externalLinksData?.every((link: any) => link.url?.startsWith('https://')) ?? false;
  if (allHttps && externalLinkCount > 0) externalLinks += 0.2;
  
  // No broken links (verified links only)
  const noBroken = externalLinksData?.every((link: any) => link.verified === true) ?? false;
  if (noBroken && externalLinkCount > 0) externalLinks += 0.2;
  
  externalLinks = Math.min(1.5, externalLinks);
  
  // 4. HEADING STRUCTURE (0-1.5 points)
  let headingStructure = 0;
  const h1Count = (content.match(/<h1|^# /gm) || []).length;
  if (h1Count === 1) headingStructure += 0.5;
  else if (h1Count === 0) headingStructure += 0.3;
  const h2Count = (content.match(/<h2|^## /gm) || []).length;
  const h3Count = (content.match(/<h3|^### /gm) || []).length;
  if (h2Count >= 2 && h3Count >= 1) headingStructure += 0.5;
  headingStructure += 0.3; // No skipped levels assumed
  if (h2Count + h3Count > 0) headingStructure += 0.2;
  headingStructure = Math.min(1.5, headingStructure);
  
  // 5. MULTILINGUAL (0-1 point)
  let multilingual = 0;
  if (article.seo?.hreflang || article.language !== 'en') multilingual += 0.4;
  if (article.seo?.canonical || article.canonical_url) multilingual += 0.3;
  if (article.parent_id || article.multilingual_parent_id) multilingual += 0.3;
  multilingual = Math.min(1.0, multilingual);
  
  // 6. IMAGES (0-1 point)
  let images = 0;
  if (article.alt_text || article.image_url) images += 0.3;
  if (article.geo_coordinates || article.hero_image?.geoCoordinates) images += 0.3;
  if (article.hero_image?.caption || content.includes('figcaption')) images += 0.2;
  if (article.image_url?.includes('.webp') || article.hero_image?.url?.includes('.webp')) images += 0.2;
  images = Math.min(1.0, images);
  
  // 7. E-E-A-T (0-1 point)
  let eeat = 0;
  if (article.author || article.author_id) eeat += 0.3;
  if (article.reviewer || article.reviewer_id) eeat += 0.2;
  const hasRecentUpdate = article.last_updated || article.updated_at;
  const daysSinceUpdate = hasRecentUpdate ? 
    (Date.now() - new Date(hasRecentUpdate).getTime()) / (1000 * 60 * 60 * 24) : 9999;
  if (daysSinceUpdate <= 180) eeat += 0.3;
  if (externalLinkCount >= 2) eeat += 0.2;
  eeat = Math.min(1.0, eeat);
  
  // 8. INTERNAL LINKING (0-1 point)
  let internalLinking = 0;
  const internalLinkMatches = (article.internal_links?.length || 0) + 
    (content.match(/href="\/(?:qa|blog|faq)/gi) || []).length;
  if (internalLinkMatches >= 2) internalLinking += 0.5;
  else if (internalLinkMatches >= 1) internalLinking += 0.3;
  const hasDescriptiveAnchors = content.includes('Learn more') || article.next_step_text;
  if (hasDescriptiveAnchors) internalLinking += 0.3;
  const hasNextStage = article.next_step_url || article.points_to_mofu_id;
  if (hasNextStage) internalLinking += 0.2;
  internalLinking = Math.min(1.0, internalLinking);
  
  const totalScore = voiceSearch + schemaValidation + externalLinks + headingStructure + 
    multilingual + images + eeat + internalLinking;
  
  return {
    voiceSearch: Math.round(voiceSearch * 10) / 10,
    schemaValidation: Math.round(schemaValidation * 10) / 10,
    externalLinks: Math.round(externalLinks * 10) / 10,
    headingStructure: Math.round(headingStructure * 10) / 10,
    multilingual: Math.round(multilingual * 10) / 10,
    images: Math.round(images * 10) / 10,
    eeat: Math.round(eeat * 10) / 10,
    internalLinking: Math.round(internalLinking * 10) / 10,
    totalScore: Math.round(totalScore * 10) / 10
  };
}
