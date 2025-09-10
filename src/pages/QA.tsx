import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import { QACard } from '@/components/QACard';
import { QASearch } from '@/components/QASearch';
import { QAProgress } from '@/components/QAProgress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const QA = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['qa-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_articles' as any)
        .select('*')
        .order('funnel_stage', { ascending: true })
        .order('title', { ascending: true });
      
      if (error) throw error;
      return data as any[];
    }
  });

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = !searchTerm || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStage = !selectedStage || article.funnel_stage === selectedStage;
      
      return matchesSearch && matchesStage;
    });
  }, [articles, searchTerm, selectedStage]);

  const groupedArticles = useMemo(() => {
    const groups: Record<string, typeof articles> = {};
    filteredArticles.forEach(article => {
      if (!groups[article.funnel_stage]) {
        groups[article.funnel_stage] = [];
      }
      groups[article.funnel_stage].push(article);
    });
    return groups;
  }, [filteredArticles]);

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

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - Costa del Sol Property Experts</title>
        <meta name="description" content="Get answers to common questions about buying property in Costa del Sol. Expert guidance from DelSolPrimeHomes for UK and Irish buyers." />
        <meta name="keywords" content="Costa del Sol FAQ, property buying questions, expat guide Spain" />
        <link rel="canonical" href="https://delsolprimehomes.com/qa" />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen pt-20">
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
              />
            </div>
          </div>
        </section>

        {/* Progress Indicator */}
        <QAProgress totalArticles={articles.length} filteredCount={filteredArticles.length} />

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
                {Object.entries(groupedArticles).map(([stage, stageArticles], index) => (
                  <div key={stage} className="animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="flex items-center gap-4 mb-6">
                      <Badge className={`${stageInfo[stage as keyof typeof stageInfo]?.color} px-4 py-2 text-sm font-medium`}>
                        {stageInfo[stage as keyof typeof stageInfo]?.label}
                      </Badge>
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground">
                          {stageInfo[stage as keyof typeof stageInfo]?.label}
                        </h2>
                        <p className="text-muted-foreground">
                          {stageInfo[stage as keyof typeof stageInfo]?.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {stageArticles.map((article, articleIndex) => (
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
                ))}
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