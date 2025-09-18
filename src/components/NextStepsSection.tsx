import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Phone, Calendar, MessageCircle } from 'lucide-react';

interface NextStep {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  icon: React.ReactNode;
  priority: 'primary' | 'secondary';
}

interface NextStepsSectionProps {
  funnelStage: string;
  topic?: string;
  city?: string;
  className?: string;
}

export const NextStepsSection: React.FC<NextStepsSectionProps> = ({
  funnelStage,
  topic,
  city,
  className = ''
}) => {
  const getNextSteps = (): NextStep[] => {
    switch (funnelStage) {
      case 'TOFU':
        return [
          {
            title: 'Explore Market Insights',
            description: 'Learn about current property trends and investment opportunities in Costa del Sol',
            ctaText: 'View Market Analysis',
            ctaLink: '/blog',
            icon: <MapPin className="w-5 h-5" />,
            priority: 'primary'
          },
          {
            title: 'Browse Properties',
            description: 'Discover available properties that match your preferences and budget',
            ctaText: 'Search Properties',
            ctaLink: '/#properties',
            icon: <MapPin className="w-5 h-5" />,
            priority: 'secondary'
          }
        ];
        
      case 'MOFU':
        return [
          {
            title: 'Get Personalized Consultation',
            description: 'Schedule a free consultation with our Costa del Sol property experts',
            ctaText: 'Book Consultation',
            ctaLink: '/book-viewing',
            icon: <Calendar className="w-5 h-5" />,
            priority: 'primary'
          },
          {
            title: 'Compare Properties',
            description: `View similar properties in ${city || 'your preferred area'} to find the best match`,
            ctaText: 'Compare Options',
            ctaLink: '/#properties',
            icon: <MapPin className="w-5 h-5" />,
            priority: 'secondary'
          }
        ];
        
      case 'BOFU':
        return [
          {
            title: 'Schedule Property Viewing',
            description: 'Book a private viewing of properties that meet your exact requirements',
            ctaText: 'Book Viewing Now',
            ctaLink: '/book-viewing',
            icon: <Calendar className="w-5 h-5" />,
            priority: 'primary'
          },
          {
            title: 'Speak with Expert',
            description: 'Get immediate answers from our licensed property advisors',
            ctaText: 'Call Now',
            ctaLink: 'tel:+34-123-456-789',
            icon: <Phone className="w-5 h-5" />,
            priority: 'secondary'
          }
        ];
        
      default:
        return [];
    }
  };

  const nextSteps = getNextSteps();
  
  if (nextSteps.length === 0) return null;

  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <ArrowRight className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">What's Next?</h3>
        <Badge variant="outline" className="text-xs">
          Recommended Actions
        </Badge>
      </div>
      
      <div className="space-y-4">
        {nextSteps.map((step, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              step.priority === 'primary' 
                ? 'bg-primary/5 border-primary/20' 
                : 'bg-background border-border'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                step.priority === 'primary' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                
                <Button 
                  asChild
                  variant={step.priority === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  className="transition-all duration-200 hover:scale-105"
                >
                  <a href={step.ctaLink}>
                    {step.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">
              Need help deciding? Our AI assistant is here 24/7
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NextStepsSection;