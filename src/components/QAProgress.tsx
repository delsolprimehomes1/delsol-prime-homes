import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QAProgressProps {
  currentArticles: Array<{
    funnel_stage: string;
  }>;
  funnelStats: {
    TOFU: number;
    MOFU: number;
    BOFU: number;
  };
  funnelConfig: {
    [key: string]: {
      label: string;
      icon: any;
      color: string;
      description: string;
    };
  };
}

const QAProgress: React.FC<QAProgressProps> = ({ 
  currentArticles, 
  funnelStats, 
  funnelConfig 
}) => {
  const totalArticles = funnelStats.TOFU + funnelStats.MOFU + funnelStats.BOFU;
  const currentStats = {
    TOFU: currentArticles.filter(a => a.funnel_stage === 'TOFU').length,
    MOFU: currentArticles.filter(a => a.funnel_stage === 'MOFU').length,
    BOFU: currentArticles.filter(a => a.funnel_stage === 'BOFU').length,
  };

  const stages = [
    { key: 'TOFU', progress: totalArticles ? (funnelStats.TOFU / totalArticles) * 100 : 0 },
    { key: 'MOFU', progress: totalArticles ? (funnelStats.MOFU / totalArticles) * 100 : 0 },
    { key: 'BOFU', progress: totalArticles ? (funnelStats.BOFU / totalArticles) * 100 : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Journey Overview */}
      <div className="text-center mb-8">
        <h2 className="heading-md mb-2">Your Property Journey</h2>
        <p className="text-muted-foreground">
          Navigate from discovery to decision with our expert guidance
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stages.map((stage, index) => {
          const config = funnelConfig[stage.key];
          const Icon = config?.icon || Target;
          const isActive = currentStats[stage.key as keyof typeof currentStats] > 0;
          
          return (
            <Card 
              key={stage.key}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-md",
                isActive ? "ring-2 ring-primary/20 bg-primary/5" : "hover:bg-muted/30"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg text-white",
                      config?.color || "bg-gray-500"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{config?.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {config?.description}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {currentStats[stage.key as keyof typeof currentStats]}/{funnelStats[stage.key as keyof typeof funnelStats]}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Available guides</span>
                    <span className="font-medium">
                      {funnelStats[stage.key as keyof typeof funnelStats]} articles
                    </span>
                  </div>
                  <Progress 
                    value={stage.progress} 
                    className={cn(
                      "h-2",
                      isActive && "bg-primary/20"
                    )}
                  />
                </div>

                {/* Connection Arrow (except for last item) */}
                {index < stages.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="bg-white rounded-full p-2 shadow-md border">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Journey Progress Bar */}
      <Card className="p-6 bg-gradient-to-r from-muted/50 via-background to-accent/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Overall Progress</h3>
          <span className="text-sm text-muted-foreground">
            {currentArticles.length} of {totalArticles} guides explored
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={totalArticles ? (currentArticles.length / totalArticles) * 100 : 0}
            className="h-3"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Getting Started</span>
            <span>Ready to Buy</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QAProgress;