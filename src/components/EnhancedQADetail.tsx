import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { Breadcrumb, generateBreadcrumbJsonLd } from '@/components/Breadcrumb';
import { FunnelCTA } from '@/components/FunnelCTA';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Eye,
  BookOpen,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  Award,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { 
  generateQAArticleSchema,
  generateOpenGraphData,
  generateTwitterCardData,
  generateCanonicalAndHreflang
} from '@/utils/schemas';
import { trackFunnelEvent, trackReadingProgress, trackCTAClick } from '@/utils/analytics';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/i18n';
import type { Json } from '@/integrations/supabase/types';

interface QAData {
  id: string;
  slug: string;
  question: string;
  answer_short: string;
  answer_long: string;
  language: string;
  category: string;
  funnel_stage: string;
  author_name: string;
  author_url?: string;
  reviewed_at: string;
  view_count: number;
  internal_links?: Json;
  created_at: string;
  updated_at: string;
}

interface RelatedFAQ {
  id: string;
  slug: string;
  question: string;
  answer_short: string;
  funnel_stage: string;
  category: string;
}

export default function EnhancedQADetail() {
  const { slug, lang } = useParams<{ slug: string; lang?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [qaData, setQaData] = useState<QAData | null>(null);
  const [relatedFaqs, setRelatedFaqs] = useState<RelatedFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const currentLanguage = (lang || i18n.language || 'en') as SupportedLanguage;
  
  // Debug logging
  console.log('Route parameters:', { slug, lang, currentLanguage });
  
  const { targetRef: contentRef, isIntersecting: contentVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Fetch FAQ data and related FAQs
  useEffect(() => {
    if (!slug) return;
    
    const fetchQAData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch main FAQ data
        const { data: faqData, error: faqError } = await supabase
          .from('faqs')
          .select('*')
          .eq('slug', slug)
          .eq('language', currentLanguage)
          .single();

        if (faqError) {
          if (faqError.code === 'PGRST116') {
            setError('Question not found');
          } else {
            setError('Failed to load question');
          }
          return;
        }

        setQaData(faqData as QAData);

        // Increment view count
        await supabase.rpc('increment_faq_view_count', { faq_slug: slug });

        // Fetch related FAQs
        if (faqData?.id) {
          const { data: relatedData } = await supabase.rpc('get_related_faqs', {
            current_faq_id: faqData.id,
            current_language: currentLanguage,
            limit_count: 4
          });

          if (relatedData) {
            setRelatedFaqs(relatedData);
          }
        }
      } catch (err) {
        console.error('Error fetching Q&A data:', err);
        setError('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    fetchQAData();
  }, [slug, currentLanguage]);

  // Reading progress tracking
  useEffect(() => {
    if (!qaData) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.round((scrollTop / docHeight) * 100), 100);
      
      setReadingProgress(progress);
      trackReadingProgress(qaData.slug, progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [qaData]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    trackCTAClick('bookmark', 'Bookmark FAQ', qaData?.slug || '');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    trackCTAClick('like', 'Like FAQ', qaData?.slug || '');
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
    if (navigator.share && qaData) {
      navigator.share({
        title: qaData.question,
        text: qaData.answer_short,
        url: window.location.href
      });
    }
    trackCTAClick('share', 'Share FAQ', qaData?.slug || '');
  };

  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getFunnelStageInfo = (stage: string) => {
    const stages = {
      TOFU: { label: 'Learn', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Lightbulb },
      MOFU: { label: 'Compare', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: TrendingUp },
      BOFU: { label: 'Decide', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle }
    };
    return stages[stage as keyof typeof stages] || stages.TOFU;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 navbar-offset">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <SkeletonLoader variant="card" className="mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <SkeletonLoader variant="text" lines={8} />
              </div>
              <div className="space-y-4">
                <SkeletonLoader variant="card" />
                <SkeletonLoader variant="card" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !qaData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 navbar-offset">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The question you're looking for doesn't exist or has been moved.
            </p>
            <div className="space-x-4">
              <Button onClick={handleBackClick} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button asChild>
                <Link to="/faq">Browse All FAQs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stageInfo = getFunnelStageInfo(qaData.funnel_stage);
  const StageIcon = stageInfo.icon;
  const readingTime = getReadingTime(qaData.answer_long || qaData.answer_short);
  
  // Generate structured data
  const articleSchema = generateQAArticleSchema(qaData);
  const openGraphData = generateOpenGraphData(qaData);
  const twitterData = generateTwitterCardData(qaData);
  const { canonical, hreflang } = generateCanonicalAndHreflang(qaData.slug, currentLanguage);
  
  // Generate breadcrumb data
  const breadcrumbItems = [
    { label: t('nav.faq') || 'FAQ', href: '/faq' },
    { label: qaData.category, href: `/faq?category=${qaData.category}` },
    { label: qaData.question, current: true }
  ];
  const breadcrumbSchema = generateBreadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <Helmet>
        <title>{qaData.question} | DelSolPrimeHomes</title>
        <meta name="description" content={qaData.answer_short} />
        <link rel="canonical" href={canonical} />
        
        {/* Hreflang tags */}
        {Object.entries(hreflang).map(([lang, url]) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={url} />
        ))}
        
        {/* Open Graph tags */}
        {Object.entries(openGraphData).map(([property, content]) => (
          <meta key={property} property={property} content={content} />
        ))}
        
        {/* Twitter Card tags */}
        {Object.entries(twitterData).map(([name, content]) => (
          <meta key={name} name={name} content={content} />
        ))}
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary z-50 transition-all duration-300"
        style={{ width: `${readingProgress}%` }}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 navbar-offset">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} className="mb-6" />
            
            {/* Back Button */}
            <Button 
              onClick={handleBackClick}
              variant="ghost" 
              className="mb-6 -ml-4 hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back') || 'Back to FAQ'}
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2" ref={contentRef as any}>
                <article className="space-y-8">
                  {/* Question Header */}
                  <header className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="secondary" className={cn("border", stageInfo.color)}>
                        <StageIcon className="w-3 h-3 mr-1" />
                        {stageInfo.label}
                      </Badge>
                      
                      {qaData.view_count > 100 && (
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                          <Award className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="w-4 h-4 mr-1" />
                        {qaData.view_count} views
                      </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground leading-tight">
                      {qaData.question}
                    </h1>

                    {/* Short Answer Highlight */}
                    <div className="short-answer p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-xl shadow-sm">
                      <p className="text-lg leading-relaxed text-foreground font-medium">
                        {qaData.answer_short}
                      </p>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {qaData.author_name || 'DelSolPrimeHomes Expert'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last reviewed: {new Date(qaData.reviewed_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {readingTime} min read
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBookmark}
                        className={cn(
                          "transition-colors",
                          isBookmarked && "text-amber-600 bg-amber-50 hover:bg-amber-100"
                        )}
                      >
                        <Bookmark className={cn("w-4 h-4 mr-2", isBookmarked && "fill-current")} />
                        Save
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={cn(
                          "transition-colors",
                          isLiked && "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        )}
                      >
                        <ThumbsUp className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
                        Helpful
                      </Button>
                      
                      <Button variant="ghost" size="sm" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </header>

                  <Separator />

                  {/* Detailed Answer */}
                  {qaData.answer_long && (
                    <section className="prose prose-lg max-w-none">
                      <div 
                        className="text-foreground leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ __html: qaData.answer_long }}
                      />
                    </section>
                  )}

                  {/* Funnel CTAs */}
                  {qaData.internal_links && Array.isArray(qaData.internal_links) && qaData.internal_links.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground mb-4">Next Steps</h3>
                      <div className="space-y-4">
                        {qaData.internal_links.map((link: any, index: number) => (
                          <FunnelCTA
                            key={index}
                            stage={link.stage}
                            link={{
                              text: link.text,
                              url: link.url
                            }}
                            onAnalyticsEvent={(event, data) => trackFunnelEvent(qaData.funnel_stage, link.stage.toUpperCase(), qaData.slug)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </article>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Related Questions */}
                {relatedFaqs.length > 0 && (
                  <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                        Related Questions
                      </h3>
                      <div className="space-y-3">
                        {relatedFaqs.map((faq) => (
                          <Link
                            key={faq.id}
                            to={`/${currentLanguage}/qa/${faq.slug}`}
                            className="block p-3 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                  {faq.question}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {faq.answer_short}
                                </p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className="ml-2 text-xs shrink-0"
                              >
                                {getFunnelStageInfo(faq.funnel_stage).label}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contact CTA */}
                <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2">Still Have Questions?</h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Get personalized advice from our Costa del Sol property experts.
                    </p>
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-300"
                        size="sm"
                        onClick={() => trackCTAClick('consultation', 'Book Free Consultation', '/contact')}
                      >
                        Book Free Consultation
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-primary/20 hover:bg-primary/5 transform hover:scale-105 transition-all duration-300"
                        size="sm"
                        asChild
                      >
                        <Link to="/properties">Browse Properties</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}