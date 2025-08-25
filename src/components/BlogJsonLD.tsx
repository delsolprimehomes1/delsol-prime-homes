import React from 'react';

interface BlogPost {
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  updated_at: string;
  featured_image: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  canonical_url?: string;
  author?: string;
  language: string;
}

interface BlogCategory {
  name: string;
}

interface BlogJsonLDProps {
  post: BlogPost;
  category?: BlogCategory;
}

export const BlogJsonLD: React.FC<BlogJsonLDProps> = ({ post, category }) => {
  const baseUrl = 'https://delsolprimehomes.com';
  
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description || post.excerpt,
    "inLanguage": post.language,
    "articleSection": category?.name || 'Real Estate',
    "keywords": post.keywords?.join(', ') || '',
    "mainEntityOfPage": post.canonical_url || `${baseUrl}/blog/${post.slug}`,
    "url": post.canonical_url || `${baseUrl}/blog/${post.slug}`,
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Organization",
      "name": post.author || "DelSolPrimeHomes"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DelSolPrimeHomes",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "image": {
      "@type": "ImageObject",
      "url": post.featured_image.startsWith('http') ? post.featured_image : `${baseUrl}${post.featured_image}`,
      "width": 1600,
      "height": 900
    }
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${baseUrl}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${baseUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": post.canonical_url || `${baseUrl}/blog/${post.slug}`
      }
    ]
  };

  const structuredData = JSON.stringify([blogPosting, breadcrumbList]);

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: structuredData }}
    />
  );
};