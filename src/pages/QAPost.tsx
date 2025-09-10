import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { FunnelCTA } from '@/components/FunnelCTA';
import { Breadcrumb, generateBreadcrumbJsonLd } from '@/components/Breadcrumb';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Calendar, Tag, Clock } from 'lucide-react';
import { processMarkdownContent } from '@/utils/markdown';
import { trackEvent, trackFunnelProgression } from '@/utils/analytics';

const QAPost = () => {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['qa-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_articles' as any)
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });


  // Smart recommendations hook
  const { recommendations } = useSmartRecommendations({ 
    currentArticle: article, 
    maxRecommendations: 3 
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
        <main className="min-h-screen pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !article) {
    return <Navigate to="/qa" replace />;
  }

  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-700 border-blue-200',
    MOFU: 'bg-amber-500/10 text-amber-700 border-amber-200',
    BOFU: 'bg-green-500/10 text-green-700 border-green-200'
  };

  const stageLabels = {
    TOFU: 'Getting Started',
    MOFU: 'Researching Options', 
    BOFU: 'Ready to Buy'
  };

  const getCTAText = (stage: string) => {
    switch (stage) {
      case 'TOFU':
        return 'Learn More About Costa del Sol Properties';
      case 'MOFU':
        return 'Compare Properties in Your Area';
      case 'BOFU':
        return 'Schedule Your Free Consultation';
      default:
        return 'Get Started Today';
    }
  };

  const getCTALink = (stage: string) => {
    switch (stage) {
      case 'TOFU':
        return '/blog';
      case 'MOFU':
        return '/#properties';
      case 'BOFU':
        return '/#contact';
      default:
        return '/';
    }
  };

  return (
    <>
      <Helmet>
        <title>{article.title}</title>
        <meta name="description" content={article.excerpt} />
        {article.tags && <meta name="keywords" content={article.tags.join(', ')} />}
        <link rel="canonical" href={`https://delsolprimehomes.com/qa/${article.slug}`} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "author": {
              "@type": "Organization",
              "name": "DelSolPrimeHomes"
            },
            "inLanguage": article.language || "en",
            "mainEntity": {
              "@type": "Question",
              "name": article.title,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": article.excerpt
              }
            },
            "dateModified": article.last_updated,
            "url": `https://delsolprimehomes.com/qa/${article.slug}`
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "inLanguage": article.language || "en",
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": ["h1", ".short-answer"]
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbJsonLd(breadcrumbItems))}
        </script>
      </Helmet>
      
      {/* Reading Progress Bar */}
      <ReadingProgressBar articleSlug={article?.slug || ''} />
      
      <Navbar />
      
      <main className="min-h-screen pt-20">
        {/* Breadcrumb Navigation */}
        <section className="py-4 bg-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </section>
        {/* Article Header */}
        <section className="py-12 sm:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6 animate-fade-in">
                <Badge className={`${stageColors[article.funnel_stage as keyof typeof stageColors]} px-3 py-1`}>
                  {stageLabels[article.funnel_stage as keyof typeof stageLabels]}
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Updated {article.last_updated}</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{readingTime} min read</span>
                </div>
              </div>
              
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 animate-fade-in animation-delay-100">
                {article.title}
              </h1>
              
              <div className="short-answer text-lg sm:text-xl text-muted-foreground mb-8 p-6 bg-background/80 rounded-lg border animate-fade-in animation-delay-200">
                {article.excerpt}
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap animate-fade-in animation-delay-300">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {article.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none animate-fade-in animation-delay-400">
                <div 
                  className="qa-content space-y-2"
                  dangerouslySetInnerHTML={{ __html: processMarkdownContent(article.content) }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Funnel CTA Section */}
        <section className="py-12 bg-muted/50 animate-fade-in animation-delay-500">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <FunnelCTA 
                currentStage={article.funnel_stage as 'TOFU' | 'MOFU' | 'BOFU'}
                articleSlug={article.slug}
                nextStepRecommendations={recommendations}
              />
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default QAPost;