import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, User, Calendar, CheckCircle, MessageSquare } from 'lucide-react';
import { FreshnessIndicator } from '@/components/FreshnessIndicator';
import { processMarkdownContent } from '@/utils/markdown';

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
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-sm mb-8">
      <div className="flex items-start gap-6">
        {/* Icon Section */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex-1">
          {/* Main Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {title}
          </h1>
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Only show positive badges for quality content */}
            {citationReady && qualityScore >= 8 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Content Enhanced ✓
              </span>
            )}
            
            {voiceReady && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Shield className="w-4 h-4 mr-1" />
                Voice Optimized
              </span>
            )}
            
            {qualityScore >= 8 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                Expert Reviewed
              </span>
            )}
            
            <Badge 
              variant="outline" 
              className={`${stageColors[funnelStage as keyof typeof stageColors]} font-medium`}
            >
              {stageLabels[funnelStage as keyof typeof stageLabels] || 'Getting Started'}
            </Badge>
          </div>

          {/* Excerpt */}
          <div 
            className="text-gray-700 text-lg leading-relaxed mb-4 max-w-4xl"
            dangerouslySetInnerHTML={{ __html: processMarkdownContent(excerpt) }}
          />

          {/* Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span className="font-medium">Reviewed by</span>
              <span className="text-gray-900">Maria Rodriguez, Costa del Sol Specialist</span>
            </div>

            <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <FreshnessIndicator lastUpdated={lastUpdated} dateModified={lastUpdated} />
            </div>

            <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QAHeroSection;