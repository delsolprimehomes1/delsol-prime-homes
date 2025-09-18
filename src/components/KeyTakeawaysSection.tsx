import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, Volume2 } from 'lucide-react';

interface KeyTakeawaysSectionProps {
  takeaways: string[];
  className?: string;
}

export const KeyTakeawaysSection: React.FC<KeyTakeawaysSectionProps> = ({
  takeaways,
  className = ''
}) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground speakable" data-speakable="true">
          Key Takeaways
        </h3>
        <Badge variant="secondary" className="text-xs">
          <Volume2 className="w-3 h-3 mr-1" />
          AI Structured
        </Badge>
      </div>
      
      <div className="key-takeaways ai-optimized voice-friendly">
        <ul className="space-y-3">
          {takeaways.map((takeaway, index) => (
            <li 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 speakable"
              data-speakable="true"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-muted-foreground leading-relaxed">
                {takeaway}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default KeyTakeawaysSection;