/**
 * Generate comprehensive JSON-LD schemas for SEO and voice search optimization
 */

interface SchemaArticle {
  id?: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  language?: string;
  topic?: string;
  city?: string;
  tags?: string[];
  featured_image?: string;
  image_alt?: string;
  author?: any;
  reviewer?: any;
  geo_coordinates?: any;
  speakable_questions?: any[];
  speakable_answer?: string;
  funnel_stage?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const BASE_URL = 'https://delsolprimehomes.com';

/**
 * Generate FAQPage schema from extracted FAQs
 */
export function generateFAQPageSchema(faqs: FAQ[]): any {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".speakable-answer"]
        }
      }
    }))
  };
}

/**
 * Generate QAPage schema with speakable content
 */
export function generateQAPageSchema(article: SchemaArticle): any {
  const articleUrl = `${BASE_URL}/qa/${article.slug}`;
  
  return {
    "@type": "QAPage",
    "inLanguage": article.language || 'en',
    "headline": article.title,
    "description": article.excerpt || article.content.substring(0, 200),
    "url": articleUrl,
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "author": {
      "@type": "Person",
      "name": article.author?.name || "Maria Rodriguez",
      "jobTitle": article.author?.title || "Senior Real Estate Advisor",
      "email": article.author?.email || "maria@delsolprimehomes.com",
      "url": article.author?.url || `${BASE_URL}/team/maria-rodriguez`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Del Sol Prime Homes",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/assets/DelSolPrimeHomes-Logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "keywords": article.tags?.join(', '),
    "about": {
      "@type": "Thing",
      "name": article.topic
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".speakable-summary", ".speakable-answer", ".key-takeaways"]
    }
  };
}

/**
 * Generate BlogPosting schema with comprehensive metadata
 */
export function generateBlogPostingSchema(article: SchemaArticle): any {
  const articleUrl = `${BASE_URL}/blog/${article.slug}`;
  
  const schema: any = {
    "@type": "BlogPosting",
    "headline": article.title,
    "inLanguage": article.language || 'en',
    "description": article.excerpt,
    "url": articleUrl,
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "author": {
      "@type": "Person",
      "name": article.author?.name || "Maria Rodriguez",
      "jobTitle": article.author?.title || "Senior Real Estate Advisor",
      "email": article.author?.email || "maria@delsolprimehomes.com",
      "url": article.author?.url || `${BASE_URL}/team/maria-rodriguez`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Del Sol Prime Homes",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/assets/DelSolPrimeHomes-Logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "keywords": article.tags?.join(', '),
    "articleSection": article.topic,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".speakable-summary", ".key-takeaways", ".speakable-content"]
    }
  };

  // Add image if available
  if (article.featured_image) {
    schema.image = {
      "@type": "ImageObject",
      "url": article.featured_image,
      "caption": article.image_alt || article.title
    };
  }

  // Add reviewer if available
  if (article.reviewer) {
    schema.reviewedBy = {
      "@type": "Person",
      "name": article.reviewer.name,
      "jobTitle": article.reviewer.credentials || "Real Estate Expert"
    };
  }

  return schema;
}

/**
 * Generate Place schema for location-specific content
 */
export function generatePlaceSchema(article: SchemaArticle): any | null {
  const city = article.city || 'Costa del Sol';
  
  // Default coordinates for Costa del Sol
  let coordinates = {
    latitude: 36.5100,
    longitude: -4.8826
  };

  // Use article geo_coordinates if available
  if (article.geo_coordinates) {
    coordinates = {
      latitude: article.geo_coordinates.latitude || coordinates.latitude,
      longitude: article.geo_coordinates.longitude || coordinates.longitude
    };
  }

  return {
    "@type": "Place",
    "name": city,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": coordinates.latitude,
      "longitude": coordinates.longitude
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city === 'Costa del Sol' ? "Málaga" : city,
      "addressRegion": "Andalusia",
      "addressCountry": "ES"
    }
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ label: string; href?: string }>): any {
  return {
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      "item": crumb.href ? `${BASE_URL}${crumb.href}` : undefined
    }))
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): any {
  return {
    "@type": "RealEstateAgent",
    "name": "Del Sol Prime Homes",
    "url": BASE_URL,
    "logo": `${BASE_URL}/assets/DelSolPrimeHomes-Logo.png`,
    "description": "Luxury real estate specialist in Costa del Sol, Spain. Expert property advisors helping international clients find their dream homes in Marbella, Estepona, and surrounding areas.",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Andalusia",
      "addressCountry": "ES"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Costa del Sol"
    },
    "knowsAbout": [
      "Luxury Real Estate",
      "Property Investment",
      "International Property Sales",
      "Costa del Sol Real Estate Market"
    ]
  };
}

/**
 * Generate comprehensive @graph schema structure
 */
export function generateComprehensiveSchema(
  article: SchemaArticle,
  type: 'qa' | 'blog',
  faqs: FAQ[] = [],
  breadcrumbs?: Array<{ label: string; href?: string }>
): any {
  const graph: any[] = [];

  // Add main article schema (QAPage or BlogPosting)
  if (type === 'qa') {
    graph.push(generateQAPageSchema(article));
  } else {
    graph.push(generateBlogPostingSchema(article));
  }

  // Add FAQPage schema if FAQs are available
  const faqSchema = generateFAQPageSchema(faqs);
  if (faqSchema) {
    graph.push(faqSchema);
  }

  // Add Place schema for location context
  const placeSchema = generatePlaceSchema(article);
  if (placeSchema) {
    graph.push(placeSchema);
  }

  // Add BreadcrumbList schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    graph.push(generateBreadcrumbSchema(breadcrumbs));
  }

  // Add Organization schema
  graph.push(generateOrganizationSchema());

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}
