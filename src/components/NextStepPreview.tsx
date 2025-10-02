import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { trackFunnelProgression } from '@/utils/analytics';

interface NextStepPreviewProps {
  nextStep: {
    title: string;
    slug?: string;
    url?: string;
    cta?: string;
    preview?: string;
    funnelStage?: 'TOFU' | 'MOFU' | 'BOFU';
  } | null;
  currentTopic: string;
  currentStage: string;
  currentSlug: string;
  className?: string;
}

export const NextStepPreview = ({
  nextStep,
  currentTopic,
  currentStage,
  currentSlug,
  className = ''
}: NextStepPreviewProps) => {
  const navigate = useNavigate();

  if (!nextStep) return null;

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'TOFU': return <TrendingUp className="w-4 h-4" />;
      case 'MOFU': return <Target className="w-4 h-4" />;
      case 'BOFU': return <CheckCircle className="w-4 h-4" />;
      default: return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'MOFU': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'BOFU': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleClick = () => {
    const targetUrl = nextStep.url || `/qa/${nextStep.slug}`;
    
    // Track funnel progression
    trackFunnelProgression(
      currentStage,
      nextStep.funnelStage || 'unknown',
      currentSlug
    );

    if (nextStep.url?.startsWith('http')) {
      window.open(nextStep.url, '_blank');
    } else if (nextStep.slug) {
      navigate(`/qa/${nextStep.slug}`);
    } else if (nextStep.url) {
      navigate(nextStep.url);
    }
  };

  return (
    <Card className={`overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 ${className}`}>
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">What's Next?</h3>
          {nextStep.funnelStage && (
            <Badge 
              variant="outline" 
              className={`gap-1.5 ${getStageColor(nextStep.funnelStage)}`}
            >
              {getStageIcon(nextStep.funnelStage)}
              <span>{nextStep.funnelStage}</span>
            </Badge>
          )}
        </div>

        <h4 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
          {nextStep.title}
        </h4>

        {nextStep.preview && (
          <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
            {nextStep.preview}
          </p>
        )}

        <Button 
          onClick={handleClick}
          size="lg"
          className="w-full sm:w-auto gap-2 group"
        >
          {nextStep.cta || 'Continue Your Journey'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Topic: <span className="font-medium text-foreground">{currentTopic}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};
