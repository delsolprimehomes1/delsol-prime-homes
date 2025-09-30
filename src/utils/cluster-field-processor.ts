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
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
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
    let position = 0;

    // Process TOFU articles
    for (const [index, article] of data.tofuArticles.entries()) {
      const slug = generateSlug(article.title);
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
          cluster_position: position++,
          tags: article.tags,
          location_focus: article.locationFocus,
          target_audience: article.targetAudience,
          intent: article.intent,
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

    // Process MOFU articles
    for (const [index, article] of data.mofuArticles.entries()) {
      const slug = generateSlug(article.title);
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
          cluster_position: position++,
          tags: article.tags,
          location_focus: article.locationFocus,
          target_audience: article.targetAudience,
          intent: article.intent,
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

    // Process BOFU article
    const slug = generateSlug(data.bofuArticle.title);
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
        cluster_position: position++,
        tags: data.bofuArticle.tags,
        location_focus: data.bofuArticle.locationFocus,
        target_audience: data.bofuArticle.targetAudience,
        intent: data.bofuArticle.intent,
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
