import React from 'react';
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { type SupportedLanguage } from '@/i18n';
import Navbar from '@/components/Navbar';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { FunnelCTA } from '@/components/FunnelCTA';
import { BookingChatbot } from '@/components/BookingChatbot';
import { AuthorCredentialsSchema } from '@/components/AuthorCredentialsSchema';
import { ReviewsSchema } from '@/components/ReviewsSchema';
import { Breadcrumb, generateBreadcrumbJsonLd } from '@/components/Breadcrumb';
import { FunnelNavigation } from '@/components/FunnelNavigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MultilingualAlert } from '@/components/MultilingualAlert';
import { MultilingualSEOHead } from '@/components/MultilingualSEOHead';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Calendar, Tag, Clock, Star, Shield, Award, CheckCircle } from 'lucide-react';
import { processMarkdownContent } from '@/utils/markdown';
import { trackEvent, trackFunnelProgression, trackCTAClick } from '@/utils/analytics';
import { generateQAArticleSchema, generateAIServiceSchema, generateSpeakableSchema, generateOpenGraphData, generateTwitterCardData, generateCanonicalAndHreflang } from '@/utils/schemas';
import { generateHreflangUrls, getCurrentLanguageFromUrl, detectLanguageFromSlug, constructDatabaseSlug } from '@/utils/multilingual-routing';
import { generateEnhancedQAArticleSchema, generateAIEnhancedOrganizationSchema } from '@/utils/enhanced-schemas';
import { AIOptimizedContent } from '@/components/AIOptimizedContent';
import { SchemaValidator } from '@/components/SchemaValidator';
import { QuickAnswerSection } from '@/components/QuickAnswerSection';
import { KeyTakeawaysSection } from '@/components/KeyTakeawaysSection';
import { VoiceSearchSummary } from '@/components/VoiceSearchSummary';
import { NextStepsSection } from '@/components/NextStepsSection';
import { FunnelCTATracker } from '@/components/FunnelCTATracker';
import { EnhancedFunnelProgress } from '@/components/EnhancedFunnelProgress';
import { EnhancedBOFUConversion } from '@/components/EnhancedBOFUConversion';
import { AIEnhancedContent } from '@/components/AIEnhancedContent';
import { AIContentOptimizer } from '@/components/AIContentOptimizer';
import EnhancedQAContent from '@/components/EnhancedQAContent';
import QAPageLayout from '@/components/qa/redesigned/QAPageLayout';
import { generateAIOptimizedContent, getEnhancedSpeakableSelectors } from '@/utils/ai-optimization';
import { generateMaximalAISchema } from '@/utils/comprehensive-ai-schemas';
import '@/styles/qa-redesign.css';
import { injectAIMetaTags } from '@/lib/aiScoring';

