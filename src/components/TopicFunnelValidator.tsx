import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { validateFunnelTopicAlignment } from '@/utils/topic-aware-linking';

export const TopicFunnelValidator: React.FC<{ language?: string }> = ({ 
  language = 'en' 
}) => {
  const { data: validation, isLoading } = useQuery({
    queryKey: ['funnel-topic-validation', language],
    queryFn: () => validateFunnelTopicAlignment(language),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topic Funnel Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getScoreIcon(validation.alignmentScore)}
          Topic Funnel Alignment
          <Badge variant={validation.alignmentScore >= 90 ? 'default' : 
                         validation.alignmentScore >= 70 ? 'secondary' : 'destructive'}>
            {validation.alignmentScore}% Aligned
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Aligned Links: {validation.alignedLinks}</span>
          <span>Total Links: {validation.totalLinks}</span>
        </div>

        {validation.misalignedPaths.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {validation.misalignedPaths.length} misaligned funnel paths found:
                </p>
                <div className="space-y-1 text-sm">
                  {validation.misalignedPaths.slice(0, 5).map((path, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {path.type}
                      </Badge>
                      <span>
                        {path.from.topic} → {path.to.topic}
                      </span>
                    </div>
                  ))}
                  {validation.misalignedPaths.length > 5 && (
                    <p className="text-muted-foreground">
                      ...and {validation.misalignedPaths.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validation.alignmentScore === 100 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Perfect! All funnel links maintain topic consistency.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};