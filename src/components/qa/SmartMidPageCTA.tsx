import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, Phone, ArrowRight, Star, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SmartMidPageCTAProps {
  funnelStage: string;
  topic: string;
  relatedArticles?: Array<{slug: string; title: string; topic: string}>;
  className?: string;
  variant?: 'default' | 'compact' | 'footer';
}

export const SmartMidPageCTA: React.FC<SmartMidPageCTAProps> = ({
  funnelStage,
  topic,
  relatedArticles = [],
  className = '',
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'max-w-2xl mx-auto';
      case 'footer':
        return 'max-w-3xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  const getPaddingClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-4 md:p-6';
      case 'footer':
        return 'p-5 md:p-7';
      default:
        return 'p-6 md:p-8';
    }
  };
  const getStageSpecificContent = () => {
    switch (funnelStage) {
      case 'TOFU':
        return {
          title: '📢 Want Personalized Guidance?',
          subtitle: 'Our Costa del Sol specialists are available 7 days a week.',
          primaryCTA: {
            text: 'Talk to an Agent',
            icon: Phone,
            href: 'tel:+34952123456'
          },
          secondaryCTA: {
            text: 'Get Property Checklist',
            icon: Calendar,
            href: '/book-viewing'
          },
          beforeMessage: `Before you start exploring ${topic.toLowerCase()} options, you might want to know about...`
        };
      case 'MOFU':
        return {
          title: '🎯 Ready to Compare Options?',
          subtitle: 'Get expert insights tailored to your specific needs.',
          primaryCTA: {
            text: 'Book a Consultation',
            icon: Calendar,
            href: '/book-viewing'
          },
          secondaryCTA: {
            text: 'Chat with AI Assistant',
            icon: MessageCircle,
            href: '#chatbot'
          },
          beforeMessage: `Before you make your ${topic.toLowerCase()} decision, you might want to know about...`
        };
      case 'BOFU':
        return {
          title: '✨ Ready to Take Action?',
          subtitle: 'Schedule your viewing and get started today.',
          primaryCTA: {
            text: 'Book Your Viewing',
            icon: Calendar,
            href: '/book-viewing'
          },
          secondaryCTA: {
            text: 'Speak with Specialist',
            icon: Phone,
            href: 'tel:+34952123456'
          },
          beforeMessage: `Before you finalize your purchase, you might want to verify...`
        };
      default:
        return {
          title: '📞 Need Expert Guidance?',
          subtitle: 'Get personalized support for your property journey.',
          primaryCTA: {
            text: 'Get Started',
            icon: ArrowRight,
            href: '/book-viewing'
          },
          secondaryCTA: {
            text: 'Learn More',
            icon: MessageCircle,
            href: '/faq'
          },
          beforeMessage: 'Continue your research with...'
        };
    }
  };

  const content = getStageSpecificContent();
  const PrimaryIcon = content.primaryCTA.icon;
  const SecondaryIcon = content.secondaryCTA.icon;

  return (
    <div className={getVariantClasses()}>
      <Card className={`${getPaddingClasses()} bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20 ${className}`}>
        <div className="text-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {content.title}
          </h3>
          <p className="text-muted-foreground mb-4">
            {content.subtitle}
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 text-xs md:text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="hidden sm:inline">200+ successful expat purchases</span>
              <span className="sm:hidden">200+ purchases</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline">Legal-reviewed step-by-step</span>
              <span className="sm:hidden">Legal-reviewed</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">No pressure. Just answers.</span>
              <span className="sm:hidden">No pressure</span>
            </div>
          </div>

          {/* CTA Buttons - Mobile Touch-Optimized */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center mb-6">
            <Button 
              size="lg"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[160px] min-h-[44px] text-sm md:text-base"
              asChild
            >
              <Link to={content.primaryCTA.href}>
                <PrimaryIcon className="w-4 h-4 md:w-5 md:h-5" />
                {content.primaryCTA.text}
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none sm:min-w-[160px] min-h-[44px] text-sm md:text-base"
              asChild
            >
              <Link to={content.secondaryCTA.href}>
                <SecondaryIcon className="w-4 h-4 md:w-5 md:h-5" />
                {content.secondaryCTA.text}
              </Link>
            </Button>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-border/40 pt-4 md:pt-6">
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 text-center">
              {content.beforeMessage}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {relatedArticles.slice(0, 3).map((article, index) => (
                <Link
                  key={index}
                  to={`/qa/${article.slug}`}
                  className="block group"
                >
                  <div className="p-2 md:p-3 rounded-lg bg-background/60 border border-border/40 hover:border-primary/30 transition-all duration-200 hover:shadow-md">
                    <Badge variant="secondary" className="text-xs mb-2">
                      {article.topic}
                    </Badge>
                    <p className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Read more</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SmartMidPageCTA;