import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Database, 
  Mic, 
  FileCheck, 
  BookOpen, 
  Languages,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  generatePhase2ComprehensiveSchema, 
  generateAITrainingData,
  WIKIDATA_ENTITIES
} from '@/utils/phase2-enhanced-schemas';

interface Phase2EnhancedSchemasProps {
  article: any;
  className?: string;
}

export const Phase2EnhancedSchemas: React.FC<Phase2EnhancedSchemasProps> = ({
  article,
  className = ''
}) => {
  const comprehensiveSchema = React.useMemo(() => 
    generatePhase2ComprehensiveSchema(article), 
    [article]
  );

  const aiTrainingData = React.useMemo(() => 
    generateAITrainingData(article), 
    [article]
  );

  const entityMentions = React.useMemo(() => {
    if (!article) return [];
    return Object.keys(WIKIDATA_ENTITIES).filter(entity => 
      article.title?.toLowerCase().includes(entity) || 
      article.content?.toLowerCase().includes(entity) ||
      article.topic?.toLowerCase().includes(entity) ||
      (article.city || '').toLowerCase().includes(entity)
    );
  }, [article]);

  return (
    <div className={`phase2-enhanced-schemas space-y-6 ${className}`}>
      
      {/* Schema Overview */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Phase 2: Advanced Schema & Speakable Optimization
            </h3>
            <p className="text-muted-foreground mb-4">
              Enhanced JSON-LD schemas with LearningResource, ClaimReview, and cross-language entity alignment
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">LearningResource</span>
                </div>
                <Badge variant="outline" className="text-xs bg-green-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>

              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">ClaimReview</span>
                </div>
                <Badge variant="outline" className="text-xs bg-green-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>

              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Speakable</span>
                </div>
                <Badge variant="outline" className="text-xs bg-green-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              </div>

              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Languages className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">Cross-Language</span>
                </div>
                <Badge variant="outline" className="text-xs bg-green-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Wikidata
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Wikidata Entity Alignment */}
      {entityMentions.length > 0 && (
        <Card className="p-6 bg-blue-50/50 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-foreground">Wikidata Entity Alignment</h4>
            <Badge variant="secondary" className="text-xs">
              Cross-Language AI Discovery
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {entityMentions.map((entity) => (
              <div 
                key={entity}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
              >
                <span className="text-sm font-medium capitalize">{entity}</span>
                <Badge variant="outline" className="text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  {WIKIDATA_ENTITIES[entity]}
                </Badge>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-100/50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>AI Discovery:</strong> These Wikidata entities enable cross-language AI systems 
              to understand and cite this content regardless of query language.
            </p>
          </div>
        </Card>
      )}

      {/* AI Training Data Preview */}
      <Card className="p-6 bg-green-50/50 border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-foreground">AI Training Data Structure</h4>
          <Badge variant="secondary" className="text-xs">
            LLM Consumption Ready
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-600">
              {aiTrainingData.training_data.voice_optimization_score}%
            </div>
            <div className="text-xs text-muted-foreground">Voice Ready</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-600">
              {aiTrainingData.training_data.citation_readiness_score}%
            </div>
            <div className="text-xs text-muted-foreground">Citation Ready</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-600">
              {Math.round(aiTrainingData.training_data.content_freshness)}%
            </div>
            <div className="text-xs text-muted-foreground">Content Fresh</div>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <div className="text-lg font-bold text-green-600">
              {entityMentions.length}
            </div>
            <div className="text-xs text-muted-foreground">Entity Links</div>
          </div>
        </div>
      </Card>

      {/* Progressive Enhancement Layers Indicator */}
      <Card className="p-6 bg-amber-50/50 border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-600" />
          <h4 className="font-semibold text-foreground">Progressive Enhancement Layers</h4>
          <Badge variant="outline" className="text-xs bg-amber-50">
            Phase 2 Complete
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
            <span className="text-sm font-medium">Base Layer: Traditional SEO</span>
            <Badge variant="outline" className="text-xs bg-green-50">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
              Active
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
            <span className="text-sm font-medium">Enhancement Layer 1: Voice Search</span>
            <Badge variant="outline" className="text-xs bg-green-50">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
              Enhanced
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
            <span className="text-sm font-medium">Enhancement Layer 2: AI Discovery</span>
            <Badge variant="outline" className="text-xs bg-green-50">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
              Phase 2 Ready
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
            <span className="text-sm font-medium">Enhancement Layer 3: LLM Training</span>
            <Badge variant="outline" className="text-xs bg-blue-50">
              <Database className="w-3 h-3 mr-1 text-blue-600" />
              Structured
            </Badge>
          </div>
        </div>
      </Card>

      {/* Hidden Enhanced Schema Data */}
      <div className="hidden phase2-schema-data">
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(comprehensiveSchema, null, 2) 
          }} 
        />
      </div>

      {/* Hidden AI Training Metadata */}
      <div className="hidden ai-training-metadata phase2-enhanced" data-phase="2">
        {JSON.stringify(aiTrainingData, null, 2)}
      </div>
    </div>
  );
};

export default Phase2EnhancedSchemas;