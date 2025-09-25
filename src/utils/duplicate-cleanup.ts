import { supabase } from '@/integrations/supabase/client';

export interface DuplicateGroup {
  title: string;
  articles: Array<{
    id: string;
    slug: string;
    created_at: string;
    content_length: number;
    cluster_id: string | null;
    points_to_mofu_id: string | null;
    points_to_bofu_id: string | null;
  }>;
  keep_id: string;
  delete_ids: string[];
}

export class DuplicateCleanup {
  /**
   * Find all duplicate articles based on title similarity
   */
  static async findAllDuplicates(threshold = 0.9): Promise<DuplicateGroup[]> {
    const { data: articles, error } = await supabase
      .from('qa_articles')
      .select('id, title, slug, created_at, content, cluster_id, points_to_mofu_id, points_to_bofu_id')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!articles) return [];

    const duplicateGroups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (const article of articles) {
      if (processed.has(article.id)) continue;

      const duplicates = articles.filter(other => 
        other.id !== article.id && 
        !processed.has(other.id) &&
        this.calculateTitleSimilarity(article.title, other.title) >= threshold
      );

      if (duplicates.length > 0) {
        const allArticles = [article, ...duplicates];
        
        // Choose the best version to keep (earliest created, longest content, or best slug)
        const bestArticle = allArticles.reduce((best, current) => {
          // Prefer articles with cluster_id or linking
          if (current.cluster_id && !best.cluster_id) return current;
          if (current.points_to_mofu_id && !best.points_to_mofu_id) return current;
          if (current.points_to_bofu_id && !best.points_to_bofu_id) return current;
          
          // Prefer longer content
          if (current.content.length > best.content.length) return current;
          
          // Prefer earlier creation date
          if (new Date(current.created_at) < new Date(best.created_at)) return current;
          
          return best;
        });

        const group: DuplicateGroup = {
          title: article.title,
          articles: allArticles.map(a => ({
            id: a.id,
            slug: a.slug,
            created_at: a.created_at,
            content_length: a.content.length,
            cluster_id: a.cluster_id,
            points_to_mofu_id: a.points_to_mofu_id,
            points_to_bofu_id: a.points_to_bofu_id
          })),
          keep_id: bestArticle.id,
          delete_ids: allArticles.filter(a => a.id !== bestArticle.id).map(a => a.id)
        };

        duplicateGroups.push(group);
        
        // Mark all as processed
        allArticles.forEach(a => processed.add(a.id));
      }
    }

    return duplicateGroups;
  }

  /**
   * Calculate similarity between two titles (0-1 scale)
   */
  private static calculateTitleSimilarity(title1: string, title2: string): number {
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^\\w\\s]/g, '')
      .replace(/\\s+/g, ' ')
      .trim();

    const t1 = normalize(title1);
    const t2 = normalize(title2);

    if (t1 === t2) return 1;

    const words1 = t1.split(' ');
    const words2 = t2.split(' ');
    
    const allWords = new Set([...words1, ...words2]);
    const common = words1.filter(word => words2.includes(word));
    
    return common.length / allWords.size;
  }

  /**
   * Update cross-references before deletion
   */
  static async updateCrossReferences(duplicateGroups: DuplicateGroup[]): Promise<void> {
    for (const group of duplicateGroups) {
      for (const deleteId of group.delete_ids) {
        // Update articles that point to this duplicate
        await supabase
          .from('qa_articles')
          .update({ 
            points_to_mofu_id: group.keep_id,
            updated_at: new Date().toISOString()
          })
          .eq('points_to_mofu_id', deleteId);

        await supabase
          .from('qa_articles')
          .update({ 
            points_to_bofu_id: group.keep_id,
            updated_at: new Date().toISOString()
          })
          .eq('points_to_bofu_id', deleteId);

        // Update parent_id references
        await supabase
          .from('qa_articles')
          .update({ 
            parent_id: group.keep_id,
            updated_at: new Date().toISOString()
          })
          .eq('parent_id', deleteId);
      }
    }
  }

  /**
   * Safely delete duplicate articles
   */
  static async deleteDuplicates(duplicateGroups: DuplicateGroup[]): Promise<number> {
    let deletedCount = 0;

    for (const group of duplicateGroups) {
      const { error } = await supabase
        .from('qa_articles')
        .delete()
        .in('id', group.delete_ids);

      if (error) {
        console.error(`Failed to delete duplicates for "${group.title}":`, error);
      } else {
        deletedCount += group.delete_ids.length;
      }
    }

    return deletedCount;
  }

  /**
   * Generate cleanup report
   */
  static generateCleanupReport(duplicateGroups: DuplicateGroup[]): string {
    const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.delete_ids.length, 0);
    const totalGroups = duplicateGroups.length;

    let report = `# Duplicate Content Cleanup Report\n\n`;
    report += `**Summary:**\n`;
    report += `- Found ${totalGroups} duplicate groups\n`;
    report += `- Total duplicates to remove: ${totalDuplicates}\n`;
    report += `- Estimated articles after cleanup: ${242 - totalDuplicates}\n\n`;

    report += `**Top Duplicate Groups:**\n`;
    duplicateGroups
      .sort((a, b) => b.delete_ids.length - a.delete_ids.length)
      .slice(0, 10)
      .forEach(group => {
        report += `- "${group.title}" (${group.delete_ids.length} duplicates)\n`;
      });

    return report;
  }
}
