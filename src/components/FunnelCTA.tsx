import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Target, Lightbulb } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import { cn } from '@/lib/utils';

interface FunnelCTAProps {
  currentStage: 'TOFU' | 'MOFU' | 'BOFU';
  articleSlug: string;
  nextStepRecommendations?: Array<{
    slug: string;
    title: string;
    excerpt: string;
    funnel_stage: string;
  }>;
  className?: string;
}

const stageConfig = {
  TOFU: {
    label: 'Learn',
    icon: Lightbulb,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
    nextStage: 'MOFU',
    nextLabel: 'Compare',
    description: 'Continue exploring your options',
    ctaText: 'Explore Comparison Guides',
  },
  MOFU: {
    label: 'Compare', 
    icon: Target,
    color: 'bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800',
    nextStage: 'BOFU',
    nextLabel: 'Decide',
    description: 'Ready to take the next step?',
    ctaText: 'Get Professional Help',
  },
  BOFU: {
    label: 'Decide',
    icon: CheckCircle,
    color: 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800',
    nextStage: null,
    nextLabel: 'Convert',
    description: 'Start your Costa del Sol journey',
    ctaText: 'Contact Our Experts',
  }
};

export const FunnelCTA = ({ 
  currentStage, 
  articleSlug, 
  nextStepRecommendations = [], 
  className 
}: FunnelCTAProps) => {
  const config = stageConfig[currentStage];
  const Icon = config.icon;

  const handleCTAClick = (destination: string, ctaText: string) => {
    trackCTAClick('funnel_progression', ctaText, destination);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Journey Progress Indicator */}
      <Card className="p-6 bg-gradient-to-br from-background via-background/95 to-muted/30 border-2 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Your Costa del Sol Journey</h3>
          </div>
          <Badge variant="secondary" className={config.color}>
            {config.label} Stage
          </Badge>
        </div>
        
        {/* Progress visualization */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-8 h-2 rounded-full transition-all duration-300",
              "bg-blue-500 shadow-sm"
            )}>
              <div className="w-full h-full rounded-full bg-blue-500" />
            </div>
            <span className="text-xs text-blue-600 font-medium">Learn</span>
          </div>
          
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-8 h-2 rounded-full transition-all duration-300",
              currentStage === 'TOFU' ? "bg-muted" : "bg-orange-500 shadow-sm"
            )}>
              <div className={cn(
                "h-full rounded-full transition-all duration-500",
                currentStage === 'TOFU' ? "w-0 bg-orange-500" : "w-full bg-orange-500"
              )} />
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors duration-300",
              currentStage === 'TOFU' ? "text-muted-foreground" : "text-orange-600"
            )}>Compare</span>
          </div>
          
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-8 h-2 rounded-full transition-all duration-300",
              currentStage === 'BOFU' ? "bg-green-500 shadow-sm" : "bg-muted"
            )}>
              <div className={cn(
                "h-full rounded-full transition-all duration-500",
                currentStage === 'BOFU' ? "w-full bg-green-500" : "w-0 bg-green-500"
              )} />
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors duration-300",
              currentStage === 'BOFU' ? "text-green-600" : "text-muted-foreground"
            )}>Decide</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </Card>

      {/* Next Step Recommendations */}
      {nextStepRecommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-primary" />
            Recommended Next Steps
          </h4>
          
          <div className="grid gap-4">
            {nextStepRecommendations.slice(0, 2).map((recommendation, index) => (
              <Link
                key={recommendation.slug}
                to={`/qa/${recommendation.slug}`}
                className="block group"
                onClick={() => handleCTAClick(`/qa/${recommendation.slug}`, recommendation.title)}
              >
                <Card className="p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-l-4 border-l-primary/30 group-hover:border-l-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground group-hover:text-primary transition-colors duration-200 mb-1">
                        {recommendation.title}
                      </h5>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recommendation.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 ml-3 mt-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main CTA */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <div className="text-center space-y-4">
          <h4 className="font-semibold text-foreground">Ready for the Next Step?</h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {currentStage === 'BOFU' 
              ? 'Get personalized advice from our Costa del Sol property experts.'
              : 'Continue your journey with our comprehensive guides and expert insights.'
            }
          </p>
          
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/25"
            onClick={() => {
              const destination = currentStage === 'BOFU' ? '/contact' : '/qa';
              handleCTAClick(destination, config.ctaText);
              if (currentStage === 'BOFU') {
                window.open('/contact', '_blank');
              } else {
                window.location.href = '/qa';
              }
            }}
          >
            {config.ctaText}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};