import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info, Zap } from 'lucide-react';
import { validateSchemaForAI, testLLMCitation, generateSchemaReport } from '@/utils/schema-validation';

interface SchemaValidatorProps {
  schemas: any[];
  articleSlug?: string;
  onValidationComplete?: (report: any) => void;
}

export const SchemaValidator: React.FC<SchemaValidatorProps> = ({
  schemas,
  articleSlug,
  onValidationComplete
}) => {
  const [report, setReport] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const validateSchemas = async () => {
    setIsValidating(true);
    
    try {
      // Validate all schemas
      const validationResults = schemas.map(validateSchemaForAI);
      const citationResults = schemas.map(testLLMCitation);
      
      // Generate comprehensive report
      const schemaReport = generateSchemaReport(schemas);
      
      const fullReport = {
        ...schemaReport,
        individualResults: validationResults,
        citationResults,
        timestamp: new Date().toISOString()
      };
      
      setReport(fullReport);
      onValidationComplete?.(fullReport);
      
    } catch (error) {
      console.error('Schema validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (schemas.length > 0) {
      validateSchemas();
    }
  }, [schemas]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 text-green-700 border-green-200';
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    return 'bg-red-500/10 text-red-700 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />;
    if (score >= 60) return <Info className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (!report) {
    return (
      <Card className="p-4 bg-muted/20">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            {isValidating ? 'Validating JSON-LD schemas...' : 'Schema validation ready'}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Score Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getScoreIcon(report.overallScore)}
            <div>
              <h3 className="font-semibold text-foreground">Schema AI Optimization Score</h3>
              <p className="text-sm text-muted-foreground">
                {report.validSchemas}/{report.totalSchemas} schemas valid
              </p>
            </div>
          </div>
          <Badge className={`${getScoreColor(report.overallScore)} text-lg px-4 py-2`}>
            {report.overallScore}/100
          </Badge>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{report.totalSchemas}</div>
            <div className="text-xs text-muted-foreground">Total Schemas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{report.validSchemas}</div>
            <div className="text-xs text-muted-foreground">Valid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{report.overallScore}%</div>
            <div className="text-xs text-muted-foreground">AI Ready</div>
          </div>
        </div>

        {/* Top Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-foreground mb-2">Top Optimization Recommendations:</h4>
            <ul className="space-y-1">
              {report.recommendations.slice(0, 3).map((rec: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Toggle Details */}
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            {showDetails ? 'Hide Details' : 'Show Detailed Analysis'}
          </Button>
        </div>
      </Card>

      {/* Detailed Results */}
      {showDetails && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Detailed Schema Analysis</h4>
          
          <div className="space-y-4">
            {report.individualResults.map((result: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Schema {index + 1}</div>
                  <Badge className={getScoreColor(result.score)}>
                    {result.score}/100
                  </Badge>
                </div>
                
                {result.errors.length > 0 && (
                  <div className="mb-2">
                    <div className="text-sm font-medium text-red-600 mb-1">Errors:</div>
                    <ul className="text-sm text-red-600 space-y-1">
                      {result.errors.map((error: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 mt-0.5" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.warnings.length > 0 && (
                  <div className="mb-2">
                    <div className="text-sm font-medium text-yellow-600 mb-1">Warnings:</div>
                    <ul className="text-sm text-yellow-600 space-y-1">
                      {result.warnings.map((warning: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <Info className="w-3 h-3 mt-0.5" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Citation Score */}
                {report.citationResults[index] && (
                  <div className="border-t pt-2 mt-2">
                    <div className="text-sm text-muted-foreground">
                      LLM Citation Score: {report.citationResults[index].citationScore}/100
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SchemaValidator;