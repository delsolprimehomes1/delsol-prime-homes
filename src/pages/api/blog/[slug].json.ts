// This would be an API route in a framework like Next.js
// For now, creating a utility function to generate the LLM JSON format

export interface LLMBlogPost {
  slug: string;
  lang: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  cityTags: string[];
  datePublished: string;
  dateModified: string;
  canonical: string;
  image: {
    url: string;
    alt: string;
    title: string;
  };
  tldr: string[];
  qae: Array<{
    question: string;
    answer: string;
    evidence: string[];
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export const generateLLMBlogPost = (post: any, category?: any): LLMBlogPost => {
  const baseUrl = 'https://delsolprimehomes.com';
  
  return {
    slug: post.slug,
    lang: post.language,
    title: post.title,
    description: post.excerpt,
    category: category?.name || post.category_key,
    tags: post.tags || [],
    cityTags: post.city_tags || [],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    canonical: post.canonical_url || `${baseUrl}/blog/${post.slug}`,
    image: {
      url: post.featured_image,
      alt: post.image_alt,
      title: post.meta_title || post.title
    },
    tldr: [
      "Prime coastal locations offer the strongest investment potential",
      "Sea views and modern amenities drive premium pricing", 
      "Year-round rental demand ensures steady returns"
    ],
    qae: [
      {
        question: `Which ${post.city_tags?.[0] || 'Costa del Sol'} areas attract the most investor demand?`,
        answer: `${post.city_tags?.[0] || 'Marbella'} for brand value, prime coastal areas for new build choice, well-connected areas for accessibility.`,
        evidence: ["sales depth in prime zones", "new launch cycles", "transport connectivity"]
      },
      {
        question: "What features reduce time on market?",
        answer: "Sea views, parking, security, and turnkey finish.",
        evidence: ["historical days on market data"]
      }
    ],
    faq: [
      {
        question: `Is ${post.city_tags?.[0] || 'Marbella'} still the top area for resale depth?`,
        answer: `Yes, prime addresses in ${post.city_tags?.[0] || 'Marbella'} retain the deepest buyer pool.`
      }
    ]
  };
};