import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import { QACard } from '@/components/QACard';
import { QASearch } from '@/components/QASearch';
import { QAProgress } from '@/components/QAProgress';
import { QAClusterStats } from '@/components/QAClusterStats';
import { Breadcrumb, generateBreadcrumbJsonLd } from '@/components/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trackEvent } from '@/utils/analytics';
import { generateMultilingualFAQSchema } from '@/utils/multilingual-schemas';
import { 
  generateComprehensiveFAQSchema,
  generateAIEnhancedOrganizationSchema,
  generateAIWebsiteSchema,
  generateEnhancedBreadcrumbSchema
} from '@/utils/enhanced-schemas';
import type { SupportedLanguage } from '@/i18n';

const QA = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [viewMode, setViewMode] = useState<'clusters' | 'stages'>('clusters');
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Questions & Answers', current: true }
  ];

  // Analytics tracking
  useEffect(() => {
    trackEvent('qa_hub_visit', {
      timestamp: new Date().toISOString()
    });
  }, []);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['qa-articles', currentLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_articles')
        .select('*')
        .eq('language', currentLanguage)
        .order('funnel_stage', { ascending: true })
        .order('title', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStage = !selectedStage || article.funnel_stage === selectedStage;
      const matchesTopic = !selectedTopic || article.topic === selectedTopic;
      
      return matchesSearch && matchesStage && matchesTopic;
    });
  }, [articles, searchTerm, selectedStage, selectedTopic]);

  const groupedArticles = useMemo(() => {
    if (viewMode === 'stages') {
      const groups: Record<string, typeof articles> = {};
      filteredArticles.forEach(article => {
        if (!groups[article.funnel_stage]) {
          groups[article.funnel_stage] = [];
        }
        groups[article.funnel_stage].push(article);
      });
      return groups;
    } else {
      // Group by topic for cluster view
      const groups: Record<string, typeof articles> = {};
      filteredArticles.forEach(article => {
        const topic = article.topic || 'Miscellaneous';
        if (!groups[topic]) {
          groups[topic] = [];
        }
        groups[topic].push(article);
      });
      return groups;
    }
  }, [filteredArticles, viewMode]);

  const stageInfo = {
    TOFU: { 
      label: 'Getting Started', 
      description: 'Essential information for first-time buyers',
      color: 'bg-blue-500/10 text-blue-700 border-blue-200'
    },
    MOFU: { 
      label: 'Researching Options', 
      description: 'Detailed guides for informed decision-making',
      color: 'bg-amber-500/10 text-amber-700 border-amber-200'
    },
    BOFU: { 
      label: 'Ready to Buy', 
      description: 'Final considerations and checklists',
      color: 'bg-green-500/10 text-green-700 border-green-200'
    }
  };

  const getTopicColor = (topic: string) => {
    const colors: Record<string, string> = {
      'Getting Started': 'bg-purple-500/10 text-purple-700 border-purple-200',
      'Legal & Documentation': 'bg-red-500/10 text-red-700 border-red-200',
      'Financing & Mortgages': 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      'Property Search': 'bg-orange-500/10 text-orange-700 border-orange-200',
      'Investment Strategy': 'bg-teal-500/10 text-teal-700 border-teal-200',
      'International Buyer Journey': 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      'Property Maintenance & Management': 'bg-lime-500/10 text-lime-700 border-lime-200',
      'Lifestyle': 'bg-pink-500/10 text-pink-700 border-pink-200',
      'Rental Investment': 'bg-violet-500/10 text-violet-700 border-violet-200',
      'Renovation & Development': 'bg-rose-500/10 text-rose-700 border-rose-200',
      'Insurance & Protection': 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      'Utilities & Services': 'bg-sky-500/10 text-sky-700 border-sky-200',
      'Transportation & Accessibility': 'bg-stone-500/10 text-stone-700 border-stone-200',
      'Miscellaneous': 'bg-gray-500/10 text-gray-700 border-gray-200'
    };
    return colors[topic] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  // Generate enhanced schemas for AI/LLM optimization  
  const multilingualFAQSchema = useMemo(() => 
    generateMultilingualFAQSchema(articles as any[], currentLanguage), [articles, currentLanguage]
  );
  
  const comprehensiveFAQSchema = useMemo(() => 
    generateComprehensiveFAQSchema(articles as any[], currentLanguage), [articles, currentLanguage]
  );
  
  const aiOrganizationSchema = useMemo(() => 
    generateAIEnhancedOrganizationSchema(currentLanguage), [currentLanguage]
  );
  
  const aiWebsiteSchema = useMemo(() => 
    generateAIWebsiteSchema(currentLanguage), [currentLanguage]
  );
  
  const enhancedBreadcrumbSchema = useMemo(() => 
    generateEnhancedBreadcrumbSchema(breadcrumbItems), [breadcrumbItems]
  );

  return (
    <>
      <Helmet>
        <title>Costa del Sol Property FAQ Hub - AI-Powered Expert Guidance</title>
        <meta name="description" content="Comprehensive FAQ hub for Costa del Sol property buyers. AI-powered multilingual support with {articles.length}+ expert answers for international buyers." />
        <meta name="keywords" content="Costa del Sol FAQ, AI property assistant, multilingual property guide, international buyers Spain, property questions answers" />
        <link rel="canonical" href="https://delsolprimehomes.com/qa" />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Costa del Sol Property FAQ Hub - AI Expert Guidance" />
        <meta property="og:description" content="Get instant answers to property questions with our AI-powered multilingual FAQ hub. {articles.length}+ expert answers for Costa del Sol buyers." />
        <meta property="og:url" content="https://delsolprimehomes.com/qa" />
        <meta property="og:site_name" content="DelSolPrimeHomes" />
        <meta property="og:image" content="https://delsolprimehomes.com/assets/qa-hub-og.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Costa del Sol Property FAQ Hub" />
        <meta name="twitter:description" content="AI-powered multilingual FAQ hub with {articles.length}+ expert answers" />
        <meta name="twitter:image" content="https://delsolprimehomes.com/assets/qa-hub-twitter.jpg" />
        
        {/* Enhanced JSON-LD Structured Data for AI/LLM Optimization */}
        <script type="application/ld+json">
          {JSON.stringify(multilingualFAQSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(comprehensiveFAQSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(aiOrganizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(aiWebsiteSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(enhancedBreadcrumbSchema)}
        </script>
        
        {/* Speakable Content Markers for Voice Search */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SpeakableSpecification",
            "cssSelector": [
              "h1", "h2", ".question-title", ".short-answer", 
              ".qa-card h3", ".topic-cluster-title", ".stage-description"
            ],
            "xpath": [
              "//h1[1]",
              "//h2[contains(@class, 'topic-title')]", 
              "//*[contains(@class, 'question-title')]",
              "//*[contains(@class, 'short-answer')]",
              "//div[contains(@class, 'qa-card')]//h3"
            ]
          })}
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
        <section className="luxury-gradient py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in">
                Frequently Asked Questions
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 animate-fade-in animation-delay-200">
                Expert answers to help you navigate your Costa del Sol property journey
              </p>
              <QASearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedStage={selectedStage}
                onStageChange={setSelectedStage}
                selectedTopic={selectedTopic}
                onTopicChange={setSelectedTopic}
              />
            </div>
          </div>
        </section>

        {/* Enhanced Progress & Stats */}
        <QAClusterStats 
          totalArticles={articles.length} 
          filteredCount={filteredArticles.length}
          clusterData={Object.entries(
            articles.reduce((acc: Record<string, number>, article) => {
              const topic = article.topic || 'Miscellaneous';
              acc[topic] = (acc[topic] || 0) + 1;
              return acc;
            }, {})
          ).map(([name, count]) => ({ 
            name, 
            count: count as number, 
            avgStageDistribution: { TOFU: 3, MOFU: 2, BOFU: 1 } 
          }))}
          currentFilters={{ searchTerm, selectedStage, selectedTopic }}
        />

        {/* View Mode Toggle */}
        <section className="py-6 bg-muted/20 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">View by:</span>
              <div className="flex gap-2">
                <Badge
                  variant={viewMode === 'clusters' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => setViewMode('clusters')}
                >
                  Topic Clusters
                </Badge>
                <Badge
                  variant={viewMode === 'stages' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => setViewMode('stages')}
                >
                  Buyer Journey
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-64"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedArticles).map(([groupKey, groupArticles], index) => {
                  const isStageView = viewMode === 'stages';
                  const groupInfo = isStageView 
                    ? stageInfo[groupKey as keyof typeof stageInfo]
                    : { 
                        label: groupKey, 
                        description: `${groupArticles.length} articles about ${groupKey.toLowerCase()}`,
                        color: getTopicColor(groupKey)
                      };

                  return (
                    <div key={groupKey} className="animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                      <div className="flex items-center gap-4 mb-6">
                        <Badge className={`${groupInfo?.color} px-4 py-2 text-sm font-medium`}>
                          {groupInfo?.label}
                        </Badge>
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground">
                            {groupInfo?.label}
                          </h2>
                          <p className="text-muted-foreground">
                            {groupInfo?.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {groupArticles.map((article, articleIndex) => (
                          <QACard 
                            key={article.id} 
                            article={article} 
                            animationDelay={articleIndex * 50}
                          />
                        ))}
                      </div>
                      
                      {index < Object.keys(groupedArticles).length - 1 && (
                        <Separator className="mt-12" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  No articles found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default QA;