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
import { Search, TrendingUp, Eye, ArrowRight, Filter } from 'lucide-react';
import { faqJsonLd } from '@/utils/schema';
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

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            <Card>
              <CardContent className="p-6">
                {/* Search Bar */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search questions, answers, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Categories:</span>
                  </div>
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All ({faqs.length})
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.key}
                      variant={selectedCategory === category.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.key)}
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>

                {/* Funnel Stage Filter */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Journey Stage:</span>
                  </div>
                  <Button
                    variant={selectedFunnelStage === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFunnelStage('all')}
                  >
                    All Stages
                  </Button>
                  {['TOFU', 'MOFU', 'BOFU'].map((stage) => {
                    const stageInfo = getFunnelStageInfo(stage);
                    return (
                      <Button
                        key={stage}
                        variant={selectedFunnelStage === stage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFunnelStage(stage)}
                        className="gap-1"
                      >
                        <span>{stageInfo.icon}</span>
                        {stageInfo.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Results */}
          {Object.keys(groupedFaqs).length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No FAQs found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters.
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedFunnelStage('all');
              }}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {Object.entries(groupedFaqs).map(([categoryName, categoryFaqs]) => (
                <div key={categoryName} className="mb-8">
                  <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3">
                    {categoryName}
                    <Badge variant="secondary">{categoryFaqs.length}</Badge>
                  </h2>
                  
                  <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems}>
                    {categoryFaqs.map((faq, index) => {
                      const funnelInfo = getFunnelStageInfo(faq.funnel_stage);
                      return (
                        <AccordionItem 
                          key={faq.id} 
                          value={faq.id}
                          className="border rounded-lg mb-4 overflow-hidden bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
                        >
                          <AccordionTrigger 
                            className="text-left p-6 hover:no-underline group"
                            onClick={() => handleItemExpand(faq.id)}
                          >
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge className={`text-xs ${funnelInfo.color}`}>
                                  {funnelInfo.icon} {funnelInfo.label}
                                </Badge>
                                {faq.is_featured && (
                                  <Badge variant="default" className="text-xs">
                                    ⭐ Popular
                                  </Badge>
                                )}
                                {faq.view_count > 50 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Eye className="mr-1 h-3 w-3" />
                                    {faq.view_count} views
                                  </Badge>
                                )}
                              </div>
                              <h3 
                                className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors"
                                data-speakable={faq.is_speakable ? `faq-${index}` : undefined}
                              >
                                {faq.question}
                              </h3>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <div 
                              className="text-muted-foreground mb-4 leading-relaxed"
                              data-speakable={faq.is_speakable ? `faq-answer-${index}` : undefined}
                            >
                              {faq.answer_short}
                            </div>
                            
                            {/* Read Full Answer Link */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {faq.tags && faq.tags.length > 0 && (
                                  <>
                                    <span>Tags:</span>
                                    <div className="flex gap-1">
                                      {faq.tags.slice(0, 3).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                                className="hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <Link to={`/qa/${faq.slug}`}>
                                  Read Full Answer
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Still Have Questions?</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6 text-lg">
                  Our Costa del Sol property experts are here to provide personalized guidance for your property journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2">
                    📞 Book Free Consultation
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2">
                    💬 Ask a Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}