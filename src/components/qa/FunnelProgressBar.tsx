import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface FunnelProgressBarProps {
  currentStage: string;
  topic: string;
  className?: string;
}

export const FunnelProgressBar: React.FC<FunnelProgressBarProps> = ({
  currentStage,
  topic,
  className = ''
}) => {
  const { mobile } = useResponsiveLayout();
  
  const stages = [
    { key: 'TOFU', label: 'Getting Started', shortLabel: 'Start' },
    { key: 'MOFU', label: 'Researching Options', shortLabel: 'Research' },
    { key: 'BOFU', label: 'Ready to Buy', shortLabel: 'Ready' }
  ];

  const currentIndex = stages.findIndex(stage => stage.key === currentStage);

  if (mobile) {
    // Mobile: Sticky bottom progress bar
    return (
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/40 p-4 ${className}`}>
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {stages.map((stage, index) => (
            <div key={stage.key} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                ${index <= currentIndex 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground/30 text-muted-foreground'
                }
              `}>
                {index < currentIndex ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <span className={`
                ml-2 text-xs font-medium
                ${index <= currentIndex ? 'text-foreground' : 'text-muted-foreground'}
              `}>
                {stage.shortLabel}
              </span>
              {index < stages.length - 1 && (
                <ArrowRight className="w-3 h-3 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            Your {topic} Journey Progress
          </p>
        </div>
      </div>
    );
  }

  // Desktop: Top horizontal progress bar
  return (
    <div className={`bg-background/80 backdrop-blur-sm border-b border-border/40 p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-foreground">Your Journey:</span>
            <Badge variant="outline" className="text-xs">
              {topic}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            {stages.map((stage, index) => (
              <div key={stage.key} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                  ${index <= currentIndex 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground/30 text-muted-foreground'
                  }
                `}>
                  {index < currentIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={`
                  ml-2 text-sm font-medium
                  ${index <= currentIndex ? 'text-foreground' : 'text-muted-foreground'}
                `}>
                  {stage.label}
                </span>
                {index < stages.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelProgressBar;