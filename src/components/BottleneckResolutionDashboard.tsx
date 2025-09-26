import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  TrendingUp, 
  Users, 
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import { FunnelAnalyzer } from '@/utils/funnel-analyzer';
import { SmartLinkingEngine } from '@/utils/smart-linking';
import { toast } from 'sonner';

interface BottleneckStats {
  totalBottlenecks: number;
  avgSourceCount: number;
  topicsAffected: string[];
  severityDistribution: { high: number; medium: number; low: number };
}

export const BottleneckResolutionDashboard: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const queryClient = useQueryClient();
  
  // Fetch current bottlenecks
  const { data: bottlenecks, isLoading: bottlenecksLoading, refetch: refetchBottlenecks } = useQuery({
    queryKey: ['funnel-bottlenecks', selectedLanguage],
    queryFn: () => FunnelAnalyzer.analyzeFunnelBottlenecks(selectedLanguage),
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  // Calculate bottleneck statistics
  const bottleneckStats: BottleneckStats = React.useMemo(() => {
    if (!bottlenecks) return { totalBottlenecks: 0, avgSourceCount: 0, topicsAffected: [], severityDistribution: { high: 0, medium: 0, low: 0 } };
    
    const totalBottlenecks = bottlenecks.length;
    const avgSourceCount = bottlenecks.reduce((acc, b) => acc + b.sourceCount, 0) / totalBottlenecks || 0;
    const topicsAffected = [...new Set(bottlenecks.map(b => b.targetArticle.topic))];
    
    const severityDistribution = bottlenecks.reduce((acc, b) => {
      if (b.sourceCount >= 50) acc.high++;
      else if (b.sourceCount >= 20) acc.medium++;
      else acc.low++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    return { totalBottlenecks, avgSourceCount, topicsAffected, severityDistribution };
  }, [bottlenecks]);

  // Preview bottleneck fixes
  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ['bottleneck-preview', selectedLanguage, bottlenecks],
    queryFn: () => {
      if (!bottlenecks || bottlenecks.length === 0) return null;
      return SmartLinkingEngine.previewBottleneckFixes(bottlenecks);
    },
    enabled: !!bottlenecks && bottlenecks.length > 0,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fix bottlenecks mutation
  const fixBottlenecksMutation = useMutation({
    mutationFn: async () => {
      if (!bottlenecks || bottlenecks.length === 0) {
        throw new Error('No bottlenecks to fix');
      }
      return SmartLinkingEngine.fixBottlenecks(bottlenecks, selectedLanguage);
    },
    onSuccess: (result) => {
      toast.success(`Successfully created ${result.articlesCreated} articles and rebalanced ${result.linksRebalanced} links`);
      queryClient.invalidateQueries({ queryKey: ['funnel-bottlenecks'] });
      queryClient.invalidateQueries({ queryKey: ['bottleneck-preview'] });
      refetchBottlenecks();
    },
    onError: (error) => {
      console.error('Error fixing bottlenecks:', error);
      toast.error('Failed to fix bottlenecks. Please try again.');
    }
  });

  const getSeverityColor = (sourceCount: number) => {
    if (sourceCount >= 50) return 'destructive';
    if (sourceCount >= 20) return 'default';
    return 'secondary';
  };

  const getSeverityLabel = (sourceCount: number) => {
    if (sourceCount >= 50) return 'High';
    if (sourceCount >= 20) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bottleneck Resolution</h2>
          <p className="text-muted-foreground">
            Automatically fix funnel bottlenecks by creating targeted articles and redistributing links
          </p>
        </div>
        <Button 
          onClick={() => refetchBottlenecks()} 
          variant="outline" 
          disabled={bottlenecksLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${bottlenecksLoading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-warning mr-3" />
              <div>
                <p className="text-2xl font-bold">{bottleneckStats.totalBottlenecks}</p>
                <p className="text-sm text-muted-foreground">Total Bottlenecks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-primary mr-3" />
              <div>
                <p className="text-2xl font-bold">{Math.round(bottleneckStats.avgSourceCount)}</p>
                <p className="text-sm text-muted-foreground">Avg. Source Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{bottleneckStats.topicsAffected.length}</p>
                <p className="text-sm text-muted-foreground">Topics Affected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{bottleneckStats.severityDistribution.high}</p>
                <p className="text-sm text-muted-foreground">High Severity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Current Analysis</TabsTrigger>
          <TabsTrigger value="preview">Fix Preview</TabsTrigger>
          <TabsTrigger value="resolution">Auto Resolution</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Bottlenecks</CardTitle>
              <CardDescription>
                Articles receiving too many incoming links from source articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bottlenecksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Analyzing funnel bottlenecks...</span>
                </div>
              ) : bottlenecks && bottlenecks.length > 0 ? (
                <div className="space-y-4">
                  {bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{bottleneck.targetArticle.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {bottleneck.targetArticle.topic} • {bottleneck.targetArticle.funnel_stage}
                          </p>
                        </div>
                        <Badge variant={getSeverityColor(bottleneck.sourceCount)}>
                          {getSeverityLabel(bottleneck.sourceCount)} • {bottleneck.sourceCount} links
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Link Distribution</span>
                          <span>{bottleneck.sourceCount} source articles</span>
                        </div>
                        <Progress value={Math.min((bottleneck.sourceCount / 100) * 100, 100)} className="h-2" />
                      </div>
                      
                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary hover:text-primary/80 mb-2">
                          View source articles ({bottleneck.sourceArticles.length})
                        </summary>
                        <div className="grid gap-2 pl-4">
                          {bottleneck.sourceArticles.slice(0, 5).map((source, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-border/50">
                              <span className="truncate flex-1">{source.title}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {source.topic}
                              </Badge>
                            </div>
                          ))}
                          {bottleneck.sourceArticles.length > 5 && (
                            <p className="text-muted-foreground text-xs">
                              ...and {bottleneck.sourceArticles.length - 5} more articles
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No Bottlenecks Detected!</p>
                  <p className="text-muted-foreground">Your funnel is well-balanced.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolution Preview</CardTitle>
              <CardDescription>
                Preview of changes that will be made to fix bottlenecks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Generating fix preview...</span>
                </div>
              ) : previewData ? (
                <div className="space-y-4">
                  <Alert>
                    <Zap className="w-4 h-4" />
                    <AlertDescription>{previewData.summary}</AlertDescription>
                  </Alert>
                  
                  {previewData.articlesToCreate.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Articles to Create ({previewData.articlesToCreate.length})</h4>
                      <div className="grid gap-2">
                        {previewData.articlesToCreate.map((article, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{article.title}</p>
                              <p className="text-sm text-muted-foreground">{article.topic} • {article.stage}</p>
                            </div>
                            <Badge variant="outline">{article.stage}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {previewData.linksToUpdate.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Links to Update ({previewData.linksToUpdate.length})</h4>
                      <div className="grid gap-2 max-h-64 overflow-y-auto">
                        {previewData.linksToUpdate.slice(0, 10).map((update, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 text-sm border rounded">
                            <span className="truncate flex-1">{update.sourceTitle}</span>
                            <div className="flex items-center ml-2">
                              <ArrowRight className="w-3 h-3 mx-2 text-muted-foreground" />
                              <span className="text-primary">{update.newTarget}</span>
                            </div>
                          </div>
                        ))}
                        {previewData.linksToUpdate.length > 10 && (
                          <p className="text-xs text-muted-foreground text-center">
                            ...and {previewData.linksToUpdate.length - 10} more updates
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No bottlenecks to preview fixes for.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Resolution</CardTitle>
              <CardDescription>
                Automatically fix all detected bottlenecks by creating new articles and redistributing links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bottlenecks && bottlenecks.length > 0 ? (
                <>
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      This will create new articles and modify existing link relationships. 
                      Make sure to review the changes in the Preview tab first.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => fixBottlenecksMutation.mutate()}
                      disabled={fixBottlenecksMutation.isPending}
                      className="flex-1"
                    >
                      {fixBottlenecksMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Resolving Bottlenecks...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Fix All Bottlenecks
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {fixBottlenecksMutation.isError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        Failed to fix bottlenecks. Please check the console for details and try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">All Clear!</p>
                  <p className="text-muted-foreground">No bottlenecks detected that need resolution.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BottleneckResolutionDashboard;