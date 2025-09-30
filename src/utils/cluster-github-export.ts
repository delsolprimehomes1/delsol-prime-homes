// GitHub Export System for Clusters
import { QACluster, ClusteredQAArticle } from './cluster-manager';
import { generateClusterSchema, generateGitHubExportSchema } from './enhanced-cluster-schemas';

export interface MarkdownExportOptions {
  includeMetadata: boolean;
  includeFrontmatter: boolean;
  includeJSONLD: boolean;
}

export class ClusterGitHubExporter {
  /**
   * Export cluster as GitHub-ready Markdown with H1, H2, H3 structure
   */
  static generateClusterMarkdown(
    cluster: QACluster,
    options: MarkdownExportOptions = {
      includeMetadata: true,
      includeFrontmatter: true,
      includeJSONLD: true
    }
  ): string {
    const articles = cluster.articles || [];
    const tofuArticles = articles.filter(a => a.funnel_stage === 'TOFU');
    const mofuArticles = articles.filter(a => a.funnel_stage === 'MOFU');
    const bofuArticles = articles.filter(a => a.funnel_stage === 'BOFU');

    let markdown = '';

    // Frontmatter
    if (options.includeFrontmatter) {
      markdown += '---\n';
      markdown += `title: "${cluster.title}"\n`;
      markdown += `description: "${cluster.description || ''}"\n`;
      markdown += `topic: "${cluster.topic}"\n`;
      markdown += `language: "${cluster.language}"\n`;
      markdown += `cluster_id: "${cluster.id}"\n`;
      markdown += `structure: "3-TOFU-2-MOFU-1-BOFU"\n`;
      markdown += `total_articles: ${articles.length}\n`;
      markdown += `ai_optimized: true\n`;
      markdown += `voice_search_ready: true\n`;
      markdown += `created_at: "${new Date().toISOString()}"\n`;
      markdown += '---\n\n';
    }

    // H1: Cluster Title
    markdown += `# ${cluster.title}\n\n`;
    
    if (cluster.description) {
      markdown += `${cluster.description}\n\n`;
    }

    markdown += `**Topic:** ${cluster.topic}  \n`;
    markdown += `**Language:** ${cluster.language}  \n`;
    markdown += `**Structure:** 3 TOFU → 2 MOFU → 1 BOFU  \n`;
    markdown += `**Total Questions:** ${articles.length}\n\n`;

    markdown += '---\n\n';

    // H2: TOFU Section
    if (tofuArticles.length > 0) {
      markdown += '## TOFU - Top of Funnel Questions\n\n';
      markdown += '*Awareness stage questions with 3 variations*\n\n';
      
      tofuArticles.forEach((article, index) => {
        markdown += this.generateArticleMarkdown(article, 3, `TOFU ${index + 1}`);
      });

      markdown += '\n---\n\n';
    }

    // H2: MOFU Section
    if (mofuArticles.length > 0) {
      markdown += '## MOFU - Middle of Funnel Questions\n\n';
      markdown += '*Consideration stage questions*\n\n';
      
      mofuArticles.forEach((article, index) => {
        markdown += this.generateArticleMarkdown(article, 3, `MOFU ${index + 1}`);
      });

      markdown += '\n---\n\n';
    }

    // H2: BOFU Section
    if (bofuArticles.length > 0) {
      markdown += '## BOFU - Bottom of Funnel Question\n\n';
      markdown += '*Decision stage question leading to consultation*\n\n';
      
      bofuArticles.forEach((article) => {
        markdown += this.generateArticleMarkdown(article, 3, 'BOFU');
      });

      markdown += '\n---\n\n';
    }

    // Metadata
    if (options.includeMetadata) {
      markdown += '## Cluster Metadata\n\n';
      markdown += '```json\n';
      markdown += JSON.stringify({
        cluster_id: cluster.id,
        title: cluster.title,
        topic: cluster.topic,
        language: cluster.language,
        structure: {
          tofu: tofuArticles.length,
          mofu: mofuArticles.length,
          bofu: bofuArticles.length
        },
        journey_flow: '3-TOFU → 2-MOFU → 1-BOFU',
        ai_optimization: {
          voice_search_ready: true,
          citation_ready: true,
          speakable_content: true
        }
      }, null, 2);
      markdown += '\n```\n\n';
    }

    // JSON-LD Schema
    if (options.includeJSONLD) {
      markdown += '## JSON-LD Schema\n\n';
      markdown += '```json\n';
      markdown += JSON.stringify(generateClusterSchema(cluster), null, 2);
      markdown += '\n```\n\n';
    }

    return markdown;
  }

