import { supabase } from '@/integrations/supabase/client';

interface BlogLink {
  targetId: string;
  targetType: 'QA' | 'Blog';
  relation: string;
}

interface BlogImage {
  filename: string;
  alt: string;
  caption?: string;
  description?: string;
}

interface BlogFieldData {
  title: string;
  content: string;
  excerpt: string;
  canonicalUrl: string;
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  qaArticleId: string;
  links: BlogLink[];
  images: BlogImage[];
  language: string;
}

interface ProcessResult {
  success: boolean;
  blogId?: string;
  error?: string;
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

/**
 * Generate comprehensive JSON-LD schemas for blog post
 */
function generateBlogSchemas(
  blogData: BlogFieldData,
  blogId: string,
  slug: string
): object {
  const baseUrl = 'https://delsolprimehomes.com';
  const blogUrl = `${baseUrl}/en/blog/${slug}`;

  return {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      '@id': `${baseUrl}/#organization`,
      name: 'DelSolPrimeHomes',
      legalName: 'DelSolPrimeHomes SL',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/DelSolPrimeHomes-Logo.png`
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+34-XXX-XXX-XXX',
        contactType: 'customer service',
        areaServed: ['ES', 'Málaga', 'Costa del Sol'],
        availableLanguage: ['en', 'es', 'nl', 'de', 'fr']
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ES',
        addressRegion: 'Andalucía',
        addressLocality: 'Málaga'
      },
      sameAs: [
        'https://www.linkedin.com/company/delsolprimehomes',
        'https://www.youtube.com/@delsolprimehomes'
      ]
    },
    person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${baseUrl}/#author`,
      name: 'Hans Beeckman',
      jobTitle: 'Accredited Real Estate Agent',
      worksFor: {
        '@id': `${baseUrl}/#organization`
      },
      url: `${baseUrl}/about`,
      knowsAbout: ['Real Estate', 'Costa del Sol', 'Property Investment', 'Luxury Homes']
    },
    blogPosting: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${blogUrl}#blogposting`,
      headline: blogData.title,
      description: blogData.excerpt,
      url: blogUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': blogUrl
      },
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: {
        '@id': `${baseUrl}/#author`
      },
      publisher: {
        '@id': `${baseUrl}/#organization`
      },
      image: blogData.images.length > 0 ? {
        '@type': 'ImageObject',
        url: blogData.images[0].filename,
        caption: blogData.images[0].caption
      } : undefined,
      articleBody: blogData.content,
      keywords: extractKeywords(blogData.content),
      isPartOf: {
        '@type': 'CreativeWorkSeries',
        '@id': `${baseUrl}/qa/${blogData.qaArticleId}#cluster`
      },
      spatialCoverage: {
        '@type': 'Place',
        name: 'Costa del Sol',
        address: {
          '@type': 'PostalAddress',
          addressRegion: 'Andalucía',
          addressCountry: 'ES'
        }
      }
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${baseUrl}/en/blog`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: blogData.title,
          item: blogUrl
        }
      ]
    },
    speakable: {
      '@context': 'https://schema.org',
      '@type': 'SpeakableSpecification',
      cssSelector: ['#blog-content', '.blog-excerpt'],
      xpath: ['/html/body//article']
    }
  };
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string[] {
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  const words = content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate markdown frontmatter
 */
function generateFrontmatter(blogData: BlogFieldData, slug: string, schemas: object): string {
  const frontmatter = {
    title: blogData.title,
    slug,
    excerpt: blogData.excerpt,
    canonical_url: blogData.canonicalUrl,
    funnel_stage: blogData.funnelStage,
    language: blogData.language,
    date_published: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    author: 'Hans Beeckman',
    reading_time_minutes: calculateReadingTime(blogData.content),
    keywords: extractKeywords(blogData.content),
    schemas,
    hreflang: [
      { lang: 'en', url: `https://delsolprimehomes.com/en/blog/${slug}` },
      { lang: 'es', url: `https://delsolprimehomes.com/es/blog/${slug}` },
      { lang: 'nl', url: `https://delsolprimehomes.com/nl/blog/${slug}` },
      { lang: 'de', url: `https://delsolprimehomes.com/de/blog/${slug}` },
      { lang: 'fr', url: `https://delsolprimehomes.com/fr/blog/${slug}` },
      { lang: 'x-default', url: `https://delsolprimehomes.com/en/blog/${slug}` }
    ],
    images: blogData.images.map(img => ({
      filename: img.filename,
      alt: img.alt,
      caption: img.caption,
      description: img.description
    }))
  };

  return JSON.stringify(frontmatter, null, 2);
}

/**
 * Main processing function for blog fields
 */
export async function processBlogFields(data: BlogFieldData): Promise<ProcessResult> {
  try {
    console.log('Processing blog fields:', data.title);

    // Generate slug
    const slug = generateSlug(data.title);

    // Check for existing blog with same slug
    const { data: existingBlog } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .eq('language', data.language)
      .maybeSingle();

    if (existingBlog) {
      return {
        success: false,
        error: 'A blog with this title already exists'
      };
    }

    // Generate schemas
    const schemas = generateBlogSchemas(data, '', slug);

    // Create frontmatter
    const frontmatter = generateFrontmatter(data, slug, schemas);

    // Insert blog post
    const { data: blogPost, error: blogError } = await supabase
      .from('blog_posts')
      .insert({
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        featured_image: data.images.length > 0 ? data.images[0].filename : '',
        image_alt: data.images.length > 0 ? data.images[0].alt : '',
        category_key: 'general',
        funnel_stage: data.funnelStage,
        language: data.language,
        canonical_url: data.canonicalUrl,
        meta_title: data.title,
        meta_description: data.excerpt,
        keywords: extractKeywords(data.content),
        reading_time_minutes: calculateReadingTime(data.content),
        toc_data: {},
        status: 'published',
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (blogError) {
      console.error('Blog post insert error:', blogError);
      throw new Error(`Failed to insert blog post: ${blogError.message || JSON.stringify(blogError)}`);
    }

    const blogId = blogPost.id;

    // Insert blog images
    if (data.images.length > 0) {
      const { error: imagesError } = await supabase
        .from('blog_images')
        .insert(
          data.images.map((img, idx) => ({
            blog_post_id: blogId,
            filename: img.filename,
            alt: img.alt,
            caption: img.caption,
            description: img.description,
            sort_order: idx,
            exif: {
              Camera: 'AI Generated',
              Software: 'LovableAI'
            }
          }))
        );

      if (imagesError) {
        console.error('Failed to insert images:', imagesError);
      }
    }

    // Insert blog links
    if (data.links.length > 0) {
      const { error: linksError } = await supabase
        .from('blog_links')
        .insert(
          data.links.map(link => ({
            blog_post_id: blogId,
            target_id: link.targetId,
            target_type: link.targetType,
            relation: link.relation
          }))
        );

      if (linksError) {
        console.error('Failed to insert links:', linksError);
      }
    }

    console.log('Blog published successfully:', blogId);

    return {
      success: true,
      blogId
    };
  } catch (error) {
    console.error('Error processing blog fields:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}