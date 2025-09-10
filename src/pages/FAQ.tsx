import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { FAQItem } from '@/components/FAQItem';
import { QASearch } from '@/components/QASearch';
import { QAProgress } from '@/components/QAProgress';
import { Breadcrumb, generateBreadcrumbJsonLd } from '@/components/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trackEvent } from '@/utils/analytics';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'FAQ', current: true }
  ];

  // Analytics tracking
  useEffect(() => {
    trackEvent('faq_overview_visit', {
      timestamp: new Date().toISOString()
    });
  }, []);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['qa-articles-faq'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_articles' as any)
        .select('*');
      
      if (error) throw error;
      
      // Custom ordering: TOFU → MOFU → BOFU
      const orderedData = (data || []).sort((a: any, b: any) => {
        const stageOrder = { 'TOFU': 1, 'MOFU': 2, 'BOFU': 3 };
        const stageA = stageOrder[a.funnel_stage as keyof typeof stageOrder] || 999;
        const stageB = stageOrder[b.funnel_stage as keyof typeof stageOrder] || 999;
        return stageA - stageB;
      });
      
      return orderedData as any[];
    }
  });

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [articles, searchTerm]);


  // Generate FAQPage JSON-LD schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": articles.map(article => ({
      "@type": "Question",
      "name": article.title,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": article.excerpt
      }
    }))
  };


  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - Costa del Sol Property Guide</title>
        <meta name="description" content="Get quick answers to common questions about buying property in Costa del Sol. Expert guidance for UK and Irish buyers from DelSolPrimeHomes." />
        <meta name="keywords" content="Costa del Sol FAQ, property buying questions, expat guide Spain, UK buyers" />
        <link rel="canonical" href="https://delsolprimehomes.com/faq" />
        
        {/* FAQPage JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        
        {/* Breadcrumb JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbJsonLd(breadcrumbItems))}
        </script>
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen pt-20">
        {/* Breadcrumb Navigation */}
        <section className="py-4 bg-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </section>
        
        {/* Hero Section */}
        <section className="luxury-gradient py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="faq-hero-title mb-6 animate-fade-in">
                Frequently Asked Questions
              </h1>
              <p className="faq-hero-subtitle mb-8 animate-fade-in animation-delay-200">
                Quick answers to guide your Costa del Sol property journey. Click any question for detailed information.
              </p>
              <div className="animate-fade-in animation-delay-400">
                <QASearch 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStage=""
                  onStageChange={() => {}}
                  hideStageFilter={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Progress Indicator */}
        <QAProgress totalArticles={articles.length} filteredCount={filteredArticles.length} />

        {/* FAQ Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-24"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {filteredArticles.map((article, index) => (
                  <FAQItem 
                    key={article.id} 
                    article={article} 
                    animationDelay={index * 50}
                  />
                ))}
              </div>
            )}

            {!isLoading && filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  No FAQ items found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}

            {/* Link to full Q&A hub */}
            <div className="mt-16 text-center">
              <Link 
                to="/qa" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View detailed Q&A articles →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default FAQ;