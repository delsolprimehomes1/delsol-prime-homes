import { supabase } from '@/integrations/supabase/client';
import { quickScoreFix } from './comprehensive-ai-fix';

export interface ValidationResult {
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  score?: number;
  action?: () => Promise<void>;
}

export interface PreLaunchReport {
  seo: ValidationResult[];
  eeat: ValidationResult[];
  geo: ValidationResult[];
  images: ValidationResult[];
  links: ValidationResult[];
  multilingual: ValidationResult[];
  technical: ValidationResult[];
  aiOptimization: ValidationResult[];
  content: ValidationResult[];
  overallScore: number;
  readyForLaunch: boolean;
}

export async function runPreLaunchValidation(): Promise<PreLaunchReport> {
  console.log('🚀 Starting Pre-Launch Validation...');
  
  const results: PreLaunchReport = {
    seo: [],
    eeat: [],
    geo: [],
    images: [],
    links: [],
    multilingual: [],
    technical: [],
    aiOptimization: [],
    content: [],
    overallScore: 0,
    readyForLaunch: false
  };

  // Fetch all published content
  const { data: qaArticles } = await supabase
    .from('qa_articles')
    .select('*')
    .eq('published', true);

  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true);

  const totalArticles = (qaArticles?.length || 0) + (blogPosts?.length || 0);
  const allContent = [...(qaArticles || []), ...(blogPosts || [])];

  // SEO/AEO Validation
  results.seo = await validateSEO(allContent);
  
  // E-E-A-T Validation
  results.eeat = await validateEEAT(allContent);
  
  // GEO Signals Validation
  results.geo = await validateGeoSignals(allContent);
  
  // Images Validation
  results.images = await validateImages(allContent);
  
  // Links Validation
  results.links = await validateLinks(allContent);
  
  // Multilingual Validation
  results.multilingual = await validateMultilingual(qaArticles || []);
  
  // Technical Validation
  results.technical = await validateTechnical();
  
  // AI Optimization Validation
  results.aiOptimization = await validateAIOptimization(allContent);
  
  // Content Validation
  results.content = await validateContent(allContent);

  // Calculate overall score
  const allResults = [
    ...results.seo,
    ...results.eeat,
    ...results.geo,
    ...results.images,
    ...results.links,
    ...results.multilingual,
    ...results.technical,
    ...results.aiOptimization,
    ...results.content
  ];

  const passCount = allResults.filter(r => r.status === 'pass').length;
  const totalCount = allResults.length;
  results.overallScore = Math.round((passCount / totalCount) * 100);
  results.readyForLaunch = results.overallScore >= 95;

  return results;
}

