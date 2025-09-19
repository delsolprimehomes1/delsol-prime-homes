import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Zap, BarChart3, Globe, Bot, Mic, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeAllQAArticles, generateAIDiscoveryExport, validateAIOptimization } from '@/utils/bulk-qa-optimization';
import { ComprehensiveAIOptimizer } from '@/components/ComprehensiveAIOptimizer';
import { batchOptimizeForVoiceSearch } from '@/utils/voice-search-optimizer';

interface OptimizationReport {
  totalArticles: number;
  languageDistribution: Record<string, number>;
  topicDistribution: Record<string, number>;
  funnelStageDistribution: Record<string, number>;
  aiReadinessScore: number;
  voiceSearchReadiness: number;
  citationReadiness: number;
  multilingualCoverage: number;
  contentQualityScore: number;
  optimizationTasks: any[];
}

interface ValidationResult {
  compliantArticles: any[];
  nonCompliantArticles: any[];
  overallScore: number;
}

const AIOptimizationDashboard: React.FC = () => {
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleAnalyzeArticles = async () => {
    setIsAnalyzing(true);
    try {
      toast.info('🔍 Analyzing all QA articles...');
      const analysisResult = await analyzeAllQAArticles();
      setReport(analysisResult);
      setLastUpdated(new Date());
      toast.success('✅ Analysis complete!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('❌ Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleValidateOptimization = async () => {
    setIsValidating(true);
    try {
      toast.info('🔍 Validating AI optimization...');
      const validationResult = await validateAIOptimization();
      setValidation(validationResult);
      toast.success('✅ Validation complete!');
    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('❌ Validation failed. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleExportAIData = async () => {
    try {
      toast.info('📥 Generating AI discovery export...');
      const exportData = await generateAIDiscoveryExport();
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `ai-optimization-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('✅ AI data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('❌ Export failed. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Optimization Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and optimize QA articles for AI/LLM discovery and citation readiness
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAnalyzeArticles} disabled={isAnalyzing} variant="outline">
            {isAnalyzing ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Articles
              </>
            )}
          </Button>
          <Button onClick={handleValidateOptimization} disabled={isValidating} variant="outline">
            {isValidating ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate
              </>
            )}
          </Button>
          <Button
            onClick={async () => {
              try {
                toast.info('🎤 Optimizing for voice search...');
                const result = await batchOptimizeForVoiceSearch();
                toast.success(`✅ Voice search optimization complete! ${result.optimizedCount} articles optimized`);
              } catch (error) {
                toast.error('❌ Voice search optimization failed');
              }
            }}
            variant="outline"
          >
            <Mic className="h-4 w-4 mr-2" />
            Voice Optimize
          </Button>
          <Button onClick={handleExportAIData} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Last analysis: {lastUpdated.toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="comprehensive" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comprehensive">Comprehensive Optimizer</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validation">Validation Results</TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive" className="space-y-4">
          <ComprehensiveAIOptimizer />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.totalArticles}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.aiReadinessScore}/100</div>
                  <Progress value={report.aiReadinessScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Voice Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.voiceSearchReadiness}/100</div>
                  <Progress value={report.voiceSearchReadiness} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Citation Ready</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.citationReadiness}/100</div>
                  <Progress value={report.citationReadiness} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          {validation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Compliant Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{validation.compliantArticles.length}</div>
                  <p className="text-sm text-muted-foreground">Articles fully optimized for AI discovery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Need Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{validation.nonCompliantArticles.length}</div>
                  <p className="text-sm text-muted-foreground">Articles requiring optimization work</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIOptimizationDashboard;