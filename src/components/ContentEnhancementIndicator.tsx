import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Zap } from 'lucide-react';

interface ContentEnhancementIndicatorProps {
  qualityScore: number;
  voiceReady: boolean;
  citationReady: boolean;
  isCompact?: boolean;
}

export const ContentEnhancementIndicator: React.FC<ContentEnhancementIndicatorProps> = ({
  qualityScore,
  voiceReady,
  citationReady,
  isCompact = true
}) => {
  // Only show enhancement indicator for high-quality content
  if (qualityScore < 8 || !citationReady || !voiceReady) {
    return null;
  }

  return (
    <div className="content-quality-enhancement">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-green-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-green-800">Content Enhanced</span>
            <Badge variant="outline" className="text-xs bg-white border-green-300 text-green-700">
              Expert Level
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-green-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>AI Optimized</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Voice Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Citation Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEnhancementIndicator;