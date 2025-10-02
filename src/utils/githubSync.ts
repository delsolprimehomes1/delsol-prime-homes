import { supabase } from '@/integrations/supabase/client';

/**
 * GitHub Sync utility for Blog Builder
 * Handles automated markdown generation and Git commits
 */

interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  language: string;
  funnel_stage: string;
  category_key: string;
  author: string;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  image_alt?: string;
}

interface GitHubSyncOptions {
  autoCommit?: boolean;
  commitMessage?: string;
}

/**
 * Generate frontmatter from blog post data
 */
export function generateFrontmatter(data: BlogPostData): string {
  const frontmatter = {
    title: data.title,
    slug: data.slug,
    language: data.language,
    funnelStage: data.funnel_stage,
    topic: data.category_key,
    summary: data.excerpt,
    seo: {
      metaTitle: data.meta_title || data.title,
      metaDescription: data.meta_description || data.excerpt,
      canonical: `https://delsolprimehomes.com/blog/${data.slug}`,
    },
    author: {
      name: data.author || 'DelSolPrimeHomes',
    },
    heroImage: data.featured_image ? {
      src: data.featured_image,
      alt: data.image_alt || data.title,
    } : undefined,
    tags: data.tags,
    published: true,
  };

  return `---
${Object.entries(frontmatter)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      return `${key}:\n${Object.entries(value)
        .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
        .join('\n')}`;
    }
    return `${key}: ${JSON.stringify(value)}`;
  })
  .join('\n')}
---`;
}

/**
 * Generate complete markdown file content
 */
export function generateMarkdownFile(data: BlogPostData): string {
  const frontmatter = generateFrontmatter(data);
  return `${frontmatter}\n\n${data.content}`;
}

/**
 * Generate GitHub file path for blog post
 */
export function generateGitHubPath(language: string, slug: string): string {
  return `content/${language}/blog/${slug}/index.md`;
}

/**
 * Sync blog post to GitHub (via Supabase Edge Function)
 * This would typically integrate with GitHub API through an edge function
 */
export async function syncToGitHub(
  data: BlogPostData,
  options: GitHubSyncOptions = {}
): Promise<{ success: boolean; error?: string; path?: string }> {
  try {
    const markdown = generateMarkdownFile(data);
    const path = generateGitHubPath(data.language, data.slug);
    
    // Store markdown content in Supabase for GitHub sync
    // The actual GitHub sync would be handled by a GitHub Action or webhook
    const { error } = await supabase
      .from('blog_posts')
      .update({
        frontmatter_yaml: generateFrontmatter(data),
        github_path: path,
      })
      .eq('slug', data.slug)
      .eq('language', data.language);

    if (error) throw error;

    console.log('GitHub sync prepared:', {
      path,
      commitMessage: options.commitMessage || `Add blog: ${data.title}`,
    });

    return {
      success: true,
      path,
    };
  } catch (error) {
    console.error('GitHub sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate blog post data before sync
 */
export function validateBlogData(data: BlogPostData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title?.trim()) errors.push('Title is required');
  if (!data.slug?.trim()) errors.push('Slug is required');
  if (!data.content?.trim()) errors.push('Content is required');
  if (!data.excerpt?.trim()) errors.push('Excerpt is required');
  if (!/^[a-z0-9-]+$/.test(data.slug)) errors.push('Slug must be lowercase alphanumeric with hyphens only');

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Prepare blog post for publishing
 * Includes validation, GitHub sync, and metadata preparation
 */
export async function prepareForPublishing(
  data: BlogPostData
): Promise<{ ready: boolean; errors: string[]; warnings: string[] }> {
  const validation = validateBlogData(data);
  const warnings: string[] = [];

  if (!validation.valid) {
    return {
      ready: false,
      errors: validation.errors,
      warnings,
    };
  }

  // Check content quality
  if (data.content.split(/\s+/).length < 500) {
    warnings.push('Content is short (< 500 words). Consider expanding for better SEO.');
  }

  if (!data.meta_description) {
    warnings.push('Meta description is missing. Auto-generated from excerpt.');
  }

  if (!data.featured_image) {
    warnings.push('No hero image set. Consider generating one for better engagement.');
  }

  return {
    ready: true,
    errors: [],
    warnings,
  };
}
