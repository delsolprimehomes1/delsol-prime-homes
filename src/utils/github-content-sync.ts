import { supabase } from '@/integrations/supabase/client';
import {
  parseMarkdownWithFrontmatter,
  combineMarkdown,
  generateContentHash,
  ParsedFrontmatter,
} from './markdown-frontmatter-parser';
import { validateComplete } from './content-validator';

export type ContentType = 'qa' | 'blog';

export interface SyncResult {
  success: boolean;
  message: string;
  contentId?: string;
  errors?: string[];
}

/**
 * Generate GitHub path for content
 */
export function generateGitHubPath(
  type: ContentType,
  language: string,
  slug: string
): string {
  return `/content/${language}/${type}/${slug}/index.md`;
}

/**
 * Sync markdown content from GitHub to Supabase
 */
export async function syncMarkdownToSupabase(
  markdownContent: string,
  type: ContentType
): Promise<SyncResult> {
  try {
    // Parse markdown with frontmatter
    const parsed = parseMarkdownWithFrontmatter(markdownContent);
    const { frontmatter, content, hash } = parsed;

    // Validate content
    const validation = validateComplete(frontmatter, content);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Content validation failed',
        errors: validation.errors.map(e => `${e.field}: ${e.message}`),
      };
    }

    // Generate GitHub path
    const githubPath = generateGitHubPath(type, frontmatter.language, frontmatter.slug);

    // Check if content already exists
    const tableName = type === 'qa' ? 'qa_articles' : 'blog_posts';
    const { data: existingContent } = await supabase
      .from(tableName as any)
      .select('id, markdown_hash')
      .eq('github_path', githubPath)
      .maybeSingle() as any;

    // Skip if content hasn't changed
    if (existingContent && existingContent?.markdown_hash === hash) {
      return {
        success: true,
        message: 'Content already up to date',
        contentId: existingContent?.id,
      };
    }

    // Handle author and reviewer
    let authorId: string | undefined;
    let reviewerId: string | undefined;

    if (frontmatter.author) {
      const { data: author } = await supabase
        .from('content_authors' as any)
        .upsert({
          name: frontmatter.author.name,
          credentials: frontmatter.author.credentials,
          bio: frontmatter.author.bio,
        }, { onConflict: 'name' })
        .select('id')
        .single() as any;
      
      if (author) authorId = author?.id;
    }

    if (frontmatter.reviewer) {
      const { data: reviewer } = await supabase
        .from('content_reviewers' as any)
        .upsert({
          name: frontmatter.reviewer.name,
          credentials: frontmatter.reviewer.credentials,
          review_date: frontmatter.reviewer.reviewDate,
        }, { onConflict: 'name' })
        .select('id')
        .single() as any;
      
      if (reviewer) reviewerId = reviewer?.id;
    }

    // Prepare content data
    const contentData = {
      slug: frontmatter.slug,
      title: frontmatter.title,
      content,
      excerpt: frontmatter.summary,
      funnel_stage: frontmatter.funnelStage,
      topic: frontmatter.topic,
      language: frontmatter.language,
      meta_title: frontmatter.seo.metaTitle,
      meta_description: frontmatter.seo.metaDescription,
      canonical_url: frontmatter.seo.canonical,
      github_path: githubPath,
      markdown_hash: hash,
      frontmatter_yaml: JSON.stringify(frontmatter),
      speakable_questions: frontmatter.speakableQuestions || [],
      speakable_answer: frontmatter.speakableAnswer,
      geo_coordinates: frontmatter.geo ? {
        latitude: frontmatter.geo.latitude,
        longitude: frontmatter.geo.longitude,
        address: frontmatter.geo.address,
      } : null,
      area_served: frontmatter.geo?.areaServed || null,
      author_id: authorId,
      reviewer_id: reviewerId,
      image_url: frontmatter.heroImage?.src,
      alt_text: frontmatter.heroImage?.alt,
      next_step_url: frontmatter.nextStep ? `/qa/${frontmatter.nextStep.slug}` : null,
      next_step_text: frontmatter.nextStep?.cta,
    };

    // Upsert content
    if (existingContent) {
      const { data, error } = await supabase
        .from(tableName as any)
        .update(contentData as any)
        .eq('id', existingContent?.id)
        .select('id')
        .single() as any;

      if (error) throw error;

      return {
        success: true,
        message: 'Content updated successfully',
        contentId: data?.id,
      };
    } else {
      const { data, error } = await supabase
        .from(tableName as any)
        .insert(contentData as any)
        .select('id')
        .single() as any;

      if (error) throw error;

      return {
        success: true,
        message: 'Content created successfully',
        contentId: data?.id,
      };
    }
  } catch (error) {
    console.error('Error syncing markdown to Supabase:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Sync Supabase content back to markdown format
 */
export async function syncSupabaseToMarkdown(
  contentId: string,
  type: ContentType
): Promise<{ success: boolean; markdown?: string; error?: string }> {
  try {
    const tableName = type === 'qa' ? 'qa_articles' : 'blog_posts';
    
    const { data: content, error } = await supabase
      .from(tableName as any)
      .select(`
        *,
        content_authors(*),
        content_reviewers(*)
      `)
      .eq('id', contentId)
      .single() as any;

    if (error) throw error;
    if (!content) throw new Error('Content not found');

    // Reconstruct frontmatter from database
    const frontmatter: ParsedFrontmatter = {
      title: content?.title,
      slug: content?.slug,
      language: content?.language,
      funnelStage: content?.funnel_stage,
      topic: content?.topic,
      summary: content?.excerpt,
      seo: {
        metaTitle: content?.meta_title,
        metaDescription: content?.meta_description,
        canonical: content?.canonical_url,
      },
      speakableQuestions: content?.speakable_questions || [],
      speakableAnswer: content?.speakable_answer,
      author: content?.content_authors ? {
        name: content?.content_authors?.name,
        credentials: content?.content_authors?.credentials,
        bio: content?.content_authors?.bio,
      } : undefined,
      reviewer: content?.content_reviewers ? {
        name: content?.content_reviewers?.name,
        credentials: content?.content_reviewers?.credentials,
        reviewDate: content?.content_reviewers?.review_date,
      } : undefined,
      geo: content?.geo_coordinates ? {
        latitude: content?.geo_coordinates?.latitude,
        longitude: content?.geo_coordinates?.longitude,
        address: content?.geo_coordinates?.address,
        areaServed: content?.area_served || [],
      } : undefined,
      heroImage: content?.image_url ? {
        src: content?.image_url,
        alt: content?.alt_text || '',
        caption: undefined,
      } : undefined,
      nextStep: content?.next_step_url ? {
        title: content?.next_step_text || 'Continue Reading',
        slug: content?.next_step_url.replace('/qa/', '').replace('/blog/', ''),
        cta: content?.next_step_text || 'Read More',
      } : undefined,
    };

    const markdown = combineMarkdown(frontmatter, content?.content);

    return {
      success: true,
      markdown,
    };
  } catch (error) {
    console.error('Error syncing Supabase to markdown:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Bulk sync multiple markdown files
 */
export async function bulkSyncMarkdown(
  files: Array<{ content: string; type: ContentType }>,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const { content, type } = files[i];
    const result = await syncMarkdownToSupabase(content, type);

    if (result.success) {
      success++;
    } else {
      failed++;
      errors.push(`File ${i + 1}: ${result.message}`);
      if (result.errors) {
        errors.push(...result.errors.map(e => `  - ${e}`));
      }
    }

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return { success, failed, errors };
}
