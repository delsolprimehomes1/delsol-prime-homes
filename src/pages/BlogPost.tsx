import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import BlogCard from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, ArrowLeft, Home, ChevronRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BlogReadingProgress } from '@/components/blog/BlogReadingProgress';
import { BlogKeyTakeaways } from '@/components/blog/BlogKeyTakeaways';
import { BlogFAQSection } from '@/components/blog/BlogFAQSection';
import { BlogAuthorBio } from '@/components/blog/BlogAuthorBio';
import { BlogNextSteps } from '@/components/blog/BlogNextSteps';
import { VoiceSearchSummary } from '@/components/VoiceSearchSummary';
import { BlogJsonLD } from '@/components/BlogJsonLD';
import { TOCSticky } from '@/components/blog/TOCSticky';
import { 
  extractKeyTakeaways, 
  extractFAQs, 
  calculateVoiceReadingTime,
  extractSpeakableContent,
  generateVoiceKeywords 
} from '@/utils/blog-content-extractor';
import { processMarkdownContent } from '@/utils/markdown';

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

  // Extract structured content
  const keyTakeaways = post ? extractKeyTakeaways(post.content, post.excerpt) : [];
  const faqs = post ? extractFAQs(post.content, post.city_tags?.[0]) : [];
  const voiceReadingTime = post ? calculateVoiceReadingTime(post.content) : 0;
  const speakableContent = post ? extractSpeakableContent(post.content, post.excerpt) : '';
  const voiceKeywords = post ? generateVoiceKeywords(post.title, post.city_tags?.[0]) : [];

  const nextSteps = [
    {
      title: 'Book a Consultation',
      description: 'Schedule a free consultation with our property experts',
      icon: 'calendar' as const,
      action: 'Book Now',
      url: '/book-viewing',
      variant: 'default' as const
    },
    {
      title: 'Explore Properties',
      description: 'Browse our exclusive portfolio of premium properties',
      icon: 'message' as const,
      action: 'View Properties',
      url: '/qa',
      variant: 'secondary' as const
    },
    {
      title: 'Get Market Insights',
      description: 'Download our latest market analysis and investment guide',
      icon: 'phone' as const,
      action: 'Download Guide',
      url: '/blog',
      variant: 'outline' as const
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
      </Helmet>

      <BlogJsonLD post={post} category={category || undefined} />
      <BlogReadingProgress />

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

          {/* Enhanced Content Sections */}
          <div className="px-4 mb-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Key Takeaways */}
                  <BlogKeyTakeaways takeaways={keyTakeaways} />

                  {/* Voice Search Summary */}
                  <VoiceSearchSummary
                    summary={speakableContent}
                    keywords={voiceKeywords}
                    readingTime={voiceReadingTime}
                  />

                  {/* Article Content */}
                  <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-muted-foreground bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                    <div dangerouslySetInnerHTML={{ __html: processMarkdownContent(post.content) }} />
                  </div>

                  {/* FAQ Section */}
                  <BlogFAQSection faqs={faqs} />

                  {/* Author Bio */}
                  <BlogAuthorBio
                    name={post.author || 'DelSolPrimeHomes Team'}
                    title="Real Estate Expert"
                    bio="Specializing in luxury properties and investment opportunities on the Costa del Sol, with over 15 years of experience helping international clients find their dream homes."
                    credentials={['Licensed Real Estate Agent', 'Property Investment Advisor', 'Certified Negotiator']}
                    expertise={['Luxury Property Sales', 'Investment Analysis', 'International Real Estate', 'Market Trends']}
                    experience="15+ years in Costa del Sol real estate"
                    email="info@delsolprimehomes.com"
                    articleUrl={post.canonical_url || `https://delsolprimehomes.com/blog/${post.slug}`}
                  />

                  {/* Next Steps CTA */}
                  <BlogNextSteps steps={nextSteps} />
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-6">
                  {/* Table of Contents */}
                  <div className="lg:sticky lg:top-24">
                    <TOCSticky content={post.content} />
                  </div>
                </aside>
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