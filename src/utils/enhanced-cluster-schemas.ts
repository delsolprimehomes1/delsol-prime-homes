// Enhanced JSON-LD Schemas for Clustered QA System
import { ClusteredQAArticle, QACluster } from './cluster-manager';

export interface ClusterSchemaOptions {
  baseUrl?: string;
  includeAIOptimization?: boolean;
  includeVoiceSearch?: boolean;
  includeCitationData?: boolean;
}

/**
 * Generate comprehensive cluster-aware JSON-LD schema
 */
export const generateClusterSchema = (
  cluster: QACluster,
  options: ClusterSchemaOptions = {}
): any => {
  const {
    baseUrl = 'https://delsolprimehomes.com',
    includeAIOptimization = true,
    includeVoiceSearch = true,
    includeCitationData = true
  } = options;

  const articles = cluster.articles || [];
  
  // Group articles by funnel stage
  const tofuArticles = articles.filter(a => a.funnel_stage === 'TOFU');
  const mofuArticles = articles.filter(a => a.funnel_stage === 'MOFU');
  const bofuArticles = articles.filter(a => a.funnel_stage === 'BOFU');

  return {
    '@context': 'https://schema.org',
    '@type': ['FAQPage', 'CollectionPage', 'WebPage'],
    '@id': `${baseUrl}/qa/cluster/${cluster.id}`,
    'name': cluster.title,
    'description': cluster.description || `Comprehensive Q&A cluster about ${cluster.topic}`,
    'url': `${baseUrl}/qa/cluster/${cluster.id}`,
    'inLanguage': cluster.language,
    'dateModified': new Date().toISOString(),
    'datePublished': new Date().toISOString(),
    
    // Cluster-specific metadata
    'about': {
      '@type': 'Thing',
      'name': cluster.topic,
      'description': `${cluster.topic} related questions and answers`
    },

    // Publisher information
    'publisher': {
      '@type': 'Organization',
      'name': 'DelSolPrimeHomes',
      'url': baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/logo.png`
      }
    },

    // Author information
    'author': {
      '@type': 'Organization',
      'name': 'DelSolPrimeHomes Expert Team',
      'url': baseUrl
    },

    // Main entity - the cluster structure
    'mainEntity': {
      '@type': 'ItemList',
      'name': `${cluster.title} - Question Flow`,
      'description': 'Structured question flow: 3 TOFU → 2 MOFU → 1 BOFU',
      'numberOfItems': articles.length,
      'itemListOrder': 'https://schema.org/ItemListOrderAscending',
      'itemListElement': articles.map((article, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': generateArticleQuestionSchema(article, baseUrl)
      }))
    },

    // Questions grouped by funnel stage
    'hasPart': [
      // TOFU Section
      {
        '@type': 'WebPageElement',
        'name': 'TOFU - Top of Funnel Questions',
        'description': 'Awareness stage questions with 3 variations',
        'mainEntity': tofuArticles.map(article => generateArticleQuestionSchema(article, baseUrl))
      },
      // MOFU Section
      {
        '@type': 'WebPageElement',
        'name': 'MOFU - Middle of Funnel Questions',
        'description': 'Consideration stage questions',
        'mainEntity': mofuArticles.map(article => generateArticleQuestionSchema(article, baseUrl))
      },
      // BOFU Section
      {
        '@type': 'WebPageElement',
        'name': 'BOFU - Bottom of Funnel Questions',
        'description': 'Decision stage questions leading to consultation',
        'mainEntity': bofuArticles.map(article => generateArticleQuestionSchema(article, baseUrl))
      }
    ],

    // Potential actions
    'potentialAction': [
      {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${baseUrl}/qa?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      },
      {
        '@type': 'ReadAction',
        'target': `${baseUrl}/qa/cluster/${cluster.id}`,
        'name': 'Read Complete Cluster'
      }
    ],

    // Speakable content for voice search
    ...(includeVoiceSearch && {
      'speakable': {
        '@type': 'SpeakableSpecification',
        'cssSelector': [
          '.cluster-title',
          '.funnel-stage-title',
          '.qa-question',
          '.qa-answer-summary',
          '.cluster-navigation'
        ],
        'xpath': [
          '//*[@class="cluster-title"]',
          '//*[@class="funnel-stage-title"]',
          '//*[@class="qa-question"]',
          '//*[@class="qa-answer-summary"]'
        ]
      }
    }),

    // AI/LLM optimization metadata
    ...(includeAIOptimization && {
      'additionalProperty': [
        {
          '@type': 'PropertyValue',
          'name': 'funnelFlow',
          'value': '3-TOFU-2-MOFU-1-BOFU'
        },
        {
          '@type': 'PropertyValue',
          'name': 'aiOptimized',
          'value': 'true'
        },
        {
          '@type': 'PropertyValue',
          'name': 'voiceSearchReady',
          'value': 'true'
        },
        {
          '@type': 'PropertyValue',
          'name': 'clusterStructure',
          'value': 'hierarchical'
        },
        {
          '@type': 'PropertyValue',
          'name': 'totalArticles',
          'value': articles.length.toString()
        }
      ]
    }),

    // Citation metadata
    ...(includeCitationData && {
      'citation': articles.map(article => ({
        '@type': 'CreativeWork',
        'name': article.title,
        'url': `${baseUrl}/qa/${article.slug}`,
        'author': 'DelSolPrimeHomes Expert Team',
        'datePublished': article.created_at,
        'inLanguage': article.language
      }))
    })
  };
};

/**
 * Generate individual article question schema
 */
const generateArticleQuestionSchema = (
  article: ClusteredQAArticle,
  baseUrl: string
): any => {
  return {
    '@type': 'Question',
    '@id': `${baseUrl}/qa/${article.slug}#question`,
    'name': article.title,
    'text': article.title,
    'url': `${baseUrl}/qa/${article.slug}`,
    'inLanguage': article.language,
    'dateCreated': article.created_at,
    'dateModified': article.updated_at,
    
    // Answer
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': article.excerpt,
      'url': `${baseUrl}/qa/${article.slug}#answer`,
      'author': {
        '@type': 'Organization',
        'name': 'DelSolPrimeHomes Expert Team'
      }
    },

    // Funnel stage classification
    'about': {
      '@type': 'Thing',
      'name': article.funnel_stage,
      'description': getFunnelStageDescription(article.funnel_stage)
    },

    // Tags and topics
    'keywords': article.tags?.join(', ') || article.topic,
    
    // Related questions (if linking is configured)
    ...(article.points_to_mofu_id && {
      'relatedLink': `${baseUrl}/qa/${article.points_to_mofu_id}`
    }),
    
    ...(article.points_to_bofu_id && {
      'relatedLink': `${baseUrl}/qa/${article.points_to_bofu_id}`
    })
  };
};

