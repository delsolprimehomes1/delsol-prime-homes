import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
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
import { generateQAArticleSchema, generateAIServiceSchema, generateSpeakableSchema, generateOpenGraphData, generateTwitterCardData, generateCanonicalAndHreflang } from '@/utils/schemas';
import { generateEnhancedQAArticleSchema, generateAIEnhancedOrganizationSchema } from '@/utils/enhanced-schemas';

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

  // Generate enhanced schemas for AI/LLM optimization
  const enhancedArticleSchema = React.useMemo(() => 
    article ? generateEnhancedQAArticleSchema(article, recommendations) : null, 
    [article, recommendations]
  );
  
  const aiOrganizationSchema = React.useMemo(() => 
    generateAIEnhancedOrganizationSchema(article?.language || 'en'), 
    [article?.language]
  );

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
        return 'Book A Viewing';
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
        return '/book-viewing';
      default:
        return '/';
    }
  };

  return (
    <>
      <Helmet>
        <title>{article.title} - AI-Enhanced Costa del Sol Property Guide</title>
        <meta name="description" content={`${article.excerpt} Get AI-powered multilingual support for your Costa del Sol property journey.`} />
        {article.tags && <meta name="keywords" content={`${article.tags.join(', ')}, AI property assistant, multilingual support, Costa del Sol`} />}
        <link rel="canonical" href={`https://delsolprimehomes.com/qa/${article.slug}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:url" content={`https://delsolprimehomes.com/qa/${article.slug}`} />
        <meta property="og:site_name" content="DelSolPrimeHomes" />
        <meta property="og:image" content="https://delsolprimehomes.com/assets/qa-article-og.jpg" />
        <meta property="article:author" content="DelSolPrimeHomes Expert" />
        <meta property="article:section" content={article.topic} />
        <meta property="article:published_time" content={article.created_at} />
        <meta property="article:modified_time" content={article.last_updated} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content="https://delsolprimehomes.com/assets/qa-article-twitter.jpg" />
        
        {/* Enhanced JSON-LD Structured Data for Maximum AI/LLM Optimization */}
        {enhancedArticleSchema && (
          <script type="application/ld+json">
            {JSON.stringify(enhancedArticleSchema)}
          </script>
        )}
        
        <script type="application/ld+json">
          {JSON.stringify(aiOrganizationSchema)}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbJsonLd(breadcrumbItems))}
        </script>
        
        {/* AI-Specific Structured Data for Voice Search and LLM Citation */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["FAQPage", "WebPage"],
            "name": article.title,
            "description": article.excerpt,
            "url": `https://delsolprimehomes.com/qa/${article.slug}`,
            "inLanguage": article.language || "en",
            "isAccessibleForFree": true,
            "audience": {
              "@type": "Audience",
              "audienceType": "International Property Buyers"
            },
            "mainEntity": {
              "@type": "Question",
              "name": article.title,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": article.content.replace(/<[^>]*>/g, '').substring(0, 1000) + '...',
                "author": {
                  "@type": "Organization",
                  "name": "DelSolPrimeHomes",
                  "knowsAbout": ["AI Property Assistance", "Multilingual Support", "Costa del Sol Real Estate"]
                },
                "dateCreated": article.created_at,
                "upvoteCount": 0
              }
            },
            "about": [
              {
                "@type": "Place",
                "name": article.city,
                "containedInPlace": {
                  "@type": "AdministrativeArea",
                  "name": "Andalusia, Spain"
                }
              },
              {
                "@type": "Thing",
                "name": article.topic
              }
            ],
            "mentions": [
              {
                "@type": "SoftwareApplication",
                "name": "AI Property Assistant",
                "applicationCategory": "PropertyTech"
              },
              ...((article.tags || []).map(tag => ({
                "@type": "Thing",
                "name": tag
              })))
            ],
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": [
                "h1", "h2", "h3", ".short-answer", ".detailed-content", 
                ".qa-content", ".key-points", ".speakable"
              ],
              "xpath": [
                "//h1[1]",
                "//h2[position()<=3]",
                "//*[contains(@class, 'short-answer')]",
                "//*[contains(@class, 'detailed-content')]//p[position()<=3]",
                "//strong[contains(text(), 'important') or contains(text(), 'key')]",
                "//li[contains(text(), 'Costa del Sol') or contains(text(), 'property')]"
              ]
            },
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": `https://delsolprimehomes.com/qa/${article.slug}`
              },
              {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://delsolprimehomes.com/qa?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            ]
          })}
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
                              onClick={() => trackEvent('cta_click', { 
                                type: 'mid_content', 
                                destination: recommendations[0] ? `/qa/${recommendations[0].slug}` : '/qa',
                                recommended_article: recommendations[0]?.slug,
                                article_slug: article.slug 
                              })}
                            >
                              <Link to={recommendations[0] ? `/qa/${recommendations[0].slug}` : '/qa'}>
                                Learn More
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
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