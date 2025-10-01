import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface BlogFAQSectionProps {
  faqs: FAQ[];
  className?: string;
}

export const BlogFAQSection: React.FC<BlogFAQSectionProps> = ({
  faqs,
  className = ''
}) => {
  // Generate FAQ Schema
  const faqSchema = {
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
  };

  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <Card className={`p-6 bg-muted/20 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <Badge variant="secondary" className="ml-auto">
            {faqs.length} Questions
          </Badge>
        </div>
        
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="bg-background/60 backdrop-blur-sm border border-border rounded-lg px-4"
              data-speakable="true"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium text-foreground pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </>
  );
};

export default BlogFAQSection;
