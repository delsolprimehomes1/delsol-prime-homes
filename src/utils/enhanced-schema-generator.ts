import { ArticleField } from '@/components/cluster/ArticleFieldCard';

interface EnhancedSchemaOptions {
  baseUrl?: string;
  includeSpeakable?: boolean;
  includeEEAT?: boolean;
}

export const generateArticleSchema = (
  article: ArticleField,
  stage: string,
  clusterId: string,
  clusterTitle: string,
  options: EnhancedSchemaOptions = {}
) => {
  const { 
    baseUrl = 'https://your-domain.com',
    includeSpeakable = true,
    includeEEAT = true
  } = options;

  const wordCount = article.content.trim().split(/\s+/).length;
  const slug = article.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const articleUrl = `${baseUrl}/qa/${slug}`;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.content.substring(0, 200),
    url: articleUrl,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    wordCount,
    articleBody: article.content,
    
    // Funnel stage and cluster metadata
    isPartOf: {
      '@type': 'WebPage',
      name: clusterTitle,
      url: `${baseUrl}/cluster/${clusterId}`,
    },
    
    // Author with E-E-A-T signals
    author: includeEEAT ? {
      '@type': 'Person',
      name: 'Costa del Sol Property Expert',
      jobTitle: 'Real Estate Consultant',
      affiliation: {
        '@type': 'Organization',
        name: 'Costa del Sol Properties',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Málaga',
          addressRegion: 'Andalusia',
          addressCountry: 'Spain',
        },
      },
      knowsAbout: [
        'Costa del Sol Real Estate',
        'International Property Investment',
        'Spanish Property Law',
        'Luxury Villa Market',
      ],
    } : undefined,

    // Publisher
    publisher: {
      '@type': 'Organization',
      name: 'Costa del Sol Properties',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },

    // Location focus
    ...(article.locationFocus && {
      spatialCoverage: {
        '@type': 'Place',
        name: article.locationFocus,
        address: {
          '@type': 'PostalAddress',
          addressRegion: 'Andalusia',
          addressCountry: 'ES',
        },
      },
    }),

    // Keywords and categorization
    keywords: article.tags?.join(', '),
    about: article.tags?.map(tag => ({
      '@type': 'Thing',
      name: tag,
    })),

    // Target audience
    ...(article.targetAudience && {
      audience: {
        '@type': 'Audience',
        audienceType: article.targetAudience,
      },
    }),

    // Speakable content for voice search
    ...(includeSpeakable && {
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['.article-content', '.quick-answer', 'h1', 'h2'],
        xpath: [
          '/html/body/article/h1',
          '/html/body/article/div[@class="quick-answer"]',
          '/html/body/article/div[@class="article-content"]',
        ],
      },
    }),

    // Funnel stage indicator
    additionalProperty: {
      '@type': 'PropertyValue',
      name: 'funnelStage',
      value: stage,
    },
  };

  return schema;
};

export const generateFAQSchema = (content: string) => {
  // Extract Q&A patterns from content
  const faqItems: Array<{ question: string; answer: string }> = [];
  
  const lines = content.split('\n');
  let currentQuestion = '';
  let currentAnswer: string[] = [];
  
  for (const line of lines) {
    if (line.match(/^#+\s+(.+\?)/)) {
      // Save previous Q&A
      if (currentQuestion && currentAnswer.length > 0) {
        faqItems.push({
          question: currentQuestion,
          answer: currentAnswer.join(' ').trim(),
        });
      }
      currentQuestion = line.replace(/^#+\s+/, '');
      currentAnswer = [];
    } else if (currentQuestion && line.trim()) {
      currentAnswer.push(line.trim());
    }
  }
  
  // Save last Q&A
  if (currentQuestion && currentAnswer.length > 0) {
    faqItems.push({
      question: currentQuestion,
      answer: currentAnswer.join(' ').trim(),
    });
  }

  if (faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
};

export const generateHowToSchema = (article: ArticleField) => {
  // Detect if content is a how-to guide
  if (!article.title.toLowerCase().includes('how to')) return null;

  const steps: string[] = [];
  const lines = article.content.split('\n');
  
  for (const line of lines) {
    if (line.match(/^\d+\.\s+/) || line.match(/^-\s+Step \d+:/i)) {
      steps.push(line.replace(/^\d+\.\s+|-\s+/g, '').trim());
    }
  }

  if (steps.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.content.substring(0, 200),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: `Step ${index + 1}`,
      text: step,
    })),
  };
};

export const generateBreadcrumbSchema = (
  clusterTitle: string,
  articleTitle: string,
  clusterId: string,
  baseUrl = 'https://your-domain.com'
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Q&A',
        item: `${baseUrl}/qa`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: clusterTitle,
        item: `${baseUrl}/cluster/${clusterId}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: articleTitle,
      },
    ],
  };
};
