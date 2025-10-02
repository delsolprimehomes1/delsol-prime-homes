import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { generateComprehensiveSchema } from '@/utils/generateSchema';
import { extractFAQsFromMarkdown, extractFAQsFromJSON, combineFAQs } from '@/utils/extractFAQs';

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
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

interface SchemaMarkupProps {
  article: ArticleData;
  type: 'qa' | 'blog';
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

/**
 * Comprehensive Schema Markup Component with @graph structure
 * Supports QAPage, BlogPosting, FAQPage, Place, and Organization schemas
 * Includes speakable content optimization for voice search
 */
export const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ 
  article, 
  type,
  breadcrumbs 
}) => {
  // Generate comprehensive schema with @graph structure
  const schema = useMemo(() => {
    // Extract FAQs from multiple sources
    const contentFAQs = extractFAQsFromMarkdown(article.content);
    const jsonFAQs = extractFAQsFromJSON(article.speakable_questions || []);
    const faqs = combineFAQs(contentFAQs, jsonFAQs, 10);

    // Generate comprehensive @graph schema
    return generateComprehensiveSchema(article, type, faqs, breadcrumbs);
  }, [article, type, breadcrumbs]);

  return (
    <Helmet>
      {/* Comprehensive @graph Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schema, null, 2)}
      </script>
    </Helmet>
  );
};
