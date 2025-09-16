import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FolderOpen, TrendingUp, Users, CheckCircle } from 'lucide-react';

interface QAClusterNavProps {
  clusters: Array<{
    name: string;
    count: number;
    completed?: number;
    description: string;
    color: string;
  }>;
  selectedCluster: string;
  onClusterChange: (cluster: string) => void;
  totalArticles: number;
}

export const QAClusterNav = ({ 
  clusters, 
  selectedCluster, 
  onClusterChange, 
  totalArticles 
}: QAClusterNavProps) => {
  const completedTotal = clusters.reduce((sum, cluster) => sum + (cluster.completed || 0), 0);
  const overallProgress = totalArticles > 0 ? (completedTotal / totalArticles) * 100 : 0;

  return (
    <div className="bg-muted/30 py-8 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Overall Progress */}
          <Card className="p-6 mb-6 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-foreground">Your Learning Journey</h3>
                <p className="text-muted-foreground">Progress through all Costa del Sol property topics</p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-3 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedTotal} of {totalArticles} articles explored</span>
              <span>{Math.round(overallProgress)}% complete</span>
            </div>
          </Card>

          {/* Cluster Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clusters.map((cluster) => {
              const isSelected = selectedCluster === cluster.name;
              const progress = cluster.count > 0 ? ((cluster.completed || 0) / cluster.count) * 100 : 0;
              
              return (
                <Card
                  key={cluster.name}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-primary/5 border-primary/30' 
                      : 'bg-background/60 hover:bg-background/80'
                  }`}
                  onClick={() => onClusterChange(cluster.name)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <FolderOpen className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${cluster.color}`}
                    >
                      {cluster.count}
                    </Badge>
                  </div>
                  
                  <h4 className={`font-semibold mb-2 text-sm ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}>
                    {cluster.name}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {cluster.description}
                  </p>
                  
                  {cluster.completed !== undefined && (
                    <div className="space-y-2">
                      <Progress value={progress} className="h-1" />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3" />
                        <span>{cluster.completed}/{cluster.count} completed</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};