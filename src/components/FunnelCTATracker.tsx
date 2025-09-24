import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackCTAClick, trackFunnelProgression } from '@/utils/analytics';

interface FunnelCTATrackerProps {
  funnelStage: string;
  currentSlug: string;
  topic?: string;
  className?: string;
}

export const FunnelCTATracker: React.FC<FunnelCTATrackerProps> = ({
  funnelStage,
  currentSlug,
  topic,
  className = ''
}) => {
  const handleCTAClick = (ctaType: string, destination: string) => {
    trackCTAClick(ctaType, `${funnelStage}_backlink`, destination);
    trackFunnelProgression(funnelStage, 'exploration', currentSlug);
  };

  // Only show backlink for BOFU articles
  if (funnelStage !== 'BOFU') return null;

  return (
    <Card className={`p-4 mb-6 bg-muted/30 border-dashed ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <BookOpen className="w-3 h-3 mr-1" />
            Need More Research?
          </Badge>
          <p className="text-sm text-muted-foreground">
            Not quite ready to buy? Explore our research guides
          </p>
        </div>
        
        <Button 
          asChild 
          variant="outline" 
          size="sm"
          onClick={() => handleCTAClick('bofu_backlink', '/qa?stage=research')}
          className="hover:bg-muted"
        >
          <Link to="/qa?stage=research" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Research Guides
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default FunnelCTATracker;