  /**
   * Generate individual article markdown
   */
  private static generateArticleMarkdown(
    article: ClusteredQAArticle,
    headingLevel: number,
    label: string
  ): string {
    const heading = '#'.repeat(headingLevel);
    let md = '';

    md += `${heading} ${article.title}\n\n`;
    md += `**Label:** ${label}  \n`;
    md += `**Stage:** ${article.funnel_stage}  \n`;
    md += `**Slug:** \`${article.slug}\`  \n`;
    
    if (article.variation_group) {
      md += `**Variation Group:** ${article.variation_group}  \n`;
    }
    
    if (article.tags && article.tags.length > 0) {
      md += `**Tags:** ${article.tags.join(', ')}  \n`;
    }

    md += '\n';

    // Short answer / excerpt
    md += '**Quick Answer:**\n\n';
    md += `> ${article.excerpt}\n\n`;

    // Full content
    md += '**Detailed Answer:**\n\n';
    md += `${article.content}\n\n`;

    // Next steps
    if (article.next_step_url && article.next_step_text) {
      md += `**Next Step:** [${article.next_step_text}](${article.next_step_url})\n\n`;
    }

    // AI optimization metadata
    md += '<div class="ai-metadata">\n\n';
    md += `- **AI Optimization Score:** ${article.ai_optimization_score || 0}/100\n`;
    md += `- **Voice Search Ready:** ${article.voice_search_ready ? 'Yes' : 'No'}\n`;
    md += `- **Citation Ready:** ${article.citation_ready ? 'Yes' : 'No'}\n`;
    md += '\n</div>\n\n';

    return md;
  }

