import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { type SupportedLanguage } from '@/i18n';
import Navbar from '@/components/Navbar';
import { TOC } from '@/components/TOC';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AuthorBio } from '@/components/AuthorBio';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { NextStepPreview } from '@/components/NextStepPreview';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useFunnelNavigation } from '@/hooks/useFunnelNavigation';
import { ArticleMetadata } from '@/components/ArticleMetadata';
import { RecentlyUpdatedWidget } from '@/components/RecentlyUpdatedWidget';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

const QAPage = () => {
  const { slug, lang } = useParams();
  const { currentLanguage } = useLanguage();
  const detectedLanguage: SupportedLanguage = (lang as SupportedLanguage) || currentLanguage;

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['qa-article', slug, detectedLanguage],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('qa_articles' as any)
        .select('*')
        .eq('slug', slug)
        .eq('language', detectedLanguage)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });

  // Fetch next step using new hook
  const { nextStep } = useFunnelNavigation({
    slug: article?.slug || '',
    topic: article?.topic || '',
    funnelStage: article?.funnel_stage || '',
    language: detectedLanguage,
  });

  // Calculate reading time
  const readingTime = article?.content 
    ? Math.ceil(article.content.split(' ').length / 200) 
    : 0;

  // Track page view
  React.useEffect(() => {
    if (article) {
      trackEvent('qa_article_view', {
        article_slug: article.slug,
        funnel_stage: article.funnel_stage,
        topic: article.topic
      });
    }
  }, [article]);

  // Generate breadcrumb items
  const breadcrumbItems = article ? [
    { label: 'Home', href: '/' },
    { label: 'FAQ', href: '/faq' },
    { 
      label: article.topic || 'General', 
      href: `/faq?topic=${encodeURIComponent(article.topic || 'general')}` 
    },
    { label: article.title, current: true }
  ] : [];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <SkeletonLoader variant="card" />
          </div>
        </main>
      </>
    );
  }

  if (error || !article) {
    return <Navigate to="/faq" replace />;
  }

  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-600 border-blue-200',
    MOFU: 'bg-orange-500/10 text-orange-600 border-orange-200',
    BOFU: 'bg-green-500/10 text-green-600 border-green-200'
  };

  return (
    <>
      {/* SEO Head */}
      <Helmet>
        <title>{article.title} | Del Sol Prime Homes</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={article.tags?.join(', ')} />
        <link rel="canonical" href={`https://delsolprimehomes.com/qa/${article.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://delsolprimehomes.com/qa/${article.slug}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
      </Helmet>

      {/* Structured Data */}
      <SchemaMarkup article={article} type="qa" />

      {/* Reading Progress */}
      <ReadingProgressBar articleSlug={article.slug} />

      <Navbar />

      <main className="min-h-screen pt-20 bg-background">
        <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumbs */}
          <Breadcrumb items={breadcrumbItems} className="mb-8" />

          {/* Article Metadata */}
          <ArticleMetadata
            updatedAt={article.updated_at}
            author={typeof article.author === 'string' ? article.author : article.author?.name || 'DelSol Prime Homes'}
            reviewer={typeof article.reviewer === 'object' && article.reviewer ? (article.reviewer as any).name : undefined}
            language={detectedLanguage}
          />

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Article Header */}
              <Card className="p-6 sm:p-8">
                <header className="space-y-4">
                  {/* Funnel Stage Badge */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={stageColors[article.funnel_stage as keyof typeof stageColors]}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {article.funnel_stage}
                    </Badge>
                    {article.topic && (
                      <Badge variant="secondary">{article.topic}</Badge>
                    )}
                  </div>

                  {/* H1 Title */}
                  <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                    {article.title}
                  </h1>

                  {/* Excerpt */}
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <time>{new Date(article.created_at).toLocaleDateString()}</time>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{readingTime} min read</span>
                    </div>
                  </div>
                </header>
              </Card>

              {/* Article Content */}
              <Card className="p-6 sm:p-8">
                <MarkdownRenderer content={article.content} />
              </Card>

              {/* Author Bio */}
              <AuthorBio
                name="Hans Beeckman"
                title="Senior Real Estate Advisor"
                bio="Specializing in Costa del Sol luxury properties with 15+ years of experience helping international clients find their dream homes."
                credentials={[
                  'Licensed Real Estate Professional (GIPE)',
                  'RICS Member',
                  'Spanish Property Law Specialist'
                ]}
                experience="15+ years, €200M+ in transactions"
                expertise={[
                  'Luxury Property Valuation',
                  'International Investment',
                  'Costa del Sol Market Analysis'
                ]}
                email="maria@delsolprimehomes.com"
                profileUrl="https://delsolprimehomes.com/team/maria-rodriguez"
              />

              {/* Next Step Preview */}
              {nextStep && (
                <NextStepPreview
                  nextStep={nextStep}
                  currentTopic={article.topic}
                  currentStage={article.funnel_stage}
                  currentSlug={article.slug}
                />
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              <RecentlyUpdatedWidget 
                language={detectedLanguage} 
                limit={10}
                contentType="qa"
              />
              <TOC content={article.content} />
            </aside>
          </div>
        </article>
      </main>
    </>
  );
};

export default QAPage;
