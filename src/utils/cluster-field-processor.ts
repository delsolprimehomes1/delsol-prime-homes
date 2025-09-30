import { supabase } from '@/integrations/supabase/client';
import { ArticleField } from '@/components/cluster/ArticleFieldCard';

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
  similarityThreshold: number = 0.9
): Promise<string | null> => {
  const { data: articles, error } = await supabase
    .from('qa_articles')
    .select('id, title')
    .eq('language', language);

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

const createFrontmatter = (article: ArticleField, stage: string) => {
  return {
    tags: article.tags,
    location_focus: article.locationFocus,
    target_audience: article.targetAudience,
    intent: article.intent,
    diagram: article.diagram || null,
    funnel_stage: stage,
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

    const articleIds: { [key: string]: string } = {};
    let position = 1;

    // Process TOFU articles
    for (const [index, article] of data.tofuArticles.entries()) {
      // Validate required fields
      if (!article.title?.trim() || !article.content?.trim()) {
        errors.push(`TOFU ${index + 1}: Missing required fields (title or content)`);
        continue;
      }

      const existingId = await findExistingArticleByTitle(article.title, data.language);
      const slug = generateSlug(article.title);
      const currentPosition = position;
      position += 1;
      
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
            markdown_frontmatter: createFrontmatter(article, 'TOFU'),
            ai_optimization_score: 85,
            voice_search_ready: true,
            citation_ready: true,
          })
          .eq('id', existingId);

        if (error) {
          errors.push(`TOFU ${index + 1}: ${error.message}`);
        } else {
          articleIds[`tofu-${index}`] = existingId;
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
            markdown_frontmatter: createFrontmatter(article, 'TOFU'),
            ai_optimization_score: 85,
            voice_search_ready: true,
            citation_ready: true,
          })
          .select()
          .single();

        if (error) {
          errors.push(`TOFU ${index + 1}: ${error.message}`);
        } else if (inserted) {
          articleIds[`tofu-${index}`] = inserted.id;
        }
      }
    }

    // Process MOFU articles
    for (const [index, article] of data.mofuArticles.entries()) {
      // Validate required fields
      if (!article.title?.trim() || !article.content?.trim()) {
        errors.push(`MOFU ${index + 1}: Missing required fields (title or content)`);
        continue;
      }

      const existingId = await findExistingArticleByTitle(article.title, data.language);
      const slug = generateSlug(article.title);
      const currentPosition = position;
      position += 1;
      
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
            markdown_frontmatter: createFrontmatter(article, 'MOFU'),
            ai_optimization_score: 90,
            voice_search_ready: true,
            citation_ready: true,
          })
          .eq('id', existingId);

        if (error) {
          errors.push(`MOFU ${index + 1}: ${error.message}`);
        } else {
          articleIds[`mofu-${index}`] = existingId;
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
            markdown_frontmatter: createFrontmatter(article, 'MOFU'),
            ai_optimization_score: 90,
            voice_search_ready: true,
            citation_ready: true,
          })
          .select()
          .single();

        if (error) {
          errors.push(`MOFU ${index + 1}: ${error.message}`);
        } else if (inserted) {
          articleIds[`mofu-${index}`] = inserted.id;
        }
      }
    }

    // Process BOFU article
    if (!data.bofuArticle.title?.trim() || !data.bofuArticle.content?.trim()) {
      errors.push(`BOFU: Missing required fields (title or content)`);
    } else {
      const existingBofuId = await findExistingArticleByTitle(data.bofuArticle.title, data.language);
      const slug = generateSlug(data.bofuArticle.title);
      const currentPosition = position;
      position += 1;
      
      if (existingBofuId) {
        // Update existing article
        const { error: bofuError } = await supabase
          .from('qa_articles')
          .update({
            title: data.bofuArticle.title,
            slug,
            content: data.bofuArticle.content,
            excerpt: generateExcerpt(data.bofuArticle.content),
            funnel_stage: 'BOFU',
            topic: data.topic,
            cluster_id: cluster.id,
            cluster_position: currentPosition,
            tags: data.bofuArticle.tags || [],
            location_focus: data.bofuArticle.locationFocus || null,
            target_audience: data.bofuArticle.targetAudience || null,
            intent: data.bofuArticle.intent || null,
            markdown_frontmatter: createFrontmatter(data.bofuArticle, 'BOFU'),
            ai_optimization_score: 95,
            voice_search_ready: true,
            citation_ready: true,
            appointment_booking_enabled: true,
            final_cta_type: 'booking',
          })
          .eq('id', existingBofuId);

        if (bofuError) {
          errors.push(`BOFU: ${bofuError.message}`);
        } else {
          articleIds['bofu-0'] = existingBofuId;
        }
      } else {
        // Create new article
        const { data: inserted, error: bofuError } = await supabase
          .from('qa_articles')
          .insert({
            title: data.bofuArticle.title,
            slug,
            content: data.bofuArticle.content,
            excerpt: generateExcerpt(data.bofuArticle.content),
            funnel_stage: 'BOFU',
            topic: data.topic,
            language: data.language,
            cluster_id: cluster.id,
            cluster_position: currentPosition,
            tags: data.bofuArticle.tags || [],
            location_focus: data.bofuArticle.locationFocus || null,
            target_audience: data.bofuArticle.targetAudience || null,
            intent: data.bofuArticle.intent || null,
            markdown_frontmatter: createFrontmatter(data.bofuArticle, 'BOFU'),
            ai_optimization_score: 95,
            voice_search_ready: true,
            citation_ready: true,
            appointment_booking_enabled: true,
            final_cta_type: 'booking',
          })
          .select()
          .single();

        if (bofuError) {
          errors.push(`BOFU: ${bofuError.message}`);
        } else if (inserted) {
          articleIds['bofu-0'] = inserted.id;
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
