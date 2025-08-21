
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Plus } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    {
      question: "What makes Costa Del Sol properties a good investment?",
      answer: "Costa Del Sol offers exceptional investment potential with year-round sunshine, strong rental yields (4-6%), growing international demand, and significant infrastructure development. The region's luxury property market has shown consistent growth, particularly in Marbella and Estepona, with properties appreciating 3-5% annually over the past decade."
    },
    {
      question: "What are the typical costs when buying property in Spain?",
      answer: "Total costs typically range from 10-12% of the property price. This includes: Transfer Tax (6-10% depending on region), Notary fees (0.1-0.5%), Legal fees (1-2%), Registration fees (0.1-0.3%), and Property survey costs. We provide detailed cost breakdowns for each property to ensure full transparency."
    },
    {
      question: "Can non-EU residents buy property in Spain?",
      answer: "Yes, non-EU residents can freely purchase property in Spain with no restrictions. You'll need to obtain a NIE (Número de Identificación de Extranjero) number, which we can help arrange. Many of our clients are international buyers from the UK, USA, Middle East, and other regions."
    },
    {
      question: "What areas do you specialize in along Costa Del Sol?",
      answer: "We specialize in the premium coastal areas: Marbella (including Golden Mile and Puerto Banús), Estepona, Fuengirola, Mijas, and Benalmádena. Each location offers unique advantages - Marbella for luxury and prestige, Estepona for value and growth potential, and Fuengirola for family-friendly amenities."
    },
    {
      question: "How long does the property buying process take?",
      answer: "The typical timeline is 6-8 weeks from offer acceptance to completion. This includes: Property search and viewing (1-2 weeks), Legal due diligence (2-3 weeks), Mortgage approval if needed (3-4 weeks), and Final signing at notary (1 week). We manage the entire process to ensure smooth completion."
    },
    {
      question: "Do you offer after-sales services and property management?",
      answer: "Yes, we provide comprehensive after-sales support including property management, rental management, maintenance services, utility setup, and ongoing legal support. Our local team ensures your property is well-maintained and can assist with any requirements as a property owner in Spain."
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h2 className="heading-lg mb-4 text-secondary">Frequently Asked Questions</h2>
          <p className="body-md text-muted-foreground max-w-xl mx-auto">
            Get answers to common questions about buying luxury real estate in Costa Del Sol
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-0"
              >
                <div className="sleek-card rounded-xl overflow-hidden group minimal-hover">
                  <AccordionTrigger className="text-left hover:no-underline transition-all duration-200 p-6 hover:bg-muted/20">
                    <div className="flex items-start gap-4 text-left w-full">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center mt-0.5 group-hover:bg-primary/15 transition-colors duration-200">
                        <Plus className="w-3 h-3 text-primary transition-transform duration-200 group-data-[state=open]:rotate-45" />
                      </div>
                      <h3 className="text-base font-semibold text-secondary leading-relaxed pr-4">
                        {faq.question}
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="ml-10 pt-2 border-l border-border/30 pl-4">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Compact CTA Section */}
        <div className="text-center mt-12">
          <div className="sleek-card p-8 rounded-2xl max-w-xl mx-auto">
            <h3 className="heading-sm mb-3 text-secondary">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Our expert team is here to help you find your perfect property in Costa Del Sol.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg professional-hover text-sm">
                Schedule Consultation
              </button>
              <button className="px-6 py-3 bg-muted/50 border border-border/50 rounded-lg hover:bg-muted/70 transition-all duration-200 text-secondary font-medium text-sm">
                Contact Our Experts
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
