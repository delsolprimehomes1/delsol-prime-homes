import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import QACard from '@/components/QACard';
import QASearch from '@/components/QASearch';
import QAProgress from '@/components/QAProgress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const QA = () => {
  const [searchParams] = useSearchParams();
  const [filteredArticles, setFilteredArticles] = useState([]);
  const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['qa-articles'],
    queryFn: async () => {
      console.log('Fetching QA articles...');
      const { data, error } = await supabase
        .from('qa_articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched articles:', data?.length || 0, data);
      return data || [];
    }
  });

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const topic = searchParams.get('topic') || '';
    const stage = searchParams.get('stage') || '';

    console.log('Filtering articles, total:', articles.length);
    console.log('Query params:', { query, topic, stage });

    let filtered = articles;

    if (query) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase()) ||
        article.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (topic && topic !== 'all') {
      filtered = filtered.filter(article => article.topic === topic);
    }

    if (stage && stage !== 'all') {
      filtered = filtered.filter(article => article.funnel_stage === stage);
    }

    console.log('Filtered articles:', filtered.length);
    setFilteredArticles(filtered);
  }, [articles, searchParams]);

  const funnelStats = {
    TOFU: articles.filter(a => a.funnel_stage === 'TOFU').length,
    MOFU: articles.filter(a => a.funnel_stage === 'MOFU').length,
    BOFU: articles.filter(a => a.funnel_stage === 'BOFU').length,
  };

  const categoryGroups = {
    connectivity: articles.filter(a => a.topic === 'connectivity'),
    lifestyle: articles.filter(a => a.topic === 'lifestyle'),
    investment: articles.filter(a => a.topic === 'investment'),
    mixed: articles.filter(a => a.topic === 'mixed'),
  };

  const funnelConfig = {
    TOFU: { label: 'Discover', icon: Lightbulb, color: 'bg-blue-500', description: 'Learning about Costa del Sol' },
    MOFU: { label: 'Consider', icon: Target, color: 'bg-amber-500', description: 'Evaluating options' },
    BOFU: { label: 'Decide', icon: TrendingUp, color: 'bg-green-500', description: 'Ready to buy' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="navbar-offset">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navbar />
      
      {/* Hero Section */}
      <section className="navbar-offset py-16 bg-gradient-to-r from-secondary via-secondary/95 to-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="heading-display text-white mb-6 animate-fade-in-up">
              Your Costa del Sol
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Property Questions
              </span>
              Answered
            </h1>
            <p className="body-lg text-white/90 mb-8 animate-fade-in-delay">
              Navigate your property journey with expert insights. From discovery to decision, 
              we guide you through every step of buying in Spain's premier coastal destination.
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center items-center gap-8 animate-scale-in">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{articles.length}</div>
                <div className="text-white/80 text-sm">Expert Guides</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">5+</div>
                <div className="text-white/80 text-sm">Key Locations</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-white/80 text-sm">Expert Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funnel Progress Visualization */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <QAProgress 
            currentArticles={filteredArticles}
            funnelStats={funnelStats}
            funnelConfig={funnelConfig}
          />
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <QASearch articles={articles} />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12" ref={targetRef}>
        <div className="container mx-auto px-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="heading-md text-muted-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="heading-lg">
                  {searchParams.get('q') || searchParams.get('topic') || searchParams.get('stage') 
                    ? `Filtered Results (${filteredArticles.length})`
                    : 'All Property Guides'
                  }
                </h2>
                {filteredArticles.length > 0 && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Article Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className={`animate-on-scroll ${isIntersecting ? 'animate-in' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <QACard article={article} funnelConfig={funnelConfig} />
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              {!searchParams.get('q') && !searchParams.get('topic') && !searchParams.get('stage') && (
                <div className="mt-16 text-center">
                  <Card className="inline-block p-8 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border-primary/20">
                    <h3 className="heading-md mb-4">Still have questions?</h3>
                    <p className="body-md text-muted-foreground mb-6 max-w-md">
                      Get personalized advice from our Costa del Sol property experts
                    </p>
                    <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 hover:scale-105">
                      Book Free Consultation
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default QA;