  /**
   * Export all clusters as JSON for GitHub
   */
  static generateClustersJSON(clusters: QACluster[]): string {
    return JSON.stringify({
      metadata: {
        title: 'DelSolPrimeHomes QA Clusters',
        description: 'Structured Q&A content organized in 3→2→1 funnel clusters',
        total_clusters: clusters.length,
        structure: '3-TOFU-2-MOFU-1-BOFU',
        ai_optimized: true,
        voice_search_ready: true,
        exported_at: new Date().toISOString()
      },
      clusters: clusters.map(cluster => ({
        id: cluster.id,
        title: cluster.title,
        description: cluster.description,
        topic: cluster.topic,
        language: cluster.language,
        articles: (cluster.articles || []).map(article => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          funnel_stage: article.funnel_stage,
          cluster_position: article.cluster_position,
          variation_group: article.variation_group,
          points_to_mofu_id: article.points_to_mofu_id,
          points_to_bofu_id: article.points_to_bofu_id,
          tags: article.tags,
          ai_optimization_score: article.ai_optimization_score,
          voice_search_ready: article.voice_search_ready,
          citation_ready: article.citation_ready
        }))
      })),
      schema: generateGitHubExportSchema(clusters)
    }, null, 2);
  }

  /**
   * Generate README.md for GitHub repository
   */
  static generateREADME(clusters: QACluster[]): string {
    const totalArticles = clusters.reduce((sum, c) => sum + (c.articles?.length || 0), 0);
    const topics = [...new Set(clusters.map(c => c.topic))];

    let readme = '# DelSolPrimeHomes QA Clusters\n\n';
    readme += '## AI-Optimized Q&A Content for Costa del Sol Real Estate\n\n';
    
    readme += '### Overview\n\n';
    readme += `This repository contains ${clusters.length} structured Q&A clusters with ${totalArticles} articles, optimized for AI/LLM discovery and voice search.\n\n`;
    
    readme += '### Cluster Structure\n\n';
    readme += 'Each cluster follows the **3→2→1 funnel flow**:\n\n';
    readme += '- **3 TOFU** (Top of Funnel) - Awareness stage questions with variations\n';
    readme += '- **2 MOFU** (Middle of Funnel) - Consideration stage questions\n';
    readme += '- **1 BOFU** (Bottom of Funnel) - Decision stage question leading to consultation\n\n';
    
    readme += '### Topics Covered\n\n';
    topics.forEach(topic => {
      const topicClusters = clusters.filter(c => c.topic === topic);
      readme += `- **${topic}** (${topicClusters.length} cluster${topicClusters.length > 1 ? 's' : ''})\n`;
    });
    readme += '\n';

    readme += '### AI/LLM Optimization Features\n\n';
    readme += '- ✅ JSON-LD Schema.org structured data\n';
    readme += '- ✅ Voice search optimization with speakable content\n';
    readme += '- ✅ Citation-ready answers for AI systems\n';
    readme += '- ✅ Multilingual support\n';
    readme += '- ✅ Hierarchical H1→H2→H3 structure\n';
    readme += '- ✅ Funnel journey mapping (TOFU→MOFU→BOFU)\n\n';

    readme += '### Repository Structure\n\n';
    readme += '```\n';
    readme += '├── clusters/\n';
    readme += '│   ├── cluster-[id].md       # Individual cluster markdown\n';
    readme += '│   └── cluster-[id].json     # Individual cluster JSON\n';
    readme += '├── clusters.json              # All clusters in JSON format\n';
    readme += '├── clusters-schema.json       # JSON-LD schema for all clusters\n';
    readme += '└── README.md                  # This file\n';
    readme += '```\n\n';

    readme += '### Clusters\n\n';
    clusters.forEach((cluster, index) => {
      readme += `${index + 1}. **[${cluster.title}](./clusters/cluster-${cluster.id}.md)**\n`;
      readme += `   - Topic: ${cluster.topic}\n`;
      readme += `   - Articles: ${cluster.articles?.length || 0}\n`;
      readme += `   - Language: ${cluster.language}\n\n`;
    });

    readme += '### Usage for AI/LLM Systems\n\n';
    readme += 'This content is optimized for:\n\n';
    readme += '- **ChatGPT, Claude, Gemini** - Citation and answer extraction\n';
    readme += '- **Voice Assistants** - Alexa, Google Assistant, Siri\n';
    readme += '- **Search Engines** - Google, Bing with AI-powered results\n';
    readme += '- **RAG Systems** - Retrieval-Augmented Generation pipelines\n\n';

    readme += '### License\n\n';
    readme += 'Content © DelSolPrimeHomes. All rights reserved.\n\n';

    readme += '---\n\n';
    readme += `*Last updated: ${new Date().toISOString()}*\n`;

    return readme;
  }

  /**
   * Generate complete export package
   */
  static async generateCompleteExport(clusters: QACluster[]): Promise<{
    readme: string;
    clustersJSON: string;
    clusterFiles: Array<{
      filename: string;
      markdown: string;
      json: string;
    }>;
  }> {
    const clusterFiles = clusters.map(cluster => ({
      filename: `cluster-${cluster.id}`,
      markdown: this.generateClusterMarkdown(cluster),
      json: JSON.stringify({
        ...cluster,
        schema: generateClusterSchema(cluster)
      }, null, 2)
    }));

    return {
      readme: this.generateREADME(clusters),
      clustersJSON: this.generateClustersJSON(clusters),
      clusterFiles
    };
  }
}
