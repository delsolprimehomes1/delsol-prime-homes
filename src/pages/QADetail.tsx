import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, User, ExternalLink, Clock, Eye } from 'lucide-react';
import { orgJsonLd, searchActionJsonLd } from '@/utils/schema';
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

export default function QADetail() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [qaData, setQaData] = useState<QAData | null>(null);
  const [relatedFaqs, setRelatedFaqs] = useState<RelatedFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentLanguage = i18n.language as SupportedLanguage;

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
          .single();

        if (qaError) {
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
            limit_count: 3
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !qaData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Q&A Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The requested Q&A could not be found.'}</p>
          <Button onClick={() => navigate('/faq')} variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to FAQ
          </Button>
        </div>
      </div>
    );
  }

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

  const getFunnelStageInfo = (stage: string) => {
    switch (stage) {
      case 'TOFU':
        return { label: 'Awareness', color: 'bg-blue-100 text-blue-800', description: 'Discovery & Information' };
      case 'MOFU':
        return { label: 'Consideration', color: 'bg-yellow-100 text-yellow-800', description: 'Evaluation & Comparison' };
      case 'BOFU':
        return { label: 'Decision', color: 'bg-green-100 text-green-800', description: 'Ready to Act' };
      default:
        return { label: stage, color: 'bg-gray-100 text-gray-800', description: 'Information' };
    }
  };

  const funnelInfo = getFunnelStageInfo(qaData.funnel_stage);

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

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/10 border-b">
          <div className="container mx-auto px-4 py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/faq')}
              className="mb-4 hover:bg-primary/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to FAQ
            </Button>
            
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                {qaData.category}
              </Badge>
              <Badge className={`text-xs ${funnelInfo.color}`}>
                {funnelInfo.label}
              </Badge>
              {qaData.view_count > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="mr-1 h-3 w-3" />
                  {qaData.view_count} views
                </Badge>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight mb-4">
              {qaData.question}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6" data-speakable="qa-short-answer">
              {qaData.answer_short}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Main Answer */}
              <div className="lg:col-span-2">
                {/* Authority Header */}
                <div className="bg-card rounded-lg border p-6 mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <User className="h-4 w-4" />
                        <span>Expert Answer by</span>
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {qaData.author_url ? (
                          <a href={qaData.author_url} className="hover:text-primary transition-colors">
                            {qaData.author_name}
                          </a>
                        ) : (
                          qaData.author_name
                        )}
                      </h3>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>Reviewed</span>
                      </div>
                      <time>{new Date(qaData.reviewed_at).toLocaleDateString(currentLanguage)}</time>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{funnelInfo.description}</span>
                  </div>
                </div>

                {/* Full Answer */}
                <div className="prose prose-lg max-w-none" data-speakable="qa-answer">
                  <div className="bg-card rounded-lg border p-8">
                    {qaData.answer_long ? (
                      <div dangerouslySetInnerHTML={{ __html: qaData.answer_long.replace(/\n/g, '<br />') }} />
                    ) : (
                      <p>{qaData.answer_short}</p>
                    )}
                  </div>
                </div>

                {/* Funnel Navigation */}
                {qaData.internal_links && typeof qaData.internal_links === 'object' && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
                    <div className="grid gap-4">
                      {qaData.internal_links.tofu && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-blue-900">Learn More</h4>
                              <p className="text-blue-700 text-sm">{qaData.internal_links.tofu.text}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={qaData.internal_links.tofu.url}>
                                Explore <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {qaData.internal_links.mofu && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-yellow-900">Compare Options</h4>
                              <p className="text-yellow-700 text-sm">{qaData.internal_links.mofu.text}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={qaData.internal_links.mofu.url}>
                                Compare <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {qaData.internal_links.bofu && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-green-900">Ready to Act?</h4>
                              <p className="text-green-700 text-sm">{qaData.internal_links.bofu.text}</p>
                            </div>
                            <Button size="sm" asChild>
                              <a href={qaData.internal_links.bofu.url}>
                                Get Started <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Related Questions */}
                {relatedFaqs.length > 0 && (
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="font-semibold text-lg mb-4">Related Questions</h3>
                    <div className="space-y-3">
                      {relatedFaqs.map((faq) => (
                        <div key={faq.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                          <Badge variant="outline" className="text-xs mb-2">
                            {getFunnelStageInfo(faq.funnel_stage).label}
                          </Badge>
                          <h4 className="font-medium text-sm leading-tight mb-2">
                            <a 
                              href={`/qa/${faq.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {faq.question}
                            </a>
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {faq.answer_short}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-br from-primary/5 to-secondary/10 rounded-lg border p-6">
                  <h3 className="font-semibold text-lg mb-2">Still Have Questions?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get personalized advice from our Costa del Sol property experts.
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      Book Free Consultation
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Browse Properties
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}