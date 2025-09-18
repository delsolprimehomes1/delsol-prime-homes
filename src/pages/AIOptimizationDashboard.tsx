import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Languages, 
  Mic, 
  Target,
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  analyzeAllQAArticles, 
  validateAIOptimization, 
  generateOptimizationTasks,
  generateAIDiscoveryExport 
} from '@/utils/bulk-ai-optimization';

const AIOptimizationDashboard = () => {
  const [isExporting, setIsExporting] = React.useState(false);
  
  // Fetch comprehensive analysis
  const { data: analysisData, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['ai-optimization-analysis'],
    queryFn: analyzeAllQAArticles,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  const { data: validationData, isLoading: validationLoading } = useQuery({
    queryKey: ['ai-optimization-validation'],
    queryFn: validateAIOptimization,
    staleTime: 5 * 60 * 1000
  });
  
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['optimization-tasks'],
    queryFn: generateOptimizationTasks,
    staleTime: 5 * 60 * 1000
  });

  const handleExportAIData = async () => {
    setIsExporting(true);
    try {
      const exportData = await generateAIDiscoveryExport();
      
      // Create downloadable files
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `ai-optimization-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (analysisLoading || validationLoading || tasksLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const analysis = analysisData?.analysis;
  const validation = validationData;
  const tasks = tasksData;

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                AI Optimization Dashboard
              </h1>
              <p className="text-muted-foreground">
                Comprehensive analysis of {analysis?.totalArticles} QA articles for AI/LLM discovery
              </p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Button 
                onClick={() => refetchAnalysis()} 
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={handleExportAIData}
                disabled={isExporting}
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export AI Data'}
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Articles</p>
                  <p className="text-3xl font-bold text-foreground">{analysis?.totalArticles}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">AI Optimized</p>
                  <p className="text-3xl font-bold text-foreground">{analysis?.optimizedArticles}</p>
                </div>
                <Brain className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-3">
                <Progress 
                  value={(analysis?.optimizedArticles || 0) / (analysis?.totalArticles || 1) * 100} 
                  className="h-2"
                />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Citation Ready</p>
                  <p className="text-3xl font-bold text-foreground">{analysis?.citationReadiness}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-3">
                <Progress value={analysis?.citationReadiness || 0} className="h-2" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Voice Ready</p>
                  <p className="text-3xl font-bold text-foreground">{analysis?.voiceSearchReadiness}%</p>
                </div>
                <Mic className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-3">
                <Progress value={analysis?.voiceSearchReadiness || 0} className="h-2" />
              </div>
            </Card>
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="languages">Languages</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Funnel Stage Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analysis?.funnelStageDistribution || {}).map(([stage, count]) => (
                      <div key={stage} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            stage === 'TOFU' ? 'secondary' : 
                            stage === 'MOFU' ? 'default' : 'destructive'
                          }>
                            {stage}
                          </Badge>
                          <span className="text-sm">{count} articles</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((count / (analysis?.totalArticles || 1)) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Optimization Score
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {validation?.overallScore || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Overall AI Optimization Compliance
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compliant Articles</span>
                      <span className="text-green-600">{validation?.compliantArticles?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Need Optimization</span>
                      <span className="text-red-600">{validation?.nonCompliantArticles?.length || 0}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {analysis?.recommendations?.slice(0, 5).map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded">
                      <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Topics Tab */}
            <TabsContent value="topics" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Topic Distribution</h3>
                <div className="space-y-4">
                  {Object.entries(analysis?.topicDistribution || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([topic, count]) => (
                      <div key={topic} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{topic}</span>
                          <Badge variant="outline">{count} articles</Badge>
                        </div>
                        <Progress 
                          value={(count / (analysis?.totalArticles || 1)) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {Math.round((count / (analysis?.totalArticles || 1)) * 100)}% of total content
                        </p>
                      </div>
                    ))}
                </div>
              </Card>
            </TabsContent>

            {/* Languages Tab */}
            <TabsContent value="languages" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Language Distribution
                </h3>
                <div className="space-y-4">
                  {Object.entries(analysis?.languageDistribution || {}).map(([language, count]) => (
                    <div key={language} className="flex items-center justify-between p-3 bg-muted/20 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {language.toUpperCase()}
                        </Badge>
                        <span>{count} articles</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((count / (analysis?.totalArticles || 1)) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Validation Tab */}
            <TabsContent value="validation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-green-600">Compliant Articles</h3>
                  <p className="text-2xl font-bold mb-2">{validation?.compliantArticles?.length || 0}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Articles fully optimized for AI discovery
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {validation?.compliantArticles?.slice(0, 10).map(slug => (
                      <Badge key={slug} variant="outline" className="text-xs mr-1 mb-1">
                        {slug}
                      </Badge>
                    ))}
                    {(validation?.compliantArticles?.length || 0) > 10 && (
                      <p className="text-xs text-muted-foreground">
                        +{(validation?.compliantArticles?.length || 0) - 10} more
                      </p>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Need Optimization</h3>
                  <p className="text-2xl font-bold mb-2">{validation?.nonCompliantArticles?.length || 0}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Articles requiring optimization work
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {validation?.nonCompliantArticles?.slice(0, 5).map(article => (
                      <div key={article.slug} className="p-2 bg-muted/30 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {article.slug}
                          </Badge>
                          <Badge variant={
                            article.priority === 'high' ? 'destructive' : 
                            article.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {article.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {article.issues.slice(0, 2).join(', ')}
                          {article.issues.length > 2 && ' ...'}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Immediate Tasks</h3>
                  <div className="space-y-3">
                    {tasks?.immediate?.map((task, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        <p className="text-sm">{task}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-amber-600">Week 1 Tasks</h3>
                  <div className="space-y-3">
                    {tasks?.week1?.map((task, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                        <Target className="w-4 h-4 text-amber-500 mt-0.5" />
                        <p className="text-sm">{task}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">Week 2 Tasks</h3>
                  <div className="space-y-3">
                    {tasks?.week2?.map((task, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                        <p className="text-sm">{task}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-green-600">Ongoing Tasks</h3>
                  <div className="space-y-3">
                    {tasks?.ongoing?.map((task, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                        <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                        <p className="text-sm">{task}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AIOptimizationDashboard;