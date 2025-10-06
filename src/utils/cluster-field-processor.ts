import { supabase } from '@/integrations/supabase/client';
import { ArticleField } from '@/components/cluster/ArticleFieldCard';
import { 
  generateArticleSchema, 
  generateFAQSchema, 
  generateHowToSchema,
  generateBreadcrumbSchema 
} from './enhanced-schema-generator';

interface ClusterFieldData {
  clusterTitle: string;
  clusterDescription: string;
  topic: string;
  language: string;
  tofuArticles: ArticleField[];
  mofuArticles: ArticleField[];
  bofuArticle: ArticleField;
}

interface ProcessResult {
  success: boolean;
  clusterId?: string;
  articleCount?: number;
  errors?: string[];
}

// Helper function to enhance content if needed (800+ words with stage-specific optimization)
async function enhanceContentIfNeeded(
  article: ArticleField, 
  stage: string, 
  clusterData: { topic: string; language: string }
): Promise<ArticleField> {
  const wordCount = article.content.trim().split(/\s+/).length;
  
  // Only enhance if content is less than 800 words
  if (wordCount >= 800) {
    console.log(`✓ Article "${article.title}" already has ${wordCount} words, skipping enhancement`);
    return article;
  }

  console.log(`🚀 Enhancing "${article.title}" (${wordCount} words) for ${stage} stage in ${clusterData.language.toUpperCase()}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('content-enhancer', {
      body: {
        title: article.title,
        content: article.content,
        stage: stage,
        topic: clusterData.topic,
        language: clusterData.language,
        locationFocus: article.locationFocus || 'Costa del Sol',
        targetAudience: article.targetAudience || 'International property buyers',
        tags: article.tags
      }
    });

    if (error) {
      console.error(`❌ Enhancement error for "${article.title}":`, error);
      return article; // Return original if enhancement fails
    }

    if (data?.enhancedContent) {
      const enhancedWordCount = data.enhancedContent.trim().split(/\s+/).length;
      console.log(`✅ Enhanced "${article.title}" to ${enhancedWordCount} words (${data.meetsMinimum ? 'MEETS' : 'BELOW'} 800 minimum)`);
      
      return {
        ...article,
        content: data.enhancedContent
      };
    }

    return article;
  } catch (err) {
    console.error(`⚠️ Enhancement exception for "${article.title}":`, err);
    return article; // Return original on error
  }
}

const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Add timestamp suffix to ensure uniqueness
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
};

const calculateTitleSimilarity = (title1: string, title2: string): number => {
  const normalize = (str: string) => str.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const words1 = normalize(title1).split(/\s+/);
  const words2 = normalize(title2).split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
};

const findExistingArticleByTitle = async (
  title: string, 
  language: string,
  topic: string,
  similarityThreshold: number = 0.9
): Promise<string | null> => {
  const searchTitle = title.replace(/[^\w\s]/g, '');
  
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('id, title')
    .eq('language', language)
    .eq('topic', topic);

  if (error || !articles) return null;

  for (const article of articles) {
    const similarity = calculateTitleSimilarity(title, article.title);
    if (similarity >= similarityThreshold) {
      return article.id;
    }
  }

  return null;
};

const generateExcerpt = (content: string): string => {
  const cleaned = content.replace(/#+/g, '').replace(/\*\*/g, '').trim();
  return cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '');
};

const createFrontmatter = (article: ArticleField, stage: string, clusterId: string, clusterTitle: string) => {
  const wordCount = article.content.trim().split(/\s+/).length;
  
  const articleSchema = generateArticleSchema(article, stage, clusterId, clusterTitle, {
    includeSpeakable: true,
    includeEEAT: true,
  });
  
  const faqSchema = generateFAQSchema(article.content);
  const howToSchema = generateHowToSchema(article);
  const breadcrumbSchema = generateBreadcrumbSchema(clusterTitle, article.title, clusterId);

  // Enhanced visual metadata for AI/LLM understanding
  const visualMetadata = article.diagram ? {
    diagram: article.diagram,
    diagram_alt_text: article.diagramAltText || null,
    diagram_title: article.diagramTitle || null,
    diagram_description: article.diagramDescription || null,
    diagram_keywords: article.diagramKeywords || [],
  } : { diagram: null };

  return {
    tags: article.tags,
    location_focus: article.locationFocus,
    target_audience: article.targetAudience,
    intent: article.intent,
    ...visualMetadata,
    funnel_stage: stage,
    word_count: wordCount,
    schemas: {
      article: articleSchema,
      ...(faqSchema && { faq: faqSchema }),
      ...(howToSchema && { howTo: howToSchema }),
      breadcrumb: breadcrumbSchema,
    },
    seo_optimized: true,
    aeo_ready: wordCount >= 800,
    geo_optimized: true,
    eeat_signals: true,
    visual_accessibility: !!(article.diagram && article.diagramAltText),
    ai_citability: !!(article.diagram && article.diagramDescription),
  };
};

export const processClusterFields = async (data: ClusterFieldData): Promise<ProcessResult> => {
  const errors: string[] = [];

  try {
    // Create the cluster
    const { data: cluster, error: clusterError } = await supabase
      .from('qa_clusters')
      .insert({
        title: data.clusterTitle,
        description: data.clusterDescription,
        topic: data.topic,
        language: data.language,
        is_active: true,
      })
      .select()
      .single();

    if (clusterError || !cluster) {
      throw new Error(`Failed to create cluster: ${clusterError?.message}`);
    }

    console.log('\n🔄 Phase 1: AI Content Enhancement (ensuring 800+ words per article)...');
    
    // Enhance all articles in parallel
    const [enhancedTofuArticles, enhancedMofuArticles, enhancedBofuArticle] = await Promise.all([
      Promise.all(data.tofuArticles.map(article => 
        enhanceContentIfNeeded(article, 'TOFU', { topic: data.topic, language: data.language })
      )),
      Promise.all(data.mofuArticles.map(article => 
        enhanceContentIfNeeded(article, 'MOFU', { topic: data.topic, language: data.language })
      )),
      enhanceContentIfNeeded(data.bofuArticle, 'BOFU', { topic: data.topic, language: data.language })
    ]);

    console.log('✅ Phase 1 Complete: All articles enhanced\n');
    console.log('🔄 Phase 2: Creating articles in database...\n');

    const articleIds: { [key: string]: string } = {};
    let position = 1;

    // Process TOFU articles (using enhanced content)
    for (const [index, article] of enhancedTofuArticles.entries()) {
      // Validate required fields
      if (!article.title?.trim() || !article.content?.trim()) {
        console.log(`Skipping TOFU ${index + 1}: Missing required fields`);
        errors.push(`TOFU ${index + 1}: Missing required fields (title or content)`);
        continue;
      }

      // Validate word count
      const wordCount = article.content.trim().split(/\s+/).length;
      if (wordCount < 800) {
        console.warn(`TOFU ${index + 1}: Only ${wordCount} words (minimum 800 recommended)`);
        errors.push(`TOFU ${index + 1}: Content has ${wordCount} words, below 800 word minimum`);
      }

      const currentPosition = position;
      
      // Validate position is within constraint bounds (1-6)
      if (currentPosition < 1 || currentPosition > 6) {
        errors.push(`TOFU ${index + 1}: Invalid cluster_position ${currentPosition} (must be 1-6)`);
        console.error(`TOFU ${index + 1}: cluster_position ${currentPosition} is out of bounds`);
        continue;
      }

      console.log(`Processing TOFU ${index + 1}: cluster_position=${currentPosition}, title="${article.title?.substring(0, 50)}"`);

      const existingId = await findExistingArticleByTitle(article.title, data.language, data.topic);
      const slug = generateSlug(article.title);
      
      if (existingId) {
        // Update existing article
        const { error } = await supabase
          .from('qa_articles')
          .update({
            title: article.title,
            slug,
            content: article.content,
            excerpt: generateExcerpt(article.content),
            funnel_stage: 'TOFU',
            topic: data.topic,
            cluster_id: cluster.id,
            cluster_position: currentPosition,
            tags: article.tags || [],
            location_focus: article.locationFocus || null,
            target_audience: article.targetAudience || null,
            intent: article.intent || null,
            markdown_frontmatter: createFrontmatter(article, 'TOFU', cluster.id, data.clusterTitle),
            ai_optimization_score: wordCount >= 800 ? 90 : 75,
            voice_search_ready: true,
            citation_ready: true,
          })
          .eq('id', existingId);

        if (error) {
          errors.push(`TOFU ${index + 1}: ${error.message}`);
          console.error(`TOFU ${index + 1} failed with cluster_position=${currentPosition}:`, error);
        } else {
          articleIds[`tofu-${index}`] = existingId;
          position += 1; // Only increment on success
          console.log(`TOFU ${index + 1} updated successfully with cluster_position=${currentPosition}`);
        }
      } else {
        // Create new article
        const { data: inserted, error } = await supabase
          .from('qa_articles')
          .insert({
            title: article.title,
            slug,
            content: article.content,
            excerpt: generateExcerpt(article.content),
            funnel_stage: 'TOFU',
            topic: data.topic,
            language: data.language,
            cluster_id: cluster.id,
            cluster_position: currentPosition,
            tags: article.tags || [],
            location_focus: article.locationFocus || null,
            target_audience: article.targetAudience || null,
            intent: article.intent || null,
            markdown_frontmatter: createFrontmatter(article, 'TOFU', cluster.id, data.clusterTitle),
            ai_optimization_score: wordCount >= 800 ? 90 : 75,
            voice_search_ready: true,
            citation_ready: true,
          })
          .select()
          .single();

        if (error) {
          errors.push(`TOFU ${index + 1}: ${error.message}`);
          console.error(`TOFU ${index + 1} failed with cluster_position=${currentPosition}:`, error);
        } else if (inserted) {
          articleIds[`tofu-${index}`] = inserted.id;
          position += 1; // Only increment on success
          console.log(`TOFU ${index + 1} created successfully with cluster_position=${currentPosition}`);
        }
      }
    }

    // Process MOFU articles (using enhanced content)
    for (const [index, article] of enhancedMofuArticles.entries()) {
      // Validate required fields
      if (!article.title?.trim() || !article.content?.trim()) {
        errors.push(`MOFU ${index + 1}: Missing required fields (title or content)`);
        continue;
      }

      // Validate word count
      const wordCount = article.content.trim().split(/\s+/).length;
      if (wordCount < 800) {
        console.warn(`MOFU ${index + 1}: Only ${wordCount} words (minimum 800 recommended)`);
        errors.push(`MOFU ${index + 1}: Content has ${wordCount} words, below 800 word minimum`);
      }

      const currentPosition = position;
      
      // Validate position is within constraint bounds (1-6)
      if (currentPosition < 1 || currentPosition > 6) {
        errors.push(`MOFU ${index + 1}: Invalid cluster_position ${currentPosition} (must be 1-6)`);
        console.error(`MOFU ${index + 1}: cluster_position ${currentPosition} is out of bounds`);
        continue;
      }

      console.log(`Processing MOFU ${index + 1}: cluster_position=${currentPosition}, title="${article.title?.substring(0, 50)}"`);

      const existingId = await findExistingArticleByTitle(article.title, data.language, data.topic);
      const slug = generateSlug(article.title);
      
      if (existingId) {
        // Update existing article
        const { error } = await supabase
          .from('qa_articles')
          .update({
            title: article.title,
            slug,
            content: article.content,
            excerpt: generateExcerpt(article.content),
            funnel_stage: 'MOFU',
            topic: data.topic,
            cluster_id: cluster.id,
            cluster_position: currentPosition,
            tags: article.tags || [],
            location_focus: article.locationFocus || null,
            target_audience: article.targetAudience || null,
            intent: article.intent || null,
            markdown_frontmatter: createFrontmatter(article, 'MOFU', cluster.id, data.clusterTitle),
            ai_optimization_score: wordCount >= 800 ? 92 : 78,
            voice_search_ready: true,
            citation_ready: true,
          })
          .eq('id', existingId);

        if (error) {
          errors.push(`MOFU ${index + 1}: ${error.message}`);
          console.error(`MOFU ${index + 1} failed with cluster_position=${currentPosition}:`, error);
        } else {
          articleIds[`mofu-${index}`] = existingId;
          position += 1; // Only increment on success
          console.log(`MOFU ${index + 1} updated successfully with cluster_position=${currentPosition}`);
        }
      } else {
        // Create new article
        const { data: inserted, error } = await supabase
          .from('qa_articles')
          .insert({
            title: article.title,
            slug,
            content: article.content,
            excerpt: generateExcerpt(article.content),
            funnel_stage: 'MOFU',
            topic: data.topic,
            language: data.language,
            cluster_id: cluster.id,
            cluster_position: currentPosition,
            tags: article.tags || [],
            location_focus: article.locationFocus || null,
            target_audience: article.targetAudience || null,
            intent: article.intent || null,
            markdown_frontmatter: createFrontmatter(article, 'MOFU', cluster.id, data.clusterTitle),
            ai_optimization_score: wordCount >= 800 ? 92 : 78,
            voice_search_ready: true,
            citation_ready: true,
          })
          .select()
          .single();

        if (error) {
          errors.push(`MOFU ${index + 1}: ${error.message}`);
          console.error(`MOFU ${index + 1} failed with cluster_position=${currentPosition}:`, error);
        } else if (inserted) {
          articleIds[`mofu-${index}`] = inserted.id;
          position += 1; // Only increment on success
          console.log(`MOFU ${index + 1} created successfully with cluster_position=${currentPosition}`);
        }
      }
    }

    // Process BOFU article (using enhanced content)
    if (!enhancedBofuArticle.title?.trim() || !enhancedBofuArticle.content?.trim()) {
      errors.push(`BOFU: Missing required fields (title or content)`);
    } else {
      // Validate word count
      const wordCount = enhancedBofuArticle.content.trim().split(/\s+/).length;
      if (wordCount < 800) {
        console.warn(`BOFU: Only ${wordCount} words (minimum 800 recommended)`);
        errors.push(`BOFU: Content has ${wordCount} words, below 800 word minimum`);
      }
      const currentPosition = position;
      
      // Validate position is within constraint bounds (1-6)
      if (currentPosition < 1 || currentPosition > 6) {
        errors.push(`BOFU: Invalid cluster_position ${currentPosition} (must be 1-6)`);
        console.error(`BOFU: cluster_position ${currentPosition} is out of bounds`);
      } else {
        console.log(`Processing BOFU: cluster_position=${currentPosition}, title="${enhancedBofuArticle.title?.substring(0, 50)}"`);

        const existingBofuId = await findExistingArticleByTitle(enhancedBofuArticle.title, data.language, data.topic);
        const slug = generateSlug(enhancedBofuArticle.title);
        
        if (existingBofuId) {
          // Update existing article
          const { error: bofuError } = await supabase
            .from('qa_articles')
            .update({
              title: enhancedBofuArticle.title,
              slug,
              content: enhancedBofuArticle.content,
              excerpt: generateExcerpt(enhancedBofuArticle.content),
              funnel_stage: 'BOFU',
              topic: data.topic,
              cluster_id: cluster.id,
              cluster_position: currentPosition,
              tags: enhancedBofuArticle.tags || [],
              location_focus: enhancedBofuArticle.locationFocus || null,
              target_audience: enhancedBofuArticle.targetAudience || null,
              intent: enhancedBofuArticle.intent || null,
              markdown_frontmatter: createFrontmatter(enhancedBofuArticle, 'BOFU', cluster.id, data.clusterTitle),
              ai_optimization_score: wordCount >= 800 ? 95 : 80,
              voice_search_ready: true,
              citation_ready: true,
              appointment_booking_enabled: true,
              final_cta_type: 'booking',
            })
            .eq('id', existingBofuId);

          if (bofuError) {
            errors.push(`BOFU: ${bofuError.message}`);
            console.error(`BOFU failed with cluster_position=${currentPosition}:`, bofuError);
          } else {
            articleIds['bofu-0'] = existingBofuId;
            position += 1; // Only increment on success
            console.log(`BOFU updated successfully with cluster_position=${currentPosition}`);
          }
        } else {
          // Create new article
          const { data: inserted, error: bofuError } = await supabase
            .from('qa_articles')
            .insert({
              title: enhancedBofuArticle.title,
              slug,
              content: enhancedBofuArticle.content,
              excerpt: generateExcerpt(enhancedBofuArticle.content),
              funnel_stage: 'BOFU',
              topic: data.topic,
              language: data.language,
              cluster_id: cluster.id,
              cluster_position: currentPosition,
              tags: enhancedBofuArticle.tags || [],
              location_focus: enhancedBofuArticle.locationFocus || null,
              target_audience: enhancedBofuArticle.targetAudience || null,
              intent: enhancedBofuArticle.intent || null,
              markdown_frontmatter: createFrontmatter(enhancedBofuArticle, 'BOFU', cluster.id, data.clusterTitle),
              ai_optimization_score: wordCount >= 800 ? 95 : 80,
              voice_search_ready: true,
              citation_ready: true,
              appointment_booking_enabled: true,
              final_cta_type: 'booking',
            })
            .select()
            .single();

          if (bofuError) {
            errors.push(`BOFU: ${bofuError.message}`);
            console.error(`BOFU failed with cluster_position=${currentPosition}:`, bofuError);
          } else if (inserted) {
            articleIds['bofu-0'] = inserted.id;
            position += 1; // Only increment on success
            console.log(`BOFU created successfully with cluster_position=${currentPosition}`);
          }
        }
      }
    }

    // Create smart linking: TOFU -> MOFU -> BOFU
    const updates = [];

    // Link TOFU articles to first MOFU
    if (articleIds['mofu-0']) {
      for (let i = 0; i < 3; i++) {
        if (articleIds[`tofu-${i}`]) {
          updates.push(
            supabase
              .from('qa_articles')
              .update({ points_to_mofu_id: articleIds['mofu-0'] })
              .eq('id', articleIds[`tofu-${i}`])
          );
        }
      }
    }

    // Link MOFU articles to BOFU
    if (articleIds['bofu-0']) {
      for (let i = 0; i < 2; i++) {
        if (articleIds[`mofu-${i}`]) {
          updates.push(
            supabase
              .from('qa_articles')
              .update({ points_to_bofu_id: articleIds['bofu-0'] })
              .eq('id', articleIds[`mofu-${i}`])
          );
        }
      }
    }

    await Promise.all(updates);

    return {
      success: errors.length === 0,
      clusterId: cluster.id,
      articleCount: Object.keys(articleIds).length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Cluster processing error:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
};
