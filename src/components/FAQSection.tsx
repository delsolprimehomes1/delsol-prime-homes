
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, ChevronRight, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FAQSection = () => {
  const faqs = [
    {
      question: "What is the average luxury home price in Costa Del Sol?",
      answer: "Prime villas typically start around €2M+ depending on location, views and plot size. Marbella Golden Mile properties range €3M-€15M+, while Estepona offers excellent value from €1.5M-€5M. Fuengirola and Benalmádena provide entry-level luxury from €800K-€2.5M. Request a tailored shortlist based on your budget and preferences."
    },
    {
      question: "Which Costa Del Sol city is best for investment—Marbella, Estepona or Fuengirola?",
      answer: "Marbella offers prestige and strong rental yields (4-6% annually), especially in Golden Mile and Puerto Banús. Estepona shows the highest growth potential with new developments and infrastructure projects. Fuengirola provides steady returns with family-friendly appeal and lower entry costs. Each market has distinct advantages depending on your investment strategy."
    },
    {
      question: "Can I schedule a private or virtual viewing this week?",
      answer: "Yes. We arrange on-site and virtual tours across Marbella, Estepona and Fuengirola within 24-48 hours. Our team provides personalized property tours, market insights, and immediate access to off-market listings. Submit your preferred dates and property types to get started."
    }
  ];

  return (
    <section className="py-16 bg-white">
      {/* FAQ Schema Markup */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })
      }} />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-6">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h2 className="heading-lg mb-4 text-secondary">Your Questions, Answered by Costa Del Sol Experts</h2>
          <p className="body-md text-muted-foreground max-w-2xl mx-auto">
            Get expert insights from our Costa Del Sol specialists with 15+ years of luxury real estate experience
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 mb-12">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-0"
              >
                <div className="bg-white border border-border/30 rounded-lg overflow-hidden group minimal-hover">
                  <AccordionTrigger className="text-left hover:no-underline transition-all duration-200 p-6 hover:bg-muted/10 [&[data-state=open]]:bg-muted/10">
                    <div className="flex items-start gap-4 text-left w-full">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/15 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors duration-200">
                        <ChevronRight className="w-4 h-4 text-primary transition-transform duration-200 group-data-[state=open]:rotate-90" />
                      </div>
                      <h3 className="text-lg font-semibold text-secondary leading-relaxed pr-4">
                        {faq.question}
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="ml-12 pt-2">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Link to Full FAQ Page */}
        <div className="text-center mb-12">
          <a 
            href="/faq" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            aria-label="View all 255 frequently asked questions"
          >
            See all FAQs (255)
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-accent/30 border border-primary/20 rounded-2xl p-8 text-center">
            <h3 className="heading-sm mb-4 text-secondary">Ready to Find Your Dream Home?</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Our Costa Del Sol experts are ready to help you discover luxury properties in Marbella, Estepona, and Fuengirola.
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
                aria-label="Schedule consultation with our experts"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
