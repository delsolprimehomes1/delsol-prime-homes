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
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  ExternalLink, 
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
import { orgJsonLd, searchActionJsonLd } from '@/utils/schema';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/i18n';

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
  internal_links?: any;
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
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [qaData, setQaData] = useState<QAData | null>(null);
  const [relatedFaqs, setRelatedFaqs] = useState<RelatedFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const currentLanguage = i18n.language as SupportedLanguage;

  const { targetRef: headerRef, isIntersecting: headerVisible } = useIntersectionObserver();
  const { targetRef: contentRef, isIntersecting: contentVisible } = useIntersectionObserver();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrolled / maxHeight) * 100, 100);
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;
    
    const fetchQAData = async () => {
      try {
        setLoading(true);
        
        // Fetch main Q&A data
        const { data: qaResult, error: qaError } = await supabase
          .from('faqs')
          .select(`
            id, slug, question, answer_short, answer_long, language, category,
            funnel_stage, author_name, author_url, reviewed_at, view_count,
            internal_links, created_at, updated_at
          `)
          .eq('slug', slug)
          .eq('language', currentLanguage)
          .maybeSingle();

        if (qaError) {
          console.error('Error fetching Q&A:', qaError);
          throw qaError;
        }

        if (!qaResult) {
          setError('Q&A not found');
          return;
        }

        setQaData(qaResult);

        // Increment view count
        await supabase.rpc('increment_faq_view_count', { faq_slug: slug });

        // Fetch related FAQs
        const { data: relatedResult, error: relatedError } = await supabase
          .rpc('get_related_faqs', {
            current_faq_id: qaResult.id,
            current_language: currentLanguage,
            limit_count: 4
          });

        if (!relatedError && relatedResult) {
          setRelatedFaqs(relatedResult);
        }

      } catch (err) {
        console.error('Error fetching Q&A data:', err);
        setError('Failed to load Q&A data');
      } finally {
        setLoading(false);
      }
    };

    fetchQAData();
  }, [slug, currentLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/10">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/10 border-b">
          <div className="container mx-auto px-4 py-8">
            <SkeletonLoader variant="button" className="mb-4 w-32" />
            <div className="space-y-4">
              <div className="flex gap-2">
                <SkeletonLoader variant="button" className="w-16 h-6" />
                <SkeletonLoader variant="button" className="w-20 h-6" />
              </div>
              <SkeletonLoader variant="text" lines={1} className="h-10 w-3/4" />
              <SkeletonLoader variant="text" lines={2} />
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6">
                <SkeletonLoader variant="text" lines={4} />
              </Card>
              <Card className="p-8">
                <SkeletonLoader variant="text" lines={8} />
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="p-6">
                <SkeletonLoader variant="text" lines={6} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !qaData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-secondary/10">
        <div className="text-center animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Q&A Not Found</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            {error || 'The requested Q&A could not be found. It may have been moved or removed.'}
          </p>
          <Button 
            onClick={() => navigate('/faq')} 
            className="gap-2 hover:scale-105 transition-transform duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to FAQ
          </Button>
        </div>
      </div>
    );
  }

  const getFunnelStageInfo = (stage: string) => {
    switch (stage) {
      case 'TOFU':
        return { 
          label: 'Awareness', 
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          gradient: 'from-blue-500/10 to-blue-600/5',
          description: 'Discovery & Information',
          icon: Lightbulb
        };
      case 'MOFU':
        return { 
          label: 'Consideration', 
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          gradient: 'from-amber-500/10 to-amber-600/5',
          description: 'Evaluation & Comparison',
          icon: TrendingUp
        };
      case 'BOFU':
        return { 
          label: 'Decision', 
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          gradient: 'from-emerald-500/10 to-emerald-600/5',
          description: 'Ready to Act',
          icon: CheckCircle
        };
      default:
        return { 
          label: stage, 
          color: 'bg-gray-50 text-gray-800 border-gray-200',
          gradient: 'from-gray-500/10 to-gray-600/5',
          description: 'Information',
          icon: BookOpen
        };
    }
  };

  const funnelInfo = getFunnelStageInfo(qaData.funnel_stage);
  const FunnelIcon = funnelInfo.icon;

  const getReadingTime = (text: string) => {
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  // Generate JSON-LD for Q&A page
  const qaJsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "inLanguage": currentLanguage,
    "@id": `https://delsolprimehomes.com/${currentLanguage}/qa/${qaData.slug}#qa`,
    "url": `https://delsolprimehomes.com/${currentLanguage}/qa/${qaData.slug}`,
    "name": qaData.question,
    "mainEntity": {
      "@type": "Question",
      "name": qaData.question,
      "text": qaData.question,
      "answerCount": 1,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": qaData.answer_long || qaData.answer_short,
        "dateCreated": qaData.created_at,
        "dateModified": qaData.updated_at,
        "author": {
          "@type": "Person",
          "name": qaData.author_name,
          "url": qaData.author_url
        }
      }
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "[data-speakable='qa-answer']"]
    },
    "datePublished": qaData.created_at,
    "dateModified": qaData.updated_at,
    "publisher": {
      "@type": "Organization",
      "name": "DelSolPrimeHomes",
      "url": "https://delsolprimehomes.com"
    }
  };

  return (
    <>
      <Helmet>
        <title>{qaData.question} - DelSolPrimeHomes FAQ</title>
        <meta name="description" content={qaData.answer_short} />
        <link rel="canonical" href={`https://delsolprimehomes.com/${currentLanguage}/qa/${qaData.slug}`} />
        <meta property="og:title" content={qaData.question} />
        <meta property="og:description" content={qaData.answer_short} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://delsolprimehomes.com/${currentLanguage}/qa/${qaData.slug}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={qaData.question} />
        <meta name="twitter:description" content={qaData.answer_short} />
        
        <script type="application/ld+json">
          {JSON.stringify(qaJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(orgJsonLd(currentLanguage))}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(searchActionJsonLd(currentLanguage))}
        </script>
      </Helmet>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-muted z-50">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Action Button */}
      {!headerVisible && (
        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/faq')}
          className={cn(
            "fixed top-4 left-4 z-40 gap-2 shadow-lg",
            "animate-in slide-in-from-left-2 fade-in duration-300"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/10">
        {/* Header */}
        <div 
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b backdrop-blur-sm"
        >
          <div className="container mx-auto px-4 py-12">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/faq')}
              className={cn(
                "mb-6 hover:bg-primary/10 group transition-all duration-300",
                "animate-in slide-in-from-left-2 fade-in"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to FAQ
            </Button>
            
            <div className={cn(
              "space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700"
            )}>
              {/* Badges and Meta */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge 
                  className={cn(
                    "text-sm font-medium border transition-all duration-200",
                    funnelInfo.color,
                    "hover:scale-105"
                  )}
                >
                  <FunnelIcon className="mr-2 h-4 w-4" />
                  {funnelInfo.label}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {qaData.category}
                </Badge>
                {qaData.view_count > 0 && (
                  <Badge variant="outline" className="text-sm">
                    <Eye className="mr-2 h-4 w-4" />
                    {qaData.view_count.toLocaleString()} views
                  </Badge>
                )}
                <Badge variant="outline" className="text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  {getReadingTime(qaData.answer_long || qaData.answer_short)} min read
                </Badge>
              </div>

              {/* Question Title */}
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {qaData.question}
              </h1>
              
              {/* Short Answer Preview */}
              <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl" data-speakable="qa-short-answer">
                {qaData.answer_short}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    "gap-2 hover:scale-105 transition-all duration-200",
                    isBookmarked && "text-primary"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    "gap-2 hover:scale-105 transition-all duration-200",
                    isLiked && "text-primary"
                  )}
                >
                  <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
                  Helpful
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 hover:scale-105 transition-all duration-200"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              
              {/* Main Answer */}
              <div className="lg:col-span-3 space-y-8">
                
                {/* Authority Header */}
                <Card className={cn(
                  "glass-effect border border-primary/10 shadow-lg",
                  "animate-in slide-in-from-bottom-4 fade-in duration-700"
                )}>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                        <Award className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-4 w-4" />
                          <span>Expert Answer by</span>
                        </div>
                        <h3 className="font-heading font-bold text-xl text-foreground">
                          {qaData.author_url ? (
                            <a 
                              href={qaData.author_url} 
                              className="hover:text-primary transition-colors"
                            >
                              {qaData.author_name}
                            </a>
                          ) : (
                            qaData.author_name
                          )}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Reviewed {new Date(qaData.reviewed_at).toLocaleDateString(currentLanguage)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>{funnelInfo.description}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Full Answer */}
                <Card 
                  ref={contentRef as React.RefObject<HTMLDivElement>}
                  className={cn(
                    "glass-effect border border-primary/10 shadow-lg overflow-hidden",
                    contentVisible && "animate-in slide-in-from-bottom-4 fade-in duration-700"
                  )}
                >
                  <div className={cn(
                    "p-2 bg-gradient-to-r border-b",
                    funnelInfo.gradient
                  )}>
                    <div className="flex items-center gap-2 px-6 py-2">
                      <FunnelIcon className="h-5 w-5 text-primary" />
                      <span className="font-medium text-primary">Detailed Answer</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-8">
                    <div 
                      className="prose prose-lg max-w-none leading-relaxed"
                      data-speakable="qa-answer"
                    >
                      {qaData.answer_long ? (
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: qaData.answer_long.replace(/\n/g, '<br />') 
                          }} 
                        />
                      ) : (
                        <p>{qaData.answer_short}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                {qaData.internal_links && typeof qaData.internal_links === 'object' && (
                  <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-2xl font-heading font-bold">Next Steps</h3>
                    <div className="grid gap-4">
                      {qaData.internal_links.tofu && (
                        <Card className="bg-gradient-to-r from-blue-50/50 to-blue-100/50 border border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Lightbulb className="h-5 w-5 text-blue-600" />
                                  <h4 className="font-semibold text-blue-900">Learn More</h4>
                                </div>
                                <p className="text-blue-800 leading-relaxed">{qaData.internal_links.tofu.text}</p>
                              </div>
                              <Button variant="outline" asChild className="border-blue-200 hover:bg-blue-50">
                                <a href={qaData.internal_links.tofu.url}>
                                  Explore <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {qaData.internal_links.mofu && (
                        <Card className="bg-gradient-to-r from-amber-50/50 to-amber-100/50 border border-amber-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5 text-amber-600" />
                                  <h4 className="font-semibold text-amber-900">Compare Options</h4>
                                </div>
                                <p className="text-amber-800 leading-relaxed">{qaData.internal_links.mofu.text}</p>
                              </div>
                              <Button variant="outline" asChild className="border-amber-200 hover:bg-amber-50">
                                <a href={qaData.internal_links.mofu.url}>
                                  Compare <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {qaData.internal_links.bofu && (
                        <Card className="bg-gradient-to-r from-emerald-50/50 to-emerald-100/50 border border-emerald-200/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                                  <h4 className="font-semibold text-emerald-900">Ready to Act?</h4>
                                </div>
                                <p className="text-emerald-800 leading-relaxed">{qaData.internal_links.bofu.text}</p>
                              </div>
                              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                                <a href={qaData.internal_links.bofu.url}>
                                  Get Started <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Related Questions */}
                {relatedFaqs.length > 0 && (
                  <Card className={cn(
                    "glass-effect border border-primary/10 shadow-lg",
                    "animate-in slide-in-from-right-2 fade-in duration-700",
                    "sticky top-24"
                  )}>
                    <CardContent className="p-6">
                      <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        Related Questions
                      </h3>
                      <div className="space-y-4">
                        {relatedFaqs.map((faq, index) => (
                          <div 
                            key={faq.id} 
                            className={cn(
                              "group border-b border-border/50 last:border-0 pb-4 last:pb-0",
                              "animate-in slide-in-from-right-2 fade-in duration-500"
                            )}
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animationFillMode: 'both'
                            }}
                          >
                            <Badge 
                              variant="outline" 
                              className="text-xs mb-3 transition-colors group-hover:border-primary/40"
                            >
                              {getFunnelStageInfo(faq.funnel_stage).label}
                            </Badge>
                            <h4 className="font-medium text-sm leading-tight mb-2">
                              <Link 
                                to={`/qa/${faq.slug}`}
                                className="hover:text-primary transition-all duration-200 group-hover:translate-x-1"
                              >
                                {faq.question}
                              </Link>
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {faq.answer_short}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CTA */}
                <Card className="glass-effect bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border border-primary/20 shadow-xl animate-in slide-in-from-right-2 fade-in duration-700" style={{ animationDelay: '300ms' }}>
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
                      >
                        Book Free Consultation
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-primary/20 hover:bg-primary/5 transform hover:scale-105 transition-all duration-300"
                        size="sm"
                      >
                        Browse Properties
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