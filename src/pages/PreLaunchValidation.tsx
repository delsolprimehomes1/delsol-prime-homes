import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Rocket,
  Play,
  RefreshCw
} from 'lucide-react';
import { runPreLaunchValidation, PreLaunchReport, ValidationResult } from '@/utils/pre-launch-validator';
import { toast } from 'sonner';

export default function PreLaunchValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState<PreLaunchReport | null>(null);

  const handleRunValidation = async () => {
    setIsValidating(true);
    toast.info('Starting comprehensive pre-launch validation...');

    try {
      const validationReport = await runPreLaunchValidation();
      setReport(validationReport);
      
      if (validationReport.readyForLaunch) {
        toast.success('🎉 Site is ready for launch!');
      } else {
        toast.warning(`Site needs attention: ${validationReport.overallScore}% complete`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation failed. Check console for details.');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    const variants: Record<string, any> = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    };
    
    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryScore = (results: ValidationResult[]) => {
    if (results.length === 0) return 0;
    const passed = results.filter(r => r.status === 'pass').length;
    return Math.round((passed / results.length) * 100);
  };

  const renderValidationSection = (title: string, results: ValidationResult[]) => {
    const score = getCategoryScore(results);
    const color = score >= 90 ? 'text-green-500' : score >= 70 ? 'text-yellow-500' : 'text-red-500';
    
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${color}`}>{score}%</span>
          </div>
        </div>
        
        <Progress value={score} className="mb-4" />
        
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(result.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{result.item}</span>
                  {getStatusBadge(result.status)}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {result.message}
                </p>
                
                {result.score !== undefined && (
                  <div className="mt-2">
                    <Progress value={result.score} className="h-1" />
                  </div>
                )}
                
                {result.action && result.status !== 'pass' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={result.action}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Fix Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Pre-Launch Validation</h1>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Comprehensive validation checklist for DelSolPrimeHomes website launch readiness.
          Ensure all SEO, AEO, content quality, and technical standards are met before going live.
        </p>

        <div className="flex gap-3">
          <Button 
            size="lg" 
            onClick={handleRunValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Full Validation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {report && (
        <Card className={`p-6 mb-8 ${report.readyForLaunch ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {report.readyForLaunch ? '✅ Ready for Launch!' : '⚠️ Needs Attention'}
              </h2>
              <p className="text-muted-foreground">
                Overall validation score: <span className="font-bold text-2xl">{report.overallScore}%</span>
              </p>
            </div>
            
            <div className="text-right">
              {report.readyForLaunch ? (
                <Badge className="text-lg py-2 px-4 bg-green-600">
                  <Rocket className="w-4 h-4 mr-2" />
                  LAUNCH READY
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  IN PROGRESS
                </Badge>
              )}
            </div>
          </div>
          
          <Progress value={report.overallScore} className="h-3" />
        </Card>
      )}

      {/* Validation Results */}
      {report && (
        <Tabs defaultValue="seo" className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-9 gap-2">
            <TabsTrigger value="seo">SEO/AEO</TabsTrigger>
            <TabsTrigger value="eeat">E-E-A-T</TabsTrigger>
            <TabsTrigger value="geo">GEO</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="multilingual">i18n</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="seo">
            {renderValidationSection('SEO & AEO Standards', report.seo)}
          </TabsContent>

          <TabsContent value="eeat">
            {renderValidationSection('E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness)', report.eeat)}
          </TabsContent>

          <TabsContent value="geo">
            {renderValidationSection('Geographic Signals', report.geo)}
          </TabsContent>

          <TabsContent value="images">
            {renderValidationSection('Image Optimization', report.images)}
          </TabsContent>

          <TabsContent value="links">
            {renderValidationSection('Link Infrastructure', report.links)}
          </TabsContent>

          <TabsContent value="multilingual">
            {renderValidationSection('Multilingual Content', report.multilingual)}
          </TabsContent>

          <TabsContent value="technical">
            {renderValidationSection('Technical Infrastructure', report.technical)}
          </TabsContent>

          <TabsContent value="ai">
            {renderValidationSection('AI Optimization', report.aiOptimization)}
          </TabsContent>

          <TabsContent value="content">
            {renderValidationSection('Content Quality', report.content)}
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!report && !isValidating && (
        <Alert>
          <AlertDescription>
            Click "Run Full Validation" to begin the comprehensive pre-launch checklist validation.
            This will analyze all published content against SEO, AEO, content quality, and technical standards.
          </AlertDescription>
        </Alert>
      )}
      </div>
    </>
  );
}
