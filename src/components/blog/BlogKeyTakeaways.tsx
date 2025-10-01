import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface BlogKeyTakeawaysProps {
  takeaways: string[];
  className?: string;
}

export const BlogKeyTakeaways: React.FC<BlogKeyTakeawaysProps> = ({
  takeaways,
  className = ''
}) => {
  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-primary/20 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Quick Summary - Key Takeaways
        </h2>
        <Badge variant="secondary" className="ml-auto">
          AI Optimized
        </Badge>
      </div>
      
      <div className="space-y-3" data-speakable="true">
        {takeaways.map((takeaway, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-lg bg-background/60 backdrop-blur-sm transition-all hover:bg-background/80"
          >
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground leading-relaxed">
              {takeaway}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-primary/10">
        <p className="text-xs text-muted-foreground">
          💡 This summary is optimized for voice assistants and quick reading
        </p>
      </div>
    </Card>
  );
};

export default BlogKeyTakeaways;
