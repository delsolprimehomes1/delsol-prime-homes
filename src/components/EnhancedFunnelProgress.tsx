import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp } from 'lucide-react';

interface EnhancedFunnelProgressProps {
  currentStage: 'TOFU' | 'MOFU' | 'BOFU';
  topic?: string;
  totalArticlesInTopic?: number;
  currentPosition?: number;
  estimatedTimeToConversion?: number;
  className?: string;
}

export const EnhancedFunnelProgress: React.FC<EnhancedFunnelProgressProps> = ({
  currentStage,
  topic,
  totalArticlesInTopic = 0,
  currentPosition = 0,
  estimatedTimeToConversion = 15,
  className = ''
}) => {
  const stageConfig = {
    TOFU: { 
      label: 'Getting Started', 
      progress: 25, 
      color: 'bg-blue-500',
      icon: Clock,
      description: 'Building foundation'
    },
    MOFU: { 
      label: 'Researching', 
      progress: 65, 
      color: 'bg-orange-500',
      icon: TrendingUp,
      description: 'Comparing options'
    },
    BOFU: { 
      label: 'Ready to Buy', 
      progress: 90, 
      color: 'bg-green-500',
      icon: Target,
      description: 'Making decisions'
    }
  };

  const config = stageConfig[currentStage];
  const IconComponent = config.icon;
  
  const topicProgress = totalArticlesInTopic > 0 
    ? Math.round((currentPosition / totalArticlesInTopic) * 100) 
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Funnel Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {config.label}
          </Badge>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{config.description}</span>
            <span>{config.progress}% complete</span>
          </div>
          <Progress value={config.progress} className="h-2" />
        </div>
      </div>

      {/* Topic-Specific Progress */}
      {topic && totalArticlesInTopic > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.color}`} />
            <span className="text-xs font-medium">{topic} Journey</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Article {currentPosition} of {totalArticlesInTopic}</span>
              <span>{topicProgress}%</span>
            </div>
            <Progress value={topicProgress} className="h-1.5" />
          </div>
        </div>
      )}

      {/* Estimated Time to Conversion */}
      {currentStage !== 'BOFU' && (
        <div className="text-xs text-muted-foreground text-center">
          <Clock className="w-3 h-3 inline mr-1" />
          Estimated {estimatedTimeToConversion} min to decision-ready
        </div>
      )}
    </div>
  );
};

export default EnhancedFunnelProgress;