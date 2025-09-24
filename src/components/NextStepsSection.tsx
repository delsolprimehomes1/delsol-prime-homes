import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageCircle, BookOpen, Search, PhoneCall } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';

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
          const previewText = nextMofuArticle.title.length > 60 
            ? nextMofuArticle.title.substring(0, 57) + '...' 
            : nextMofuArticle.title;
          return {
            title: 'Deep Dive Research',
            description: `Next: ${previewText}`,
            ctaText: `Explore ${topic} research guide →`,
            ctaLink: `/qa/${nextMofuArticle.slug}`,
            icon: <Search className="w-5 h-5" />
          };
        }
        return {
          title: 'Ready to Research?',
          description: 'Explore detailed guides and expert insights for your property journey',
          ctaText: 'Explore detailed guides →',
          ctaLink: '/qa?stage=research',
          icon: <BookOpen className="w-5 h-5" />
        };
        
      case 'MOFU':
        if (nextBofuArticle) {
          const previewText = nextBofuArticle.title.length > 50 
            ? nextBofuArticle.title.substring(0, 47) + '...' 
            : nextBofuArticle.title;
          return {
            title: 'Final Decision Steps',
            description: `Ready to act: ${previewText}`,
            ctaText: 'What to confirm before buying →',
            ctaLink: `/qa/${nextBofuArticle.slug}`,
            icon: <ArrowRight className="w-5 h-5" />
          };
        }
        return {
          title: 'Ready for Action?',
          description: 'Get decision-ready with expert action guides and final confirmations',
          ctaText: 'View action guides →',
          ctaLink: '/qa?stage=decision',
          icon: <ArrowRight className="w-5 h-5" />
        };
        
      case 'BOFU':
        return {
          title: 'Your Dream Home is Waiting',
          description: 'Schedule your consultation now — our experts are ready to help you secure your perfect property',
          ctaText: 'Book consultation now →',
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
              onClick={() => {
                if (nextStep.ctaLink === '#booking-chatbot') {
                  handleClick();
                } else {
                  // Track funnel CTA click for navigation
                  const ctaType = funnelStage === 'TOFU' ? 'tofu_next_step' : 
                                 funnelStage === 'MOFU' ? 'mofu_next_step' : 'bofu_conversion';
                  
                  trackCTAClick(ctaType, nextStep.ctaText, nextStep.ctaLink);
                }
              }}
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