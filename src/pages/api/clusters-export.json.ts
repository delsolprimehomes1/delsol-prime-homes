// GitHub Export API for QA Clusters
import { ClusterManager } from '@/utils/cluster-manager';
import { generateGitHubExportSchema } from '@/utils/enhanced-cluster-schemas';

export const generateClustersExport = async (format: 'json' | 'markdown' = 'json', language: string = 'en') => {
  const clusters = await ClusterManager.getAllClustersWithArticles(language);
  
  if (format === 'markdown') {
    return generateMarkdownExport(clusters);
  }
  
  return {
    meta: {
      title: 'DelSolPrimeHomes QA Clusters',
      description: 'Structured Q&A content in 3→2→1 funnel clusters',
      version: '1.0',
      language,
      exportDate: new Date().toISOString(),
      totalClusters: clusters.length,
      totalArticles: clusters.reduce((sum, c) => sum + (c.articles?.length || 0), 0)
    },
    schema: generateGitHubExportSchema(clusters, { baseUrl: 'https://delsolprimehomes.com' }),
    clusters: clusters.map(cluster => ({
      id: cluster.id,
      title: cluster.title,
      topic: cluster.topic,
      language: cluster.language,
      articles: (cluster.articles || []).map(article => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        funnel_stage: article.funnel_stage,
        cluster_position: article.cluster_position,
        h1_title: article.h1_title,
        h2_title: article.h2_title,
        h3_title: article.h3_title,
        tags: article.tags,
        next_step_url: article.next_step_url,
        appointment_booking_enabled: article.appointment_booking_enabled
      }))
    }))
  };
};

const generateMarkdownExport = (clusters: any[]) => {
  let markdown = `# DelSolPrimeHomes QA Clusters\n\n`;
  markdown += `Generated: ${new Date().toISOString()}\n`;
  markdown += `Total Clusters: ${clusters.length}\n\n`;

  clusters.forEach((cluster, clusterIndex) => {
    markdown += `## ${cluster.title}\n\n`;
    if (cluster.description) {
      markdown += `${cluster.description}\n\n`;
    }

    const articles = cluster.articles || [];
    const tofuArticles = articles.filter((a: any) => a.funnel_stage === 'TOFU');
    const mofuArticles = articles.filter((a: any) => a.funnel_stage === 'MOFU');
    const bofuArticles = articles.filter((a: any) => a.funnel_stage === 'BOFU');

    // TOFU Section
    if (tofuArticles.length > 0) {
      markdown += `### TOFU - Top of Funnel (${tofuArticles.length} variations)\n\n`;
      tofuArticles.forEach((article: any, index: number) => {
        markdown += `#### ${article.h3_title || article.title}\n\n`;
        markdown += `${article.excerpt}\n\n`;
        if (article.tags && article.tags.length > 0) {
          markdown += `**Tags:** ${article.tags.join(', ')}\n\n`;
        }
      });
    }

    // MOFU Section
    if (mofuArticles.length > 0) {
      markdown += `### MOFU - Middle of Funnel (${mofuArticles.length} questions)\n\n`;
      mofuArticles.forEach((article: any) => {
        markdown += `#### ${article.h3_title || article.title}\n\n`;
        markdown += `${article.excerpt}\n\n`;
        if (article.tags && article.tags.length > 0) {
          markdown += `**Tags:** ${article.tags.join(', ')}\n\n`;
        }
      });
    }

    // BOFU Section
    if (bofuArticles.length > 0) {
      markdown += `### BOFU - Bottom of Funnel (Ready to Book)\n\n`;
      bofuArticles.forEach((article: any) => {
        markdown += `#### ${article.h3_title || article.title}\n\n`;
        markdown += `${article.excerpt}\n\n`;
        markdown += `**Call to Action:** Book Consultation\n\n`;
        if (article.tags && article.tags.length > 0) {
          markdown += `**Tags:** ${article.tags.join(', ')}\n\n`;
        }
      });
    }

    markdown += `---\n\n`;
  });

  return markdown;
};