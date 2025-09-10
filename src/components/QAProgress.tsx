import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileQuestion, Search } from 'lucide-react';

interface QAProgressProps {
  totalArticles: number;
  filteredCount: number;
}

export const QAProgress = ({ totalArticles, filteredCount }: QAProgressProps) => {
  const progressPercentage = totalArticles > 0 ? (filteredCount / totalArticles) * 100 : 0;

  return (
    <div className="bg-muted/30 py-6 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto p-6 bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <FileQuestion className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground text-lg">
                Questions & Answers
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="w-4 h-4" />
              <span className="text-xs sm:text-sm">
                Showing {filteredCount} of {totalArticles} questions
              </span>
            </div>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-muted"
          />
          
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-muted-foreground mt-2">
            <span className="text-center sm:text-left">Your Costa del Sol Journey</span>
            <span className="text-center sm:text-right font-medium">{Math.round(progressPercentage)}% explored</span>
          </div>
        </Card>
      </div>
    </div>
  );
};