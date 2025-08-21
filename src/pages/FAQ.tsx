
import React, { useState, useMemo } from 'react';
import { Search, ArrowUp, HelpCircle, ChevronRight, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';
import { faqData } from '@/data/faqData';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const categories = [
    'All',
    'General',
    'Financing',
    'Buying Process', 
    'Legal',
    'Taxes',
    'Locations',
    'Property Types',
    'Property Management',
    'Viewing & Offers',
    'After-Sale',
    'Visas/Residency',
    'Mortgages',
    'Fees & Costs',
    'New-build vs Resale',
    'Short-Term Rentals',
    'Due Diligence',
    'Market Trends'
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    let filtered = faqData;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        (faq.details && faq.details.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  // Handle scroll for back to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* JSON-LD Schema for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map((faq, index) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.details ? `${faq.answer} ${faq.details.replace(/<[^>]*>/g, '')}` : faq.answer
              }
            }))
          })
        }}
      />
      
      <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-primary">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/resources" className="text-muted-foreground hover:text-primary">
                Resources
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-secondary font-medium">
              FAQ
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-8">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="heading-xl mb-6 text-secondary">
            Frequently Asked Questions — DelSolPrimeHomes
          </h1>
          
          <p className="body-lg text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Expert answers to 275 common questions about buying luxury properties in Costa del Sol. 
            From Marbella's Golden Mile to Estepona's New Golden Mile, Fuengirola's beachfront, 
            and Benalmádena's hills—we've got you covered.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search 275 answers (e.g., 'Can foreigners buy in Marbella?')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-base border-2 border-border/30 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-secondary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-8">
            Showing {filteredFaqs.length} of 275 questions
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/30 rounded-full mb-4">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="heading-sm mb-2 text-secondary">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or selecting a different category.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-0"
                >
                  <div className="bg-white border border-border/30 rounded-xl overflow-hidden group minimal-hover">
                    <AccordionTrigger className="text-left hover:no-underline transition-all duration-200 p-6 hover:bg-muted/10 [&[data-state=open]]:bg-muted/10">
                      <div className="flex items-start gap-4 text-left w-full">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors duration-200">
                          <ChevronRight className="w-5 h-5 text-primary transition-transform duration-200 group-data-[state=open]:rotate-90" />
                        </div>
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-semibold text-secondary leading-relaxed mb-1">
                            {faq.question}
                          </h3>
                          {faq.category && (
                            <span className="inline-block px-2 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-md">
                              {faq.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="ml-14 pt-2">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {faq.answer}
                        </p>
                        {faq.details && (
                          <div className="prose prose-sm max-w-none">
                            <div 
                              className="text-muted-foreground leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: faq.details }}
                            />
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="bg-accent/30 border-t border-primary/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-lg mb-4 text-secondary">Still Have Questions?</h2>
            <p className="body-md text-muted-foreground mb-8 leading-relaxed">
              Our Costa del Sol experts are ready to provide personalized guidance for your luxury property journey across Marbella, Estepona, and Fuengirola.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 professional-hover"
                aria-label="Book your private property viewing"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Your Private Viewing
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-border hover:bg-muted/50 text-secondary font-semibold px-8 py-4 minimal-hover"
                aria-label="Speak to a local expert"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Speak to a Local Expert
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 z-50 professional-hover"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 mx-auto" />
        </button>
      )}
      </div>
    </>
  );
};

export default FAQ;
