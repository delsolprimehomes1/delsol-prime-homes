import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useFAQData } from '@/hooks/useFAQData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, TrendingUp, Eye, ArrowRight, Filter, Sparkles, BarChart3, Target } from 'lucide-react';
import { faqJsonLd } from '@/utils/schema';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EnhancedSearchBar } from '@/components/EnhancedSearchBar';
import { AnimatedFAQItem } from '@/components/AnimatedFAQItem';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/i18n';

export default function EnhancedFAQSection() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;
  
  const { faqs, categories, loading } = useFAQData(currentLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Filter FAQs based on search and selections
  const filteredFaqs = useMemo(() => faqs.filter(faq => {
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer_short.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesFunnelStage = selectedFunnelStage === 'all' || faq.funnel_stage === selectedFunnelStage;
    
    return matchesSearch && matchesCategory && matchesFunnelStage;
  }), [faqs, searchQuery, selectedCategory, selectedFunnelStage]);

  // Group FAQs by category for display
  const groupedFaqs = useMemo(() => filteredFaqs.reduce((acc, faq) => {
    const category = categories.find(cat => cat.key === faq.category);
    const categoryName = category?.name || faq.category;
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(faq);
    return acc;
  }, {} as Record<string, any[]>), [filteredFaqs, categories]);

  const handleItemExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getFunnelStageInfo = (stage: string) => {
    switch (stage) {
      case 'TOFU':
        return { label: 'Discovery', color: 'bg-blue-100 text-blue-800', icon: '🔍' };
      case 'MOFU':
        return { label: 'Consideration', color: 'bg-yellow-100 text-yellow-800', icon: '🤔' };
      case 'BOFU':
        return { label: 'Decision', color: 'bg-green-100 text-green-800', icon: '✅' };
      default:
        return { label: stage, color: 'bg-gray-100 text-gray-800', icon: '💡' };
    }
  };

  // Generate JSON-LD for speakable content
  const speakableFaqs = filteredFaqs
    .filter(faq => faq.is_speakable && expandedItems.includes(faq.id))
    .slice(0, 5); // Limit to 5 for performance

  const faqPageJsonLd = faqJsonLd(currentLanguage, speakableFaqs.map(faq => ({
    id: parseInt(faq.id.slice(-8), 16), // Simple ID conversion
    question: faq.question,
    shortAnswer: faq.answer_short,
    longAnswer: faq.answer_long || faq.answer_short,
    category: faq.category
  })));

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    const questionSuggestions = faqs.slice(0, 5).map(faq => ({
      id: `q-${faq.id}`,
      text: faq.question,
      type: 'question' as const,
      count: 1
    }));
    
    const categorySuggestions = categories.map(cat => ({
      id: `c-${cat.key}`,
      text: cat.name,
      type: 'category' as const,
      count: cat.count
    }));
    
    const tagSuggestions = [...new Set(faqs.flatMap(f => f.tags || []))]
      .slice(0, 8)
      .map(tag => ({
        id: `t-${tag}`,
        text: tag,
        type: 'tag' as const,
        count: faqs.filter(f => f.tags?.includes(tag)).length
      }));
    
    return [...questionSuggestions, ...categorySuggestions, ...tagSuggestions];
  }, [faqs, categories]);

  if (loading) {
    return (
      <section className="min-h-screen py-16 bg-gradient-to-br from-background via-background/95 to-secondary/10">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="text-center mb-12 space-y-4">
            <SkeletonLoader variant="text" lines={1} className="h-12 w-96 mx-auto" />
            <SkeletonLoader variant="text" lines={2} className="max-w-2xl mx-auto" />
          </div>
          
          {/* Search Skeleton */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <SkeletonLoader variant="text" lines={1} className="h-12 mb-4" />
                <div className="flex gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonLoader key={i} variant="button" className="h-8 w-20" />
                  ))}
                </div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonLoader key={i} variant="button" className="h-8 w-24" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* FAQ Skeletons */}
          <div className="max-w-4xl mx-auto space-y-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(faqPageJsonLd)}
      </script>
      
      <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Get instant answers about Costa del Sol properties, buying process, and living as an expat in Spain.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="glass-effect border border-primary/10 shadow-xl">
              <CardContent className="p-6">
                {/* Enhanced Search Bar */}
                <EnhancedSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  suggestions={searchSuggestions}
                  className="mb-6"
                />

                {/* Filter Chips */}
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Categories:</span>
                    </div>
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      All ({faqs.length})
                    </Button>
                    {categories.map((category, index) => (
                      <Button
                        key={category.key}
                        variant={selectedCategory === category.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.key)}
                        className={cn(
                          "transition-all duration-200 hover:scale-105",
                          "animate-in slide-in-from-bottom-2 fade-in"
                        )}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: 'both'
                        }}
                      >
                        {category.name} ({category.count})
                      </Button>
                    ))}
                  </div>

                  {/* Funnel Stage Filter */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Journey Stage:</span>
                    </div>
                    <Button
                      variant={selectedFunnelStage === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFunnelStage('all')}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Target className="mr-1 h-3 w-3" />
                      All Stages
                    </Button>
                    {['TOFU', 'MOFU', 'BOFU'].map((stage, index) => {
                      const stageInfo = getFunnelStageInfo(stage);
                      return (
                        <Button
                          key={stage}
                          variant={selectedFunnelStage === stage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedFunnelStage(stage)}
                          className={cn(
                            "gap-1 transition-all duration-200 hover:scale-105",
                            "animate-in slide-in-from-bottom-2 fade-in"
                          )}
                          style={{
                            animationDelay: `${(index + categories.length) * 50}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <span>{stageInfo.icon}</span>
                          {stageInfo.label}
                        </Button>
                      );
                    })}
                  </div>

                  {/* Results Summary */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>
                        Showing {Object.values(groupedFaqs).reduce((acc, arr) => acc + arr.length, 0)} of {faqs.length} results
                      </span>
                    </div>
                    
                    {(searchQuery || selectedCategory !== 'all' || selectedFunnelStage !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                          setSelectedFunnelStage('all');
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Results */}
          {Object.keys(groupedFaqs).length === 0 ? (
            <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">No FAQs found</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  We couldn't find any questions matching your criteria. Try adjusting your search terms or filters to discover more answers.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedFunnelStage('all');
                  }}
                  className="gap-2 hover:scale-105 transition-transform duration-200"
                >
                  <Sparkles className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {Object.entries(groupedFaqs).map(([categoryName, categoryFaqs], categoryIndex) => (
                <div 
                  key={categoryName} 
                  className={cn(
                    "mb-12 animate-in slide-in-from-bottom-4 fade-in duration-700",
                    "last:mb-8"
                  )}
                  style={{
                    animationDelay: `${categoryIndex * 200}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {categoryName}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {categoryFaqs.length} questions
                      </Badge>
                    </div>
                  </div>
                  
                  <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems}>
                    {categoryFaqs.map((faq, index) => (
                      <AnimatedFAQItem
                        key={faq.id}
                        faq={faq}
                        index={index}
                        onExpand={handleItemExpand}
                        isExpanded={expandedItems.includes(faq.id)}
                      />
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-20 animate-in slide-in-from-bottom-4 fade-in duration-700" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>
            <Card className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20 shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(var(--primary-rgb),0.05)_25%,rgba(var(--primary-rgb),0.05)_50%,transparent_50%,transparent_75%,rgba(var(--primary-rgb),0.05)_75%)] bg-[length:20px_20px]" />
              
              <div className="relative">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center animate-pulse">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-3xl font-heading bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    Still Have Questions?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Our Costa del Sol property experts are here to provide personalized guidance for your property journey. Get expert advice tailored to your specific needs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <span className="text-lg">📞</span>
                      Book Free Consultation
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transform hover:scale-105 transition-all duration-300"
                    >
                      <span className="text-lg">💬</span>
                      Ask a Question
                    </Button>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Available 24/7</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span>Expert Advice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      <span>No Commitment</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}