import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, User, Calendar, CheckCircle } from 'lucide-react';
import { FreshnessIndicator } from '@/components/FreshnessIndicator';

interface QAHeroSectionProps {
  title: string;
  excerpt: string;
  readingTime: number;
  lastUpdated: string;
  funnelStage: string;
  topic: string;
  qualityScore: number;
  voiceReady: boolean;
  citationReady: boolean;
}

export const QAHeroSection: React.FC<QAHeroSectionProps> = ({
  title,
  excerpt,
  readingTime,
  lastUpdated,
  funnelStage,
  topic,
  qualityScore,
  voiceReady,
  citationReady,
}) => {
  const stageLabels = {
    TOFU: 'Getting Started',
    MOFU: 'Researching Options',
    BOFU: 'Ready to Buy'
  };

  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-700 border-blue-200',
    MOFU: 'bg-amber-500/10 text-amber-700 border-amber-200',
    BOFU: 'bg-green-500/10 text-green-700 border-green-200'
  };

  return (
    <section className="qa-hero-section mb-8">
      {/* Stage Badge */}
      <div className="mb-4">
        <Badge 
          variant="outline" 
          className={`${stageColors[funnelStage as keyof typeof stageColors]} font-medium`}
        >
          {stageLabels[funnelStage as keyof typeof stageLabels] || 'Getting Started'}
        </Badge>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
        🏠 {title}
      </h1>

      {/* Opening Summary */}
      <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-4xl">
        {excerpt}
      </p>

      {/* Meta Information */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="w-4 h-4 text-primary" />
          <span className="font-medium">Reviewed by</span>
          <span className="text-foreground">Maria Rodriguez, Costa del Sol Specialist</span>
        </div>

        <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full"></div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          <FreshnessIndicator lastUpdated={lastUpdated} dateModified={lastUpdated} />
        </div>

        <div className="hidden sm:block w-1 h-1 bg-muted-foreground rounded-full"></div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-foreground font-medium">AI Verified & Human Reviewed</span>
        </div>
      </div>

      {/* Quality Indicators */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={citationReady ? "default" : "secondary"} className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          {citationReady ? 'Citation Ready' : 'Needs Enhancement'}
        </Badge>
        
        <Badge variant={voiceReady ? "default" : "secondary"} className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {voiceReady ? 'Voice Optimized' : 'Voice Pending'}
        </Badge>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{readingTime} min read</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Quality Score: {qualityScore}/10
        </div>
      </div>
    </section>
  );
};

export default QAHeroSection;