const QAPost = () => {
  const { slug, lang } = useParams();
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();
  const { currentLanguage, getContentCount } = useLanguage();
  const queryClient = useQueryClient();
  
  // Detect language from URL parameter (/:lang/qa/:slug) or default to current language
  const detectedLanguage: SupportedLanguage = (lang as SupportedLanguage) || currentLanguage;

  // Map legacy stage names to new user-friendly names
  const mapStageToUserFriendly = (stage: string | null | undefined): 'exploration' | 'research' | 'decision' => {
    if (!stage) {
      console.warn('Stage is null/undefined, defaulting to exploration');
      return 'exploration';
    }
    
    const upperStage = stage.toUpperCase().trim();
    switch (upperStage) {
      case 'TOFU': 
        return 'exploration';
      case 'MOFU': 
        return 'research'; 
      case 'BOFU': 
        return 'decision';
      case 'EXPLORATION':
        return 'exploration';
      case 'RESEARCH':
        return 'research';
      case 'DECISION':
        return 'decision';
      default: 
        console.warn(`Unknown stage "${stage}", defaulting to exploration`);
        return 'exploration';
    }
  };

  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey: ['qa-article', slug, detectedLanguage],
    queryFn: async () => {
      if (!slug) return null;
      
      // PRIORITY 1: Use language from URL route parameter (/:lang/qa/:slug)
      // This is the most reliable source when user navigates via language-prefixed URLs
      let { data, error } = await supabase
        .from('qa_articles' as any)
        .select('*')
        .eq('slug', slug)  // Use exact slug from URL
        .eq('language', detectedLanguage)  // Use language from route parameter
        .single();
      
      // If found, update i18n to match the article's language
      if (data && detectedLanguage !== currentLanguage) {
        i18n.changeLanguage(detectedLanguage);
        return data as any;
      }
      
      // PRIORITY 2: Detect language from slug prefix as fallback
      const { language: slugLanguage, cleanSlug } = detectLanguageFromSlug(slug);
      
      // Try with detected slug language if different from URL language
      if (!data && slugLanguage !== detectedLanguage) {
        const slugQuery = await supabase
          .from('qa_articles' as any)
          .select('*')
          .eq('slug', slug)
          .eq('language', slugLanguage)
          .single();
          
        if (slugQuery.data) {
          data = slugQuery.data;
          error = null;
          if (slugLanguage !== currentLanguage) {
            i18n.changeLanguage(slugLanguage);
          }
          return data as any;
        }
      }
      
      // PRIORITY 3: Try with clean slug if different
      if (!data && cleanSlug !== slug) {
        const cleanQuery = await supabase
          .from('qa_articles' as any)
          .select('*')
          .eq('slug', cleanSlug)
          .eq('language', detectedLanguage)
          .single();
          
        if (cleanQuery.data) {
          data = cleanQuery.data;
          error = null;
          return data as any;
        }
      }
      
      // PRIORITY 4: English fallback
      if (!data && detectedLanguage !== 'en') {
        const fallback = await supabase
          .from('qa_articles' as any)
          .select('*')
          .eq('slug', slug)
          .eq('language', 'en')
          .single();
        
        if (fallback.data) {
          return fallback.data as any;
        }
      }
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as any;
    },
    enabled: !!slug,
  });

  // Fetch linked articles for the funnel flow
  const { data: nextMofuArticle } = useQuery({
    queryKey: ['next-mofu-article', article?.points_to_mofu_id],
    queryFn: async () => {
      if (!article?.points_to_mofu_id) return null;
      
      const { data, error } = await supabase
        .from('qa_articles' as any)
        .select('slug, title')
        .eq('id', article.points_to_mofu_id)
        .eq('language', detectedLanguage)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data as any;
    },
    enabled: !!article?.points_to_mofu_id,
  });

  const { data: nextBofuArticle } = useQuery({
    queryKey: ['next-bofu-article', article?.points_to_bofu_id],
    queryFn: async () => {
      if (!article?.points_to_bofu_id) return null;
      
      const { data, error } = await supabase
        .from('qa_articles' as any)
        .select('slug, title')
        .eq('id', article.points_to_bofu_id)
        .eq('language', detectedLanguage)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data as any;
    },
    enabled: !!article?.points_to_bofu_id,
  });

  // Extract frontmatter nextStep data 
  const frontmatterNextStep = React.useMemo(() => {
    if (!article?.markdown_frontmatter?.nextStep) return null;
    
    const nextStep = article.markdown_frontmatter.nextStep;
    if (typeof nextStep === 'object' && nextStep.slug && nextStep.title) {
      return {
        slug: nextStep.slug,
        title: nextStep.title,
        topic: nextStep.topic || undefined
      };
    }
    return null;
  }, [article?.markdown_frontmatter]);

  // Enhanced author credentials with E-E-A-T signals
  const authorCredentials = React.useMemo(() => ({
    name: "Hans Beeckman",
    title: "Accredited Property Specialist",
    credentials: [
      "Accredited Property Specialist",
      "Costa del Sol Real Estate Expert",
      "Licensed Real Estate Advisor"
    ],
    experience: "15+ years specializing in Costa del Sol luxury properties with €200M+ in successful transactions",
    expertise: [
      "Luxury Property Valuation",
      "International Property Investment",
      "Spanish Legal Property Procedures", 
      "Expatriate Relocation Services",
      "Costa del Sol Market Analysis",
      "Property Portfolio Management"
    ],
    profileUrl: "https://delsolprimehomes.com/team/maria-rodriguez",
    sameAs: [
      "https://www.linkedin.com/in/maria-rodriguez-realestate",
      "https://www.rics.org/members/maria-rodriguez"
    ]
  }), []);

  // Sample reviews with high ratings for E-E-A-T
  const customerReviews = React.useMemo(() => [
    {
      id: "1",
      author: "James & Sarah Thompson",
      rating: 5,
      reviewBody: "Maria's expertise in Costa del Sol properties is unmatched. She guided us through every step of purchasing our villa in Marbella with incredible attention to detail.",
      datePublished: "2024-08-15",
      location: "Marbella",
      propertyType: "Villa"
    },
    {
      id: "2", 
      author: "Heinrich Mueller",
      rating: 5,
      reviewBody: "Exceptional service from DelSolPrimeHomes. The legal guidance and market insights were invaluable for our investment in Estepona.",
      datePublished: "2024-07-22",
      location: "Estepona",
      propertyType: "Investment"
    },
    {
      id: "3",
      author: "Sophie Dubois",
      rating: 5,
      reviewBody: "Professional, knowledgeable, and trustworthy. Made our dream of owning a home in Spain a reality with seamless support throughout.",
      datePublished: "2024-09-01",
      location: "Fuengirola", 
      propertyType: "Apartment"
    }
  ], []);


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
  
  // Generate maximal AI schema for best discovery
  const maximalAISchema = React.useMemo(() => 
    article ? generateMaximalAISchema(article as any, (recommendations as any) || []) : null, 
    [article, recommendations]
  );
  
  const aiOrganizationSchema = React.useMemo(() => 
    generateAIEnhancedOrganizationSchema(article?.language || 'en'), 
    [article?.language]
  );

  // Generate AI-optimized content
  const aiOptimizedContent = React.useMemo(() => 
    article ? generateAIOptimizedContent(article) : null,
    [article]
  );

  // Enhanced speakable selectors
  const speakableSelectors = React.useMemo(() => 
    getEnhancedSpeakableSelectors(),
    []
  );

  // Handle funnel CTA clicks with analytics
  const handleFunnelCTAClick = (ctaType: string, destination: string) => {
    trackCTAClick(ctaType, article?.funnel_stage || '', destination);
    
    // Track funnel progression if moving between stages
    if (ctaType.includes('next_step') && article) {
      const currentStage = article.funnel_stage;
      let nextStage = '';
      
      if (currentStage === 'TOFU') nextStage = 'MOFU';
      else if (currentStage === 'MOFU') nextStage = 'BOFU';
      else if (currentStage === 'BOFU') nextStage = 'CONVERSION';
      
      if (nextStage) {
        trackFunnelProgression(currentStage, nextStage, article.slug);
      }
    }
  };

  // Function to refresh article data and clear cache
  const refreshArticleData = React.useCallback(() => {
    // Invalidate all related queries
    queryClient.invalidateQueries({ queryKey: ['qa-article', slug] });
    // Force refetch
    refetch();
  }, [queryClient, slug, refetch]);

  // Track page view and inject AI meta tags
  React.useEffect(() => {
    if (article) {
      trackEvent('qa_article_view', {
        article_slug: article.slug,
        funnel_stage: article.funnel_stage,
        topic: article.topic
      });
      
      // Inject AI optimization meta tags
      if (article.ai_optimization_score) {
        injectAIMetaTags(article, article.ai_optimization_score);
      }
    }
  }, [article]);

  // Auto-refresh data every 30 seconds to catch database updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

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

  // Transform recommendations for the new layout
  const relatedQuestions = recommendations.map((rec: any) => ({
    id: rec.id,
    slug: rec.slug,
    title: rec.title,
    excerpt: rec.excerpt,
    funnelStage: rec.funnel_stage,
    topic: rec.topic,
    readingTime: Math.ceil((rec.content?.length || 500) / 200),
  }));

  // Generate available languages list and alternate URLs
  const availableLanguages = ['en', 'es', 'nl', 'fr', 'de', 'pl', 'sv', 'da'];
  const alternateUrls = availableLanguages.reduce((acc, lang) => {
    const baseSlug = article.slug.replace(/^(es|de|nl|fr|pl|sv|da)-/, '');
    acc[lang] = lang === 'en' 
      ? `https://delsolprimehomes.com/qa/${baseSlug}`
      : `https://delsolprimehomes.com/${lang}/qa/${baseSlug}`;
    return acc;
  }, {} as Record<string, string>);

  // Content availability notification
  const currentLangCount = getContentCount(detectedLanguage);
  const isUsingFallback = detectedLanguage !== 'en' && currentLangCount === 0;

  return (
    <>
      {/* Enhanced Multilingual SEO Head */}
      <MultilingualSEOHead 
        article={article}
        currentLanguage={detectedLanguage}
        availableLanguages={availableLanguages}
        alternateUrls={alternateUrls}
      />

      <Helmet>
        {/* Enhanced JSON-LD Structured Data for Maximum AI/LLM Optimization */}
        {enhancedArticleSchema && (
          <script type="application/ld+json">
            {JSON.stringify(enhancedArticleSchema)}
          </script>
        )}
        
        {/* Maximal AI Discovery Schema */}
        {maximalAISchema && (
          <script type="application/ld+json">
            {JSON.stringify(maximalAISchema)}
          </script>
        )}
        
        <script type="application/ld+json">
          {JSON.stringify(aiOrganizationSchema)}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbJsonLd(breadcrumbItems))}
        </script>
      </Helmet>
      
      {/* Reading Progress Bar */}
      <ReadingProgressBar articleSlug={article?.slug || ''} />
      
      <Navbar />
      
      <main className="min-h-screen pt-20">
        {/* Content Availability Alert */}
        {isUsingFallback && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This content is currently only available in English. We're working on translating it to {detectedLanguage.toUpperCase()}. 
                  <span className="font-medium"> Content available: {getContentCount('en')} English articles, {currentLangCount} {detectedLanguage.toUpperCase()} articles.</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Multilingual Alert */}
        <MultilingualAlert currentPath={`/qa/${article.slug}`} />

        {/* Breadcrumb Navigation */}
        <section className="py-4 bg-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Breadcrumb items={breadcrumbItems} />
              <LanguageSwitcher 
                currentPath={`/qa/${article.slug}`}
                variant="compact"
              />
            </div>
          </div>
        </section>

        {/* Enhanced QA Content - Phase 2 Structure */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <EnhancedQAContent article={article} />
            </div>
          </div>
        </section>


        {/* Funnel CTA Section with Lead Capture */}
        <section className="py-12 bg-muted/50 animate-fade-in animation-delay-500">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Show Lead Capture for BOFU articles */}
              {article.funnel_stage === 'BOFU' && (
                <div className="mb-8">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-200">
                        Expert Guide
                      </Badge>
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      Ready to Take the Next Step?
                    </h3>
                    <p className="text-muted-foreground">
                      You've done the research. Now let our experts help you find your perfect Costa del Sol property.
                    </p>
                  </div>
                  
                  <div data-booking-chatbot>
                    <BookingChatbot 
                      stage={mapStageToUserFriendly(article.funnel_stage)}
                      source={`qa-article-${article.slug}`}
                      className="mb-6"
                    />
                  </div>
                </div>
              )}

              {/* E-E-A-T Trust Signals */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Expert Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Licensed Professional</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium">4.9/5 Rating</span>
                    </div>
                  </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Content reviewed and verified by Accredited Property Specialist — Hans Beeckman
                </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Senior Real Estate Advisor & Costa del Sol Specialist
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">247 reviews</span>
                  </div>
                </div>
              </Card>

              {/* Reviewer Badge - E-E-A-T Enhancement */}
              {article.reviewer && (
                <Card className="p-4 bg-green-50/50 border-green-200">
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="text-center">
                      <span className="font-medium text-green-900">
                        ✓ Independently reviewed by {article.reviewer?.name || 'Hans Beeckman'}, {article.reviewer?.credentials?.[0] || 'Accredited Property Specialist'}
                      </span>
                      {article.reviewer.reviewDate && (
                        <span className="text-green-700 ml-2">
                          | Last checked: {new Date(article.reviewer.reviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Enhanced Funnel Flow Components */}
              <div className="space-y-6 mb-8">
                {/* BOFU Backlink CTA */}
                <FunnelCTATracker 
                  funnelStage={article.funnel_stage}
                  currentSlug={article.slug}
                  topic={article.topic}
                />
                
                {/* Enhanced Funnel Progress */}
                <EnhancedFunnelProgress 
                  currentStage={article.funnel_stage as 'TOFU' | 'MOFU' | 'BOFU'}
                  topic={article.topic}
                  totalArticlesInTopic={recommendations.filter(r => r.topic === article.topic).length + 1}
                  currentPosition={1}
                  estimatedTimeToConversion={article.funnel_stage === 'TOFU' ? 15 : article.funnel_stage === 'MOFU' ? 8 : 3}
                />
              </div>
              
              {/* Next Steps Section */}
              <NextStepsSection 
                funnelStage={article.funnel_stage}
                topic={article.topic}
                city={article.city}
                nextMofuArticle={nextMofuArticle}
                nextBofuArticle={nextBofuArticle}
                appointmentBookingEnabled={article.appointment_booking_enabled}
                className="mb-6"
              />
              
              <FunnelNavigation 
                currentStage={mapStageToUserFriendly(article.funnel_stage)}
                nextStepUrl={article.next_step_url || undefined}
                nextStepText={article.next_step_text || undefined}
                nextMofuArticle={nextMofuArticle ? { ...nextMofuArticle, topic: nextMofuArticle.topic || undefined } : null}
                nextBofuArticle={nextBofuArticle ? { ...nextBofuArticle, topic: nextBofuArticle.topic || undefined } : null}
                currentTopic={article.topic}
                frontmatterNextStep={frontmatterNextStep}
              />
            </div>
          </div>
        </section>

        {/* Enhanced Schema Components */}
        <AuthorCredentialsSchema 
          author={authorCredentials}
          articleUrl={`https://delsolprimehomes.com/qa/${article.slug}`}
        />
        <ReviewsSchema reviews={customerReviews} />

      </main>
    </>
  );
};

export default QAPost;