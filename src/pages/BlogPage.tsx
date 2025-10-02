import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import { TOC } from '@/components/TOC';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AuthorBio } from '@/components/AuthorBio';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { NextStepPreview } from '@/components/NextStepPreview';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BlogReadingProgress } from '@/components/blog/BlogReadingProgress';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { Calendar, Clock, Home, ChevronRight } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

const BlogPage = () => {
  const { slug } = useParams();
  const { i18n } = useTranslation();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug, i18n.language],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('language', i18n.language)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Calculate reading time
  const readingTime = post?.content 
    ? Math.ceil(post.content.split(' ').length / 200) 
    : 0;

  // Prepare breadcrumbs for schema
  const breadcrumbItems = post ? [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.category_key }
  ] : [];

  // Track page view
  React.useEffect(() => {
    if (post) {
      trackEvent('blog_post_view', {
        post_slug: post.slug,
        category: post.category_key
      });
    }
  }, [post]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <BlogReadingProgress />
        <main className="min-h-screen pt-24 bg-gradient-to-br from-background via-background/90 to-accent/10">
          <div className="container mx-auto px-4 py-12">
            <SkeletonLoader variant="card" />
          </div>
        </main>
      </>
    );
  }

  if (error || !post) {
    return <Navigate to="/blog" replace />;
  }

  // Extract next step from JSONB field
  const nextStepData = post.next_step as any;
  const nextStep = nextStepData && typeof nextStepData === 'object' ? {
    title: nextStepData.title || 'Continue Reading',
    url: nextStepData.url,
    slug: nextStepData.slug,
    cta: nextStepData.cta || 'Read More',
    preview: nextStepData.preview,
    funnelStage: nextStepData.funnelStage as 'TOFU' | 'MOFU' | 'BOFU' | undefined
  } : null;

  return (
    <>
      {/* SEO Head */}
      <Helmet>
        <title>{post.meta_title || post.title} | Del Sol Prime Homes</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta name="keywords" content={post.keywords?.join(', ')} />
        <link rel="canonical" href={post.canonical_url || `https://delsolprimehomes.com/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt} />
        <meta property="og:image" content={post.featured_image} />
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title || post.title} />
        <meta name="twitter:description" content={post.meta_description || post.excerpt} />
        <meta name="twitter:image" content={post.featured_image} />
      </Helmet>

      {/* Structured Data */}
      <SchemaMarkup 
        article={{
          ...post,
          speakable_questions: Array.isArray(post.speakable_questions) 
            ? post.speakable_questions 
            : []
        }} 
        type="blog"
        breadcrumbs={breadcrumbItems}
      />

      <BlogReadingProgress />
      <Navbar />

      <main className="min-h-screen pt-24 bg-gradient-to-br from-background via-background/90 to-accent/10">
        <article className="container mx-auto px-4 py-12">
          {/* Breadcrumbs */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors"><Home className="w-4 h-4" /></a></li>
              <ChevronRight className="w-4 h-4" />
              <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
              <ChevronRight className="w-4 h-4" />
              <li><span className="text-foreground">{post.category_key}</span></li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Hero Section */}
              <Card className="overflow-hidden">
                <header className="p-6 sm:p-8">
                  {/* Category & Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      {post.category_key}
                    </Badge>
                    {post.city_tags?.map((city) => (
                      <Badge key={city} variant="outline">{city}</Badge>
                    ))}
                  </div>

                  {/* H1 Title */}
                  <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                    {post.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <time>{new Date(post.published_at).toLocaleDateString()}</time>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{readingTime} min read</span>
                    </div>
                    <span>By {post.author || 'DelSolPrimeHomes'}</span>
                  </div>
                </header>

                {/* Featured Image */}
                {post.featured_image && (
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={post.featured_image}
                      alt={post.image_alt}
                      className="w-full h-full object-cover"
                      loading="eager"
                      fetchPriority="high"
                    />
                  </div>
                )}
              </Card>

              {/* Article Content */}
              <Card className="p-6 sm:p-8">
                <MarkdownRenderer content={post.content} />
              </Card>

              {/* Author Bio */}
              <AuthorBio
                name={post.author || 'DelSolPrimeHomes Team'}
                title="Real Estate Expert"
                bio="Specializing in luxury properties and investment opportunities on the Costa del Sol, with over 15 years of experience helping international clients find their dream homes."
                credentials={[
                  'Licensed Real Estate Agent',
                  'Property Investment Advisor',
                  'Certified Negotiator'
                ]}
                experience="15+ years in Costa del Sol real estate"
                expertise={[
                  'Luxury Property Sales',
                  'Investment Analysis',
                  'International Real Estate',
                  'Market Trends'
                ]}
                email="info@delsolprimehomes.com"
                profileUrl="https://delsolprimehomes.com/team"
              />

              {/* Next Step */}
              {nextStep && (
                <NextStepPreview
                  nextStep={nextStep}
                  currentTopic={post.category_key}
                  currentStage="MOFU"
                  currentSlug={post.slug}
                />
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <TOC content={post.content} />
            </aside>
          </div>
        </article>
      </main>
    </>
  );
};

export default BlogPage;
