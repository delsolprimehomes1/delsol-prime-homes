import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { QAAccordionItem } from '@/components/QAAccordionItem';
import { QASearch } from '@/components/QASearch';
import { QAProgress } from '@/components/QAProgress';
import { Breadcrumb, generateBreadcrumbJsonLd } from '@/components/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trackEvent } from '@/utils/analytics';
import { faqJsonLd, orgJsonLd } from '@/utils/schema';
import { generateSpeakableSchema, generateQAArticleSchema } from '@/utils/schemas';
const QAHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // Breadcrumb items
  const breadcrumbItems = [{
    label: 'Questions & Answers',
    current: true
  }];

  // Analytics tracking
  useEffect(() => {
    trackEvent('qa_hub_visit', {
      timestamp: new Date().toISOString()
    });
  }, []);
  const {
    data: articles = [],
    isLoading
  } = useQuery({
    queryKey: ['qa-articles-hub'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('qa_articles' as any).select('*');
      if (error) throw error;

      // Custom ordering: TOFU → MOFU → BOFU
      const orderedData = (data || []).sort((a: any, b: any) => {
        const stageOrder = {
          'TOFU': 1,
          'MOFU': 2,
          'BOFU': 3
        };
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
        article.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStage = !selectedStage || article.funnel_stage === selectedStage;
      const matchesTopic = !selectedTopic || article.topic === selectedTopic;
      return matchesSearch && matchesStage && matchesTopic;
    });
  }, [articles, searchTerm, selectedStage, selectedTopic]);

  // Enhanced JSON-LD schemas for optimal AI/LLM compatibility
  const enhancedFAQSchema = faqJsonLd('en', articles.map(article => ({
    id: article.id,
    question: article.title,
    shortAnswer: article.excerpt,
    longAnswer: article.content,
    category: article.topic
  })));

  // Page-level speakable schema for voice search optimization
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": [".question-title", ".short-answer"],
      "xpath": ["//*[contains(@class, 'question-title')]", "//*[contains(@class, 'short-answer')]"]
    }
  };
  const organizationSchema = orgJsonLd('en');
  return <>
      <Helmet>
        <title>Questions & Answers - Costa del Sol Property Guide | DelSolPrimeHomes</title>
        <meta name="description" content="Comprehensive Q&A hub for Costa del Sol property buyers. Get instant short answers plus detailed insights for serious buyers. Expert guidance for UK and Irish expats." />
        <meta name="keywords" content="Costa del Sol Q&A, property buying questions, expat guide Spain, UK buyers, detailed property advice" />
        <link rel="canonical" href="https://delsolprimehomes.com/qa" />
        
        {/* Enhanced FAQPage JSON-LD with Speakable Support */}
        <script type="application/ld+json">
          {JSON.stringify(enhancedFAQSchema)}
        </script>
        
        {/* Speakable Schema for Voice Search */}
        <script type="application/ld+json">
          {JSON.stringify(speakableSchema)}
        </script>
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
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
              <h1 className="faq-hero-title mb-6 animate-fade-in">Q&A Hub</h1>
              <p className="faq-hero-subtitle mb-4 animate-fade-in animation-delay-200">
                <strong>Two layers of expertise:</strong> Quick answers for skimmers, detailed insights for serious buyers.
              </p>
              <p className="text-white/90 text-lg mb-8 animate-fade-in animation-delay-300">
                Expand any question below for comprehensive guidance on your Costa del Sol property journey.
              </p>
              <div className="animate-fade-in animation-delay-400">
              <QASearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedTopic={selectedTopic}
                onTopicChange={setSelectedTopic}
                topicCounts={articles.reduce((acc: Record<string, number>, article) => {
                  const topic = article.topic || 'Miscellaneous';
                  acc[topic] = (acc[topic] || 0) + 1;
                  return acc;
                }, {})}
                totalCount={articles.length}
              />
              </div>
            </div>
          </div>
        </section>

        {/* Progress Indicator */}
        <QAProgress totalArticles={articles.length} filteredCount={filteredArticles.length} />

        {/* Q&A Accordion Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? <div className="space-y-4 max-w-4xl mx-auto">
                {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-32"></div>
                  </div>)}
              </div> : <div className="space-y-4 max-w-4xl mx-auto">
                {filteredArticles.map((article, index) => <QAAccordionItem key={article.id} article={article} animationDelay={index * 50} />)}
              </div>}

            {!isLoading && filteredArticles.length === 0 && <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  No questions found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or stage filters.
                </p>
              </div>}

            {/* AI & Voice Search Notice */}
            <div className="mt-16 text-center max-w-2xl mx-auto">
              <div className="bg-muted/50 rounded-lg p-6 border">
                <h3 className="font-semibold text-foreground mb-2">
                  🤖 AI & Voice Search Optimized
                </h3>
                <p className="text-sm text-muted-foreground">
                  This page is optimized for AI assistants, voice search, and chatbots. 
                  Each question provides both quick answers and detailed insights.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>;
};
export default QAHub;