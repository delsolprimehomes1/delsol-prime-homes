import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ArticleData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  language?: string;
  topic?: string;
  tags?: string[];
  featured_image?: string;
  image_alt?: string;
  author?: string;
}

interface SchemaMarkupProps {
  article: ArticleData;
  type: 'QAPage' | 'BlogPosting' | 'Article' | 'WebPage';
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ 
  article, 
  type,
  breadcrumbs 
}) => {
  const baseUrl = 'https://delsolprimehomes.com';
  const articleUrl = type === 'QAPage' 
    ? `${baseUrl}/qa/${article.slug}`
    : `${baseUrl}/blog/${article.slug}`;

  // Article Schema (works for QAPage, BlogPosting, Article)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": type,
    "headline": article.title,
    "description": article.excerpt || article.content.substring(0, 200),
    "url": articleUrl,
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "author": {
      "@type": "Person",
      "name": article.author || "Maria Rodriguez",
      "jobTitle": "Senior Real Estate Advisor",
      "email": "maria@delsolprimehomes.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Del Sol Prime Homes",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/assets/DelSolPrimeHomes-Logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "keywords": article.tags?.join(', '),
    "articleSection": article.topic,
    "inLanguage": article.language || 'en'
  };

  // Add image if available
  if (article.featured_image) {
    articleSchema["image"] = {
      "@type": "ImageObject",
      "url": article.featured_image,
      "caption": article.image_alt || article.title
    };
  }

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      "item": crumb.href ? `${baseUrl}${crumb.href}` : undefined
    }))
  } : null;

  // Speakable Schema for voice search optimization
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": article.title,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", ".prose p"]
    }
  };

  // WebPage Schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": article.title,
    "description": article.excerpt,
    "url": articleUrl,
    "inLanguage": article.language || 'en',
    "isPartOf": {
      "@type": "WebSite",
      "name": "Del Sol Prime Homes",
      "url": baseUrl
    }
  };

  return (
    <Helmet>
      {/* Main Article Schema */}
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Speakable Schema */}
      <script type="application/ld+json">
        {JSON.stringify(speakableSchema)}
      </script>

      {/* WebPage Schema */}
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>

      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "Del Sol Prime Homes",
          "url": baseUrl,
          "logo": `${baseUrl}/assets/DelSolPrimeHomes-Logo.png`,
          "description": "Luxury real estate specialist in Costa del Sol, Spain",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": "Andalusia",
            "addressCountry": "ES"
          },
          "areaServed": {
            "@type": "Place",
            "name": "Costa del Sol"
          }
        })}
      </script>
    </Helmet>
  );
};