/**
 * Generate GitHub export schema for clusters
 */
export const generateGitHubExportSchema = (
  clusters: QACluster[],
  options: ClusterSchemaOptions = {}
): any => {
  const { baseUrl = 'https://delsolprimehomes.com' } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    'name': 'DelSolPrimeHomes QA Clusters',
    'description': 'Structured Q&A content organized in 3→2→1 funnel clusters',
    'url': `${baseUrl}/api/clusters.json`,
    'version': '1.0',
    'dateModified': new Date().toISOString(),
    'license': 'https://creativecommons.org/licenses/by/4.0/',
    
    'publisher': {
      '@type': 'Organization',
      'name': 'DelSolPrimeHomes',
      'url': baseUrl
    },

    'distribution': [
      {
        '@type': 'DataDownload',
        'contentUrl': `${baseUrl}/api/clusters.json`,
        'encodingFormat': 'application/json',
        'name': 'JSON Format'
      },
      {
        '@type': 'DataDownload',
        'contentUrl': `${baseUrl}/api/clusters.md`,
        'encodingFormat': 'text/markdown',
        'name': 'Markdown Format'
      }
    ],

    'hasPart': clusters.map(cluster => ({
      '@type': 'Dataset',
      'name': cluster.title,
      'description': cluster.description,
      'url': `${baseUrl}/qa/cluster/${cluster.id}`,
      'keywords': cluster.topic,
      'inLanguage': cluster.language,
      'mainEntity': generateClusterSchema(cluster, options)
    }))
  };
};

/**
 * Generate speakable schema for voice search optimization
 */
export const generateClusterSpeakableSchema = (
  cluster: QACluster,
  baseUrl: string = 'https://delsolprimehomes.com'
): any => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    'cssSelector': [
      '.cluster-title',
      '.cluster-description',
      '.funnel-stage-header',
      '.qa-question-title',
      '.qa-answer-excerpt',
      '.next-step-cta'
    ],
    'xpath': [
      `//*[@data-cluster-id="${cluster.id}"]//h1`,
      `//*[@data-cluster-id="${cluster.id}"]//h2`,
      `//*[@data-cluster-id="${cluster.id}"]//h3`,
      `//*[@data-cluster-id="${cluster.id}"]//*[@class="answer-summary"]`
    ]
  };
};

/**
 * Helper function to get funnel stage descriptions
 */
const getFunnelStageDescription = (stage: string): string => {
  const descriptions = {
    'TOFU': 'Top of Funnel - Awareness stage questions that introduce the topic',
    'MOFU': 'Middle of Funnel - Consideration stage questions that provide detailed information',
    'BOFU': 'Bottom of Funnel - Decision stage questions that lead to action'
  };
  
  return descriptions[stage as keyof typeof descriptions] || 'Question and answer content';
};