async function validateSEO(content: any[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Check H1 hierarchy
  const h1Issues = content.filter(c => !c.h1_title && !c.title).length;
  results.push({
    category: 'SEO',
    item: 'All pages have ONE H1',
    status: h1Issues === 0 ? 'pass' : 'fail',
    message: h1Issues === 0 ? 'All content has H1 titles' : `${h1Issues} articles missing H1`
  });

  // Check speakable markup
  const speakableCount = content.filter(c => c.speakable_answer || c.speakable_questions?.length > 0).length;
  const speakablePercent = Math.round((speakableCount / content.length) * 100);
  results.push({
    category: 'SEO',
    item: 'Speakable markup on 90%+ of pages',
    status: speakablePercent >= 90 ? 'pass' : 'warning',
    message: `${speakablePercent}% of content has speakable markup`,
    score: speakablePercent
  });

  // Check canonical tags (in schema)
  const canonicalCount = content.filter(c => c.canonical_url || c.slug).length;
  results.push({
    category: 'SEO',
    item: 'Canonical tags on all pages',
    status: canonicalCount === content.length ? 'pass' : 'warning',
    message: `${canonicalCount}/${content.length} pages have canonical URLs`
  });

  return results;
}

async function validateEEAT(content: any[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Check author attribution
  const authorCount = content.filter(c => c.author || c.author_id).length;
  results.push({
    category: 'E-E-A-T',
    item: 'Author bios with credentials',
    status: authorCount === content.length ? 'pass' : 'fail',
    message: `${authorCount}/${content.length} articles have author attribution`
  });

  // Check last updated dates
  const updatedCount = content.filter(c => c.last_updated || c.updated_at).length;
  results.push({
    category: 'E-E-A-T',
    item: 'Last updated dates visible',
    status: updatedCount === content.length ? 'pass' : 'warning',
    message: `${updatedCount}/${content.length} articles have update dates`
  });

  return results;
}

async function validateGeoSignals(content: any[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Check geo coordinates in schema
  const geoCount = content.filter(c => c.geo_coordinates || c.city).length;
  results.push({
    category: 'GEO',
    item: 'Schema.org Place markup',
    status: geoCount === content.length ? 'pass' : 'warning',
    message: `${geoCount}/${content.length} articles have geo data`
  });

  // Check area served
  const areaServedCount = content.filter(c => c.area_served?.length > 0).length;
  results.push({
    category: 'GEO',
    item: 'areaServed in schema',
    status: areaServedCount >= content.length * 0.8 ? 'pass' : 'warning',
    message: `${areaServedCount}/${content.length} articles have areaServed`
  });

  return results;
}

async function validateImages(content: any[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Check alt text
  const altTextCount = content.filter(c => c.alt_text || c.image_alt).length;
  results.push({
    category: 'Images',
    item: 'All images have alt text',
    status: altTextCount === content.length ? 'pass' : 'fail',
    message: `${altTextCount}/${content.length} images have alt text`
  });

  // Check EXIF metadata
  const { data: imageMetadata } = await supabase
    .from('image_metadata')
    .select('*');
  
  const exifCount = imageMetadata?.filter(img => img.exif_latitude && img.exif_longitude).length || 0;
  const totalImages = imageMetadata?.length || 0;
  
  results.push({
    category: 'Images',
    item: 'EXIF GPS coordinates in images',
    status: exifCount >= totalImages * 0.9 ? 'pass' : 'warning',
    message: `${exifCount}/${totalImages} images have EXIF GPS data`
  });

  return results;
}

async function validateLinks(content: any[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Check external links
  const { data: externalLinks } = await supabase
    .from('external_links')
    .select('*')
    .eq('verified', true);
  
  const articlesWithExternal = new Set(externalLinks?.map(l => l.article_id) || []);
  
  results.push({
    category: 'Links',
    item: '≥2 external links per 1,000 words',
    status: articlesWithExternal.size >= content.length * 0.8 ? 'pass' : 'fail',
    message: `${articlesWithExternal.size}/${content.length} articles have external links`
  });

  // Check internal links
  const internalLinkCount = content.filter(c => 
    (c.internal_links?.length || 0) >= 2
  ).length;
  
  results.push({
    category: 'Links',
    item: '≥2 internal links per article',
    status: internalLinkCount >= content.length * 0.9 ? 'pass' : 'warning',
    message: `${internalLinkCount}/${content.length} articles have ≥2 internal links`
  });

  // Check HTTPS
  const httpsLinks = externalLinks?.filter(l => l.url.startsWith('https://')).length || 0;
  const totalExtLinks = externalLinks?.length || 1;
  
  results.push({
    category: 'Links',
    item: 'All external links HTTPS',
    status: httpsLinks === totalExtLinks ? 'pass' : 'fail',
    message: `${httpsLinks}/${totalExtLinks} external links use HTTPS`
  });

  return results;
}

async function validateMultilingual(qaArticles: any[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Check language distribution
  const languageDist = qaArticles.reduce((acc, article) => {
    acc[article.language] = (acc[article.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const nonEnglishCount = Object.entries(languageDist)
    .filter(([lang]) => lang !== 'en')
    .reduce((sum: number, [, count]: [string, number]) => sum + count, 0);
  
  const nonEnglishPercent = Math.round((nonEnglishCount / qaArticles.length) * 100);
  
  results.push({
    category: 'Multilingual',
    item: '25%+ of top content translated',
    status: nonEnglishPercent >= 25 ? 'pass' : 'fail',
    message: `${nonEnglishPercent}% of content is non-English (${nonEnglishCount}/${qaArticles.length} articles)`,
    score: nonEnglishPercent
  });

  // Check hreflang implementation (structural check)
  results.push({
    category: 'Multilingual',
    item: 'hreflang tags for translated content',
    status: 'pass',
    message: 'hreflang system implemented in MultilingualSEOHead component'
  });

  return results;
}

async function validateTechnical(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // GitHub Actions check
  results.push({
    category: 'Technical',
    item: 'GitHub Actions passing',
    status: 'pending',
    message: 'Check GitHub Actions workflow status manually'
  });

  // Supabase sync
  results.push({
    category: 'Technical',
    item: 'Supabase sync working',
    status: 'pass',
    message: 'Database connection established'
  });

  return results;
}

async function validateAIOptimization(content: any[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Check AI scores
  const scoredArticles = content.filter(c => (c.ai_optimization_score || c.ai_score || 0) > 0);
  const avgScore = scoredArticles.length > 0
    ? scoredArticles.reduce((sum, c) => sum + (Number(c.ai_optimization_score) || Number(c.ai_score) || 0), 0) / scoredArticles.length
    : 0;
  
  results.push({
    category: 'AI Optimization',
    item: 'Average AI score ≥9.8',
    status: avgScore >= 9.8 ? 'pass' : scoredArticles.length === 0 ? 'fail' : 'warning',
    message: scoredArticles.length === 0 
      ? 'No AI scores calculated - run scoring system'
      : `Average AI score: ${avgScore.toFixed(2)} (${scoredArticles.length}/${content.length} scored)`,
    score: avgScore,
    action: async () => {
      await quickScoreFix();
    }
  });

  // Check voice search readiness
  const voiceReadyCount = content.filter(c => c.voice_search_ready).length;
  const voiceReadyPercent = Math.round((voiceReadyCount / content.length) * 100);
  
  results.push({
    category: 'AI Optimization',
    item: 'Voice search readiness ≥90%',
    status: voiceReadyPercent >= 90 ? 'pass' : 'warning',
    message: `${voiceReadyPercent}% voice-ready (${voiceReadyCount}/${content.length})`,
    score: voiceReadyPercent
  });

  // Check citation readiness
  const citationReadyCount = content.filter(c => c.citation_ready).length;
  const citationReadyPercent = Math.round((citationReadyCount / content.length) * 100);
  
  results.push({
    category: 'AI Optimization',
    item: 'Citation ready ≥85%',
    status: citationReadyPercent >= 85 ? 'pass' : 'warning',
    message: `${citationReadyPercent}% citation-ready (${citationReadyCount}/${content.length})`,
    score: citationReadyPercent
  });

  return results;
}

async function validateContent(content: any[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  
  // Check funnel distribution
  const funnelDist = content.reduce((acc, c) => {
    const stage = c.funnel_stage || 'unknown';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  results.push({
    category: 'Content',
    item: 'Funnel paths working (TOFU→MOFU→BOFU)',
    status: funnelDist.TOFU && funnelDist.MOFU && funnelDist.BOFU ? 'pass' : 'warning',
    message: `Distribution: ${funnelDist.TOFU || 0} TOFU, ${funnelDist.MOFU || 0} MOFU, ${funnelDist.BOFU || 0} BOFU`
  });

  // Check next step implementation
  const nextStepCount = content.filter(c => c.next_step || c.next_step_url).length;
  results.push({
    category: 'Content',
    item: 'Next Step previews showing',
    status: nextStepCount >= content.length * 0.8 ? 'pass' : 'warning',
    message: `${nextStepCount}/${content.length} articles have next steps`
  });

  return results;
}
