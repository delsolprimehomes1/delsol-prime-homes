import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageCircle, BookOpen, Search, PhoneCall } from 'lucide-react';

interface NextStepsSectionProps {
  funnelStage: string;
  topic?: string;
  city?: string;
  nextMofuArticle?: { slug: string; title: string } | null;
  nextBofuArticle?: { slug: string; title: string } | null;
  appointmentBookingEnabled?: boolean;
  className?: string;
}

export const NextStepsSection: React.FC<NextStepsSectionProps> = ({
  funnelStage,
  topic,
  city,
  nextMofuArticle,
  nextBofuArticle,
  appointmentBookingEnabled,
  className = ''
}) => {
  const getSingleNextStep = () => {
    switch (funnelStage) {
      case 'TOFU':
        if (nextMofuArticle) {
          return {
            title: 'Continue Learning',
            description: `Dive deeper into ${topic} with our expert research guide`,
            ctaText: 'Continue to Next Step',
            ctaLink: `/qa/${nextMofuArticle.slug}`,
            icon: <BookOpen className="w-5 h-5" />
          };
        }
        return {
          title: 'Explore Market Research',
          description: 'Learn about property investment opportunities in Costa del Sol',
          ctaText: 'View Research Guide',
          ctaLink: '/qa',
          icon: <Search className="w-5 h-5" />
        };
        
      case 'MOFU':
        if (nextBofuArticle) {
          return {
            title: 'Ready to Take Action?',
            description: `Get decision-ready with our ${topic} action guide`,
            ctaText: 'Ready to Take Action',
            ctaLink: `/qa/${nextBofuArticle.slug}`,
            icon: <ArrowRight className="w-5 h-5" />
          };
        }
        return {
          title: 'Ready for Next Step',
          description: 'Get ready to make your property investment decision',
          ctaText: 'View Decision Guide',
          ctaLink: '/qa',
          icon: <ArrowRight className="w-5 h-5" />
        };
        
      case 'BOFU':
        return {
          title: 'Speak with Our Expert',
          description: 'Get personalized guidance and book your property consultation',
          ctaText: 'Book Your Consultation',
          ctaLink: '#booking-chatbot',
          icon: <PhoneCall className="w-5 h-5" />
        };
        
      default:
        return null;
    }
  };

  const nextStep = getSingleNextStep();
  
  if (!nextStep) return null;

  const handleClick = () => {
    if (nextStep.ctaLink === '#booking-chatbot') {
      // Scroll to booking chatbot section
      const chatbotElement = document.querySelector('[data-booking-chatbot]');
      if (chatbotElement) {
        chatbotElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <ArrowRight className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">What's Next?</h3>
        <Badge variant="outline" className="text-xs">
          Next Step
        </Badge>
      </div>
      
      <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            {nextStep.icon}
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-foreground mb-1">{nextStep.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{nextStep.description}</p>
            
            <Button 
              asChild={nextStep.ctaLink !== '#booking-chatbot'}
              variant="default"
              size="sm"
              className="transition-all duration-200 hover:scale-105"
              onClick={nextStep.ctaLink === '#booking-chatbot' ? handleClick : undefined}
            >
              {nextStep.ctaLink === '#booking-chatbot' ? (
                <>
                  {nextStep.ctaText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <a href={nextStep.ctaLink}>
                  {nextStep.ctaText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">
            Need help deciding? Our AI assistant is here 24/7
          </span>
        </div>
      </div>
    </Card>
  );
};

export default NextStepsSection;