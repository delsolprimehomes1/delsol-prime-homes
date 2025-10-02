import { supabase } from '@/integrations/supabase/client';

interface ApprovedLink {
  id: string;
  url: string;
  anchor_text: string;
  position_in_text: number;
}

interface LinkInjectionResult {
  success: boolean;
  updatedContent: string;
  linksInjected: number;
  errors?: string[];
}

/**
 * Inject approved external links into article markdown content
 * @param articleId - UUID of the article
 * @param articleType - Type of article ('qa' or 'blog')
 * @returns Result object with updated content and statistics
 */
export async function injectApprovedLinks(
  articleId: string,
  articleType: 'qa' | 'blog'
): Promise<LinkInjectionResult> {
  const errors: string[] = [];
  
  try {
    // Fetch article content
    const tableName = articleType === 'qa' ? 'qa_articles' : 'blog_posts';
    const { data: article, error: articleError } = await supabase
      .from(tableName)
      .select('content, external_links_ai')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      throw new Error(`Failed to fetch article: ${articleError?.message}`);
    }

    // Fetch approved links
    const { data: approvedLinks, error: linksError } = await supabase
      .from('external_links')
      .select('id, url, anchor_text, position_in_text')
      .eq('article_id', articleId)
      .eq('article_type', articleType)
      .eq('verified', true)
      .eq('rejected', false)
      .order('position_in_text', { ascending: false }); // Process from end to preserve positions

    if (linksError) {
      throw new Error(`Failed to fetch approved links: ${linksError.message}`);
    }

    if (!approvedLinks || approvedLinks.length === 0) {
      return {
        success: true,
        updatedContent: article.content,
        linksInjected: 0,
      };
    }

    let updatedContent = article.content;
    let successfulInjections = 0;
    const injectedLinksMetadata: any[] = [];

    // Process each link (from end to start to preserve positions)
    for (const link of approvedLinks as ApprovedLink[]) {
      try {
        const anchorRegex = new RegExp(escapeRegExp(link.anchor_text), 'g');
        let matches = 0;
        let lastIndex = 0;

        // Replace only the first occurrence near the expected position
        updatedContent = updatedContent.replace(anchorRegex, (match, offset) => {
          // Only replace the first match that's close to the expected position (within 500 chars)
          if (matches === 0 && Math.abs(offset - link.position_in_text) < 500) {
            matches++;
            successfulInjections++;
            
            // Add to metadata
            injectedLinksMetadata.push({
              url: link.url,
              anchorText: link.anchor_text,
              position: offset,
              injectedAt: new Date().toISOString(),
            });

            return `[${match}](${link.url})`;
          }
          return match;
        });

        if (matches === 0) {
          errors.push(`Could not find anchor text "${link.anchor_text}" in content`);
        }
      } catch (error) {
        errors.push(`Failed to inject link "${link.anchor_text}": ${error.message}`);
      }
    }

    // Update article with new content and metadata
    const updateData: any = {
      content: updatedContent,
      external_links_ai: injectedLinksMetadata,
      updated_at: new Date().toISOString(),
    };

    // Generate updated frontmatter YAML
    updateData.frontmatter_yaml = generateFrontmatterYAML({
      externalLinks: injectedLinksMetadata,
      lastLinksUpdate: new Date().toISOString(),
    });

    const { error: updateError } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', articleId);

    if (updateError) {
      throw new Error(`Failed to update article: ${updateError.message}`);
    }

    return {
      success: true,
      updatedContent,
      linksInjected: successfulInjections,
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    console.error('Link injection error:', error);
    return {
      success: false,
      updatedContent: '',
      linksInjected: 0,
      errors: [error.message],
    };
  }
}

/**
 * Validate external links for an article
 * @param articleId - UUID of the article
 * @param articleType - Type of article ('qa' or 'blog')
 * @returns Validation results with link health status
 */
export async function validateExternalLinks(
  articleId: string,
  articleType: 'qa' | 'blog'
): Promise<{ valid: number; broken: number; details: any[] }> {
  const { data: links } = await supabase
    .from('external_links')
    .select('id, url, verified')
    .eq('article_id', articleId)
    .eq('article_type', articleType)
    .eq('verified', true);

  if (!links || links.length === 0) {
    return { valid: 0, broken: 0, details: [] };
  }

  const results = await Promise.all(
    links.map(async (link) => {
      try {
        const response = await fetch(link.url, { method: 'HEAD' });
        return {
          id: link.id,
          url: link.url,
          status: response.status,
          valid: response.status >= 200 && response.status < 400,
        };
      } catch (error) {
        return {
          id: link.id,
          url: link.url,
          status: 0,
          valid: false,
          error: error.message,
        };
      }
    })
  );

  const valid = results.filter(r => r.valid).length;
  const broken = results.filter(r => !r.valid).length;

  return { valid, broken, details: results };
}

/**
 * Remove external links from article content
 * @param articleId - UUID of the article
 * @param articleType - Type of article ('qa' or 'blog')
 * @param linkIds - Array of link IDs to remove (optional, removes all if not provided)
 */
export async function removeExternalLinks(
  articleId: string,
  articleType: 'qa' | 'blog',
  linkIds?: string[]
): Promise<LinkInjectionResult> {
  try {
    const tableName = articleType === 'qa' ? 'qa_articles' : 'blog_posts';
    const { data: article, error: articleError } = await supabase
      .from(tableName)
      .select('content')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      throw new Error(`Failed to fetch article: ${articleError?.message}`);
    }

    let query = supabase
      .from('external_links')
      .select('url, anchor_text')
      .eq('article_id', articleId)
      .eq('article_type', articleType);

    if (linkIds && linkIds.length > 0) {
      query = query.in('id', linkIds);
    }

    const { data: linksToRemove, error: linksError } = await query;

    if (linksError) {
      throw new Error(`Failed to fetch links: ${linksError.message}`);
    }

    let updatedContent = article.content;
    let removedCount = 0;

    // Remove markdown links by replacing them with just the anchor text
    for (const link of linksToRemove || []) {
      const linkPattern = new RegExp(`\\[${escapeRegExp(link.anchor_text)}\\]\\(${escapeRegExp(link.url)}\\)`, 'g');
      if (linkPattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(linkPattern, link.anchor_text);
        removedCount++;
      }
    }

    // Update article
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId);

    if (updateError) {
      throw new Error(`Failed to update article: ${updateError.message}`);
    }

    // Mark links as rejected if specific IDs were provided
    if (linkIds && linkIds.length > 0) {
      await supabase
        .from('external_links')
        .update({ rejected: true, verified: false })
        .in('id', linkIds);
    }

    return {
      success: true,
      updatedContent,
      linksInjected: -removedCount, // Negative to indicate removal
    };

  } catch (error) {
    console.error('Link removal error:', error);
    return {
      success: false,
      updatedContent: '',
      linksInjected: 0,
      errors: [error.message],
    };
  }
}

// Helper functions
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateFrontmatterYAML(metadata: any): string {
  return `---
external_links_updated: ${metadata.lastLinksUpdate}
external_links_count: ${metadata.externalLinks.length}
external_links:
${metadata.externalLinks.map((link: any) => `  - url: ${link.url}
    anchor: ${link.anchorText}
    position: ${link.position}`).join('\n')}
---`;
}
