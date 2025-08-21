
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Calendar, MessageSquare, Star, ArrowRight } from 'lucide-react';

const FAQSection = () => {
  const faqs = [
    {
      question: "What is the average luxury home price in Costa del Sol?",
      answer: "Luxury properties in Costa del Sol range from €500,000 to €10M+. Marbella's Golden Mile averages €2-5M, while Estepona's New Golden Mile offers excellent value at €800K-2M. Our luxury portfolio includes exclusive villas, penthouses, and beachfront apartments with private pools, sea views, and premium amenities.",
      category: "Investment"
    },
    {
      question: "How long does buying property in Costa del Sol take?",
      answer: "The complete property purchase process typically takes 6-8 weeks. This includes property search (1-2 weeks), legal due diligence and NIE number acquisition (2-3 weeks), mortgage approval if required (3-4 weeks), and final notary signing (1 week). Our dedicated team manages every step for international buyers.",
      category: "Process"
    },
    {
      question: "Can foreign investors buy luxury real estate in Spain?",
      answer: "Yes, non-EU residents can freely purchase Spanish property with no restrictions. You'll need a NIE number (tax identification), which we help obtain. Many international clients invest in Costa del Sol for rental income (4-6% yields), lifestyle, and EU residency opportunities through Golden Visa programs.",
      category: "Legal"
    },
    {
      question: "What luxury amenities are included in Costa del Sol properties?",
      answer: "Premium properties feature infinity pools, private gardens, home automation systems, wine cellars, spa facilities, private gyms, and panoramic sea views. Many include concierge services, 24/7 security, beach club access, and proximity to championship golf courses like Valderrama and Real Club de Golf Las Brisas.",
      category: "Features"
    },
    {
      question: "Which Costa del Sol areas offer the best investment potential?",
      answer: "Marbella's Puerto Banús and Golden Mile remain prime investment zones. Estepona shows strong growth potential with new infrastructure. Fuengirola offers family-friendly investments, while Mijas provides golf course proximity. We analyze market trends, rental yields, and capital appreciation for optimal investment guidance.",
      category: "Investment"
    },
    {
      question: "What after-purchase services do you provide for luxury property owners?",
      answer: "Our comprehensive after-sales support includes property management, luxury rental services, maintenance coordination, utility setup, tax guidance, and ongoing legal support. We also offer interior design services, security systems installation, and connections to exclusive local services for seamless luxury living.",
      category: "Services"
    }
  ];

  return (
    <>
      {/* JSON-LD FAQ Structured Data for AEO */}
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

      {/* GEO Location Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Place",
          "name": "Costa del Sol",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": "Andalusia",
            "addressCountry": "Spain"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "36.5105",
            "longitude": "-4.8803"
          },
          "containedInPlace": [
            {
              "@type": "City",
              "name": "Marbella"
            },
            {
              "@type": "City", 
              "name": "Estepona"
            },
            {
              "@type": "City",
              "name": "Fuengirola"
            }
          ]
        })
      }} />

      <section className="py-24 bg-gradient-to-b from-secondary/90 via-secondary to-secondary/95 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/8"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-primary/20">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Expert Knowledge Base</span>
            </div>
            <h2 className="heading-xl mb-6 text-white">
              Your Questions, Answered by{' '}
              <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                Costa Del Sol Experts
              </span>
            </h2>
            <p className="body-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
              Get instant answers from our 15+ years of luxury real estate expertise in Marbella, Estepona, Fuengirola, and beyond. Everything you need to know about buying premium properties in Spain's most exclusive coastal region.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card className="max-w-5xl mx-auto bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-scale-in">
            <div className="p-8">
              <Accordion type="single" collapsible className="w-full space-y-6">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left hover:text-primary transition-colors text-lg font-semibold text-white hover:no-underline group">
                      <div className="flex items-start gap-4 text-left">
                        <div className="p-3 bg-primary/20 rounded-lg mt-1 group-hover:bg-primary/30 transition-colors">
                          <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-medium">
                              {faq.category}
                            </span>
                          </div>
                          <span className="block">{faq.question}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-white/80 pt-4 leading-relaxed ml-16 text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center mt-16 animate-fade-in-delay">
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="heading-md text-white mb-4">
                Ready to Find Your Dream Home?
              </h3>
              <p className="body-md text-white/70 mb-8">
                Still have questions? Our luxury property experts are standing by to provide personalized guidance for your Costa del Sol investment journey.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="h-14 px-8 gold-gradient text-secondary font-bold hover-gold shadow-xl group">
                <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Book Your Private Viewing
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button className="h-14 px-8 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 transition-all group">
                <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Schedule Consultation
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Free Consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Expert Guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>No Obligation</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQSection;
