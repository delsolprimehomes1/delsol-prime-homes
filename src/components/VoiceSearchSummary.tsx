import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Clock, MessageSquare } from 'lucide-react';

interface VoiceSearchSummaryProps {
  summary: string;
  keywords: string[];
  readingTime: number;
  className?: string;
}

export const VoiceSearchSummary: React.FC<VoiceSearchSummaryProps> = ({
  summary,
  keywords,
  readingTime,
  className = ''
}) => {
  return (
    <Card className={`p-6 bg-muted/20 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Mic className="w-5 h-5 text-primary" />
        <h3 className="font-medium text-foreground">Voice Search Summary</h3>
        <Badge variant="outline" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {Math.floor(readingTime * 0.3)} sec read
        </Badge>
      </div>
      
      <div className="voice-summary ai-optimized voice-friendly speakable mb-4" data-speakable="true">
        <p className="text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Common Voice Queries:</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {keywords.slice(0, 6).map((keyword, index) => (
            <Badge 
              key={index}
              variant="secondary" 
              className="text-xs justify-start py-2 px-3"
            >
              "{keyword}"
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default VoiceSearchSummary;