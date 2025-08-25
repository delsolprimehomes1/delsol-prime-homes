import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import BlogCard from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, ArrowLeft, ExternalLink, Home, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  image_alt: string;
  category_key: string;
  published_at: string;
  updated_at: string;
  language: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  canonical_url?: string;
  author?: string;
  city_tags?: string[];
  tags?: string[];
}

interface RelatedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  image_alt: string;
  category_key: string;
  published_at: string;
  language: string;
}

interface BlogCategory {
  key: string;
  name: string;
  language: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBlogPost(slug);
    }
  }, [slug, i18n.language]);

  const fetchBlogPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const currentLanguage = i18n.language || 'en';

      // Fetch blog post
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', postSlug)
        .eq('language', currentLanguage)
        .eq('status', 'published')
        .single();

      if (postError) {
        if (postError.code === 'PGRST116') {
          setError('Blog post not found');
        } else {
          console.error('Error fetching blog post:', postError);
          setError('Failed to load blog post');
        }
        return;
      }

      setPost(postData);

      // Fetch category
      const { data: categoryData } = await supabase
        .from('blog_categories')
        .select('key, name, language')
        .eq('key', postData.category_key)
        .eq('language', currentLanguage)
        .single();

      setCategory(categoryData);

      // Fetch related posts
      const { data: relatedData } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, image_alt, category_key, published_at, language')
        .eq('language', currentLanguage)
        .eq('status', 'published')
        .neq('id', postData.id)
        .or(`category_key.eq.${postData.category_key},city_tags.cs.{${postData.city_tags?.join(',') || ''}}`)
        .order('published_at', { ascending: false })
        .limit(3);

      setRelatedPosts(relatedData || []);
    } catch (error) {
      console.error('Error in fetchBlogPost:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const generateStructuredData = () => {
    if (!post) return '';

    const baseUrl = 'https://delsolprimehomes.com';
    
    const blogPosting = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.meta_description || post.excerpt,
      "inLanguage": post.language,
      "articleSection": category?.name || post.category_key,
      "keywords": post.keywords?.join(', ') || post.tags?.join(', ') || '',
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

    return JSON.stringify([blogPosting, breadcrumbList]);
  };

  // Sample FAQ data - in real implementation this would come from the database
  const sampleFAQs: FAQ[] = [
    {
      question: `What makes ${post?.city_tags?.[0] || 'Costa del Sol'} properties a good investment?`,
      answer: `${post?.city_tags?.[0] || 'Costa del Sol'} offers strong rental yields, year-round demand, and excellent capital appreciation potential due to its prime location and luxury amenities.`
    },
    {
      question: "How long does the buying process typically take?",
      answer: "The typical property purchase process takes 6-8 weeks from offer acceptance to completion, depending on financing and legal requirements."
    },
    {
      question: "What additional costs should I budget for?",
      answer: "Budget approximately 10-12% of the purchase price for taxes, legal fees, notary costs, and registration fees."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-accent/10">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-1/2 mb-8" />
              <div className="aspect-video bg-muted rounded-2xl mb-8" />
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-accent/10">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {error === 'Blog post not found' ? t('blog.postNotFound', 'Post Not Found') : t('blog.error', 'Error')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {error === 'Blog post not found' 
                ? t('blog.postNotFoundDescription', 'The blog post you are looking for does not exist.') 
                : t('blog.errorDescription', 'Something went wrong while loading the blog post.')
              }
            </p>
            <Button onClick={() => navigate('/blog')} className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.backToBlog', 'Back to Blog')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | Del Sol Prime Homes</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta name="keywords" content={post.keywords?.join(', ') || post.tags?.join(', ') || ''} />
        <link rel="canonical" href={post.canonical_url || `https://delsolprimehomes.com/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt} />
        <meta property="og:image" content={post.featured_image.startsWith('http') ? post.featured_image : `https://delsolprimehomes.com${post.featured_image}`} />
        <meta property="og:url" content={post.canonical_url || `https://delsolprimehomes.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:modified_time" content={post.updated_at} />
        <meta property="article:author" content={post.author || 'DelSolPrimeHomes'} />
        <meta property="article:section" content={category?.name || post.category_key} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title || post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt} />
        <meta name="twitter:image" content={post.featured_image.startsWith('http') ? post.featured_image : `https://delsolprimehomes.com${post.featured_image}`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {generateStructuredData()}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-accent/10">
        <Navbar />
        
        <article className="pt-24 pb-16">
          {/* Breadcrumbs */}
          <nav className="px-4 mb-8" aria-label="Breadcrumb">
            <div className="max-w-4xl mx-auto">
              <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                <li>
                  <a href="/" className="hover:text-primary transition-colors">
                    <Home className="w-4 h-4" />
                  </a>
                </li>
                <ChevronRight className="w-4 h-4" />
                <li>
                  <a href="/blog" className="hover:text-primary transition-colors">
                    {t('blog.title', 'Blog')}
                  </a>
                </li>
                <ChevronRight className="w-4 h-4" />
                <li>
                  <span className="text-foreground">{category?.name || post.category_key}</span>
                </li>
                <ChevronRight className="w-4 h-4" />
                <li className="truncate">
                  <span className="text-foreground">{post.title}</span>
                </li>
              </ol>
            </div>
          </nav>

          {/* Article Header */}
          <header className="px-4 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/blog')}
                  className="bg-white/80 backdrop-blur-sm border-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('blog.backToBlog', 'Back to Blog')}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {category?.name || post.category_key}
                </Badge>
                {post.city_tags?.map((city) => (
                  <Badge key={city} variant="outline" className="border-primary/20 text-primary">
                    {city}
                  </Badge>
                ))}
              </div>

              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                </div>
                {post.updated_at !== post.published_at && (
                  <div className="flex items-center gap-2">
                    <span>Updated:</span>
                    <time dateTime={post.updated_at}>
                      {formatDate(post.updated_at)}
                    </time>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{calculateReadingTime(post.content)} min read</span>
                </div>
                <div>
                  <span>By {post.author || 'DelSolPrimeHomes'}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Image */}
          <div className="px-4 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-elegant">
                <img
                  src={post.featured_image}
                  alt={post.image_alt}
                  title={post.meta_title || post.title}
                  className="w-full aspect-video object-cover"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>

          {/* TLDR Section */}
          <div className="px-4 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  {t('blog.tldr', 'TL;DR - Key Takeaways')}
                </h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Prime coastal locations offer the strongest investment potential</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Sea views and modern amenities drive premium pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span>Year-round rental demand ensures steady returns</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="px-4 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-muted-foreground">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="px-4 mb-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-6">
                {t('blog.frequentlyAskedQuestions', 'Frequently Asked Questions')}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {sampleFAQs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl px-6"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <span className="font-medium text-foreground">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="px-4 mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-8 text-center">
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  {t('blog.nextSteps', 'Ready to Take the Next Step?')}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  {t('blog.nextStepsDescription', 'Discover exceptional properties in the areas mentioned in this article and start your Costa del Sol investment journey.')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('blog.bookViewing', 'Book Private Viewing')}
                  </Button>
                  <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-sm border-white/20">
                    {t('blog.exploreProperties', `Explore Properties in ${post.city_tags?.[0] || 'Costa del Sol'}`)}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <>
              <Separator className="my-12" />
              <div className="px-4">
                <div className="max-w-7xl mx-auto">
                  <h2 className="font-heading text-2xl font-semibold text-foreground mb-8 text-center">
                    {t('blog.relatedArticles', 'Related Articles')}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedPosts.map((relatedPost) => (
                      <BlogCard
                        key={relatedPost.id}
                        post={relatedPost}
                        categoryName={category?.name || relatedPost.category_key}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </>
  );
};

export default BlogPost;