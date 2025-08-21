
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

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
    <section className="py-20 bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="heading-xl mb-4">Frequently Asked Questions</h2>
          <p className="body-lg text-white/80 max-w-2xl mx-auto">
            Get answers to common questions about buying luxury real estate in Costa Del Sol
          </p>
        </div>

        <Card className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border-white/10">
          <div className="p-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-white/20 pb-4"
                >
                  <AccordionTrigger className="text-left hover:text-primary transition-colors text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/80 pt-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="body-md text-white/80 mb-6">
            Still have questions? Our expert team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 gold-gradient text-secondary font-semibold rounded-lg hover-gold transition-all">
              Schedule Consultation
            </button>
            <button className="px-8 py-3 border-2 border-white/30 rounded-lg hover:bg-white/10 transition-all">
              Contact Our Experts
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
