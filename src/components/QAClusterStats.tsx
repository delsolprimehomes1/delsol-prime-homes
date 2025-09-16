import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';

interface QAClusterStatsProps {
  totalArticles: number;
  filteredCount: number;
  clusterData: Array<{
    name: string;
    count: number;
    avgStageDistribution: { TOFU: number; MOFU: number; BOFU: number };
  }>;
  currentFilters: {
    searchTerm: string;
    selectedStage: string;
    selectedTopic: string;
  };
}

export const QAClusterStats = ({ 
  totalArticles, 
  filteredCount, 
  clusterData,
  currentFilters 
}: QAClusterStatsProps) => {
  const progressPercentage = totalArticles > 0 ? (filteredCount / totalArticles) * 100 : 0;
  const totalClusters = clusterData.length;
  const activeClusters = currentFilters.selectedTopic ? 1 : totalClusters;

  const getInsightText = () => {
    if (currentFilters.selectedTopic) {
      const cluster = clusterData.find(c => c.name === currentFilters.selectedTopic);
      return `Exploring ${cluster?.name || 'topic'}: ${filteredCount} articles`;
    }
    if (currentFilters.selectedStage) {
      const stageLabels = { TOFU: 'Getting Started', MOFU: 'Researching', BOFU: 'Ready to Buy' };
      return `${stageLabels[currentFilters.selectedStage as keyof typeof stageLabels]} stage: ${filteredCount} articles`;
    }
    if (currentFilters.searchTerm) {
      return `Search results: ${filteredCount} articles found`;
    }
    return `Complete knowledge base: ${totalArticles} articles across ${totalClusters} topics`;
  };

  return (
    <div className="bg-gradient-to-r from-muted/20 to-muted/30 py-8 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Progress Overview */}
            <Card className="p-6 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Discovery Progress</h3>
                  <p className="text-sm text-muted-foreground">Knowledge exploration</p>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2 mb-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Viewing</span>
                <span className="font-medium text-foreground">
                  {filteredCount} / {totalArticles}
                </span>
              </div>
            </Card>

            {/* Active Insights */}
            <Card className="p-6 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Current Focus</h3>
                  <p className="text-sm text-muted-foreground">Active filters</p>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {getInsightText()}
              </p>
              <div className="flex gap-2 mt-3">
                {currentFilters.selectedTopic && (
                  <Badge variant="secondary" className="text-xs">
                    Topic: {currentFilters.selectedTopic}
                  </Badge>
                )}
                {currentFilters.selectedStage && (
                  <Badge variant="secondary" className="text-xs">
                    Stage: {currentFilters.selectedStage}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Knowledge Base Stats */}
            <Card className="p-6 bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground">Complete coverage</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Topics</span>
                  <span className="font-medium text-foreground">{totalClusters}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Articles</span>
                  <span className="font-medium text-foreground">{totalArticles}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
              </div>
            </Card>

          </div>

          {/* Quick Filter Stats */}
          {clusterData.length > 0 && (
            <Card className="mt-6 p-4 bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Topic Distribution</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {clusterData.slice(0, 12).map((cluster) => (
                  <div key={cluster.name} className="text-center">
                    <div className="text-xs font-medium text-foreground truncate" title={cluster.name}>
                      {cluster.name.split(' ')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {cluster.count} articles
                    </div>
                  </div>
                ))}
                {clusterData.length > 12 && (
                  <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground">
                      +{clusterData.length - 12} more
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};