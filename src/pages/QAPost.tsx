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
        
        {/* Enhanced JSON-LD Structured Data for AI/LLM Optimization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.excerpt,
            "author": {
              "@type": "Organization",
              "name": "DelSolPrimeHomes",
              "url": "https://delsolprimehomes.com",
              "sameAs": [
                "https://www.facebook.com/delsolprimehomes",
                "https://www.instagram.com/delsolprimehomes"
              ]
            },
            "publisher": {
              "@type": "Organization",
              "name": "DelSolPrimeHomes",
              "logo": {
                "@type": "ImageObject",
                "url": "https://delsolprimehomes.com/logo.png"
              }
            },
            "inLanguage": article.language || "en",
            "about": {
              "@type": "Thing",
              "name": `Costa del Sol Property ${article.topic}`,
              "description": `Expert guidance on ${article.topic} for Costa del Sol property buyers`
            },
            "keywords": article.tags ? article.tags.join(", ") : "",
            "mainEntity": {
              "@type": "Question", 
              "name": article.title,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": article.content.replace(/<[^>]*>/g, '').substring(0, 500) + "...",
                "author": {
                  "@type": "Organization",
                  "name": "DelSolPrimeHomes"
                }
              }
            },
            "dateCreated": article.created_at,
            "dateModified": article.last_updated,
            "datePublished": article.created_at,
            "url": `https://delsolprimehomes.com/qa/${article.slug}`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://delsolprimehomes.com/qa/${article.slug}`
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": {
              "@type": "Question",
              "name": article.title,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": article.content.replace(/<[^>]*>/g, ''),
                "author": {
                  "@type": "Organization",
                  "name": "DelSolPrimeHomes"
                }
              }
            },
            "about": {
              "@type": "Place",
              "name": "Costa del Sol",
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "36.5201",
                "longitude": "-4.8773"
              }
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": article.title,
            "description": article.excerpt,
            "inLanguage": article.language || "en",
            "url": `https://delsolprimehomes.com/qa/${article.slug}`,
            "isPartOf": {
              "@type": "WebSite",
              "name": "DelSolPrimeHomes",
              "url": "https://delsolprimehomes.com"
            },
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": ["h1", "h2", "h3", ".short-answer", ".detailed-content", ".qa-content"],
              "xpath": [
                "//h1",
                "//h2", 
                "//h3",
                "//*[@class='short-answer']",
                "//*[@class='detailed-content']"
              ]
            },
            "potentialAction": {
              "@type": "ReadAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `https://delsolprimehomes.com/qa/${article.slug}`
              }
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DelSolPrimeHomes",
            "url": "https://delsolprimehomes.com",
            "logo": "https://delsolprimehomes.com/logo.png",
            "description": "Premier Costa del Sol property specialists helping international buyers find their perfect Spanish home",
            "areaServed": {
              "@type": "Place",
              "name": "Costa del Sol, Spain"
            },
            "serviceType": "Real Estate Services",
            "knowsAbout": [
              "Costa del Sol Property Market",
              "Spanish Property Law",
              "International Property Investment",
              "Expat Relocation Services"
            ]
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

        {/* Quick Answer Section */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6 sm:p-8 bg-primary/5 border-primary/20 animate-fade-in animation-delay-400">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-4 speakable">Quick Answer</h2>
                    <div className="short-answer text-lg text-muted-foreground leading-relaxed">
                      {article.excerpt}
                    </div>
                    <div className="mt-6">
                      <Button 
                        asChild
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        <a href={getCTALink(article.funnel_stage)}>
                          {getCTAText(article.funnel_stage)}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8 animate-fade-in animation-delay-500">
                {/* Split content into sections for better readability */}
                {article.content.split('\n\n').filter(section => section.trim()).map((section, index) => {
                  const processedSection = processMarkdownContent(section);
                  
                  // Check if this is a header section
                  const isHeader = section.includes('#');
                  const isListSection = section.includes('- ') || section.includes('* ');
                  
                  return (
                    <div key={index} className="space-y-4">
                      <div 
                        className={`qa-content detailed-content ${isHeader ? 'speakable' : ''} ${
                          isListSection ? 'bg-muted/30 p-6 rounded-lg border-l-4 border-l-primary/30' : ''
                        } ${isHeader ? 'mb-8' : 'mb-6'}`}
                        dangerouslySetInnerHTML={{ __html: processedSection }}
                      />
                      
                      {/* Add mid-content CTA after every 3rd section */}
                      {index > 0 && (index + 1) % 3 === 0 && (
                        <Card className="p-6 bg-accent/5 border-accent/20 text-center">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-left sm:text-left">
                              <h3 className="font-semibold text-foreground mb-2">
                                Need More Information?
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Get personalized guidance for your Costa del Sol property journey
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              asChild
                              className="flex-shrink-0"
                            >
                              <a href={getCTALink(article.funnel_stage)}>
                                Learn More
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </a>
                            </Button>
                          </div>
                        </Card>
                      )}
                    </div>
                  );
                })}
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