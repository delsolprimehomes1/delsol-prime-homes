import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  Search, 
  Mic, 
  Brain, 
  Database,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface ProgressiveEnhancementLayersProps {
  article: any;
  className?: string;
}

export const ProgressiveEnhancementLayers: React.FC<ProgressiveEnhancementLayersProps> = ({
  article,
  className = ''
}) => {
  // Calculate layer completion based on article data
  const layerCompletion = React.useMemo(() => {
    const hasBaseSEO = !!(article.title && article.excerpt && article.content);
    const hasVoiceOptimization = !!(article.voice_search_ready || article.ai_optimization_score >= 7);
    const hasAIDiscovery = !!(article.ai_optimization_score >= 9);
    const hasLLMTraining = !!(article.citation_ready && article.markdown_frontmatter?.ai_metrics);

    return {
      baseSEO: hasBaseSEO,
      voiceSearch: hasVoiceOptimization,
      aiDiscovery: hasAIDiscovery,
      llmTraining: hasLLMTraining
    };
  }, [article]);

  const getCompletionPercentage = () => {
    const completed = Object.values(layerCompletion).filter(Boolean).length;
    return Math.round((completed / 4) * 100);
  };

  return (
    <div className={`progressive-enhancement-layers ${className}`}>
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Layers className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Progressive Enhancement Architecture
            </h3>
            <p className="text-muted-foreground mb-3">
              Multi-layer content optimization for traditional search, voice assistants, and AI systems
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {getCompletionPercentage()}% Complete
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Phase 2 Enhanced
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Base Layer: Traditional SEO */}
          <div className={`layer-item p-4 rounded-lg border-2 transition-all ${
            layerCompletion.baseSEO 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Search className={`w-5 h-5 ${layerCompletion.baseSEO ? 'text-green-600' : 'text-gray-400'}`} />
              <h4 className="font-semibold text-foreground">Base Layer: Traditional SEO</h4>
              <Badge variant={layerCompletion.baseSEO ? "default" : "secondary"}>
                {layerCompletion.baseSEO ? "Active" : "Incomplete"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${article.title ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Title Optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${article.excerpt ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Meta Description</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${article.content && article.content.length > 1000 ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Content Depth</span>
              </div>
            </div>
          </div>

          {/* Enhancement Layer 1: Voice Search */}
          <div className={`layer-item p-4 rounded-lg border-2 transition-all ${
            layerCompletion.voiceSearch 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Mic className={`w-5 h-5 ${layerCompletion.voiceSearch ? 'text-blue-600' : 'text-gray-400'}`} />
              <h4 className="font-semibold text-foreground">Enhancement Layer 1: Voice Search Optimization</h4>
              <Badge variant={layerCompletion.voiceSearch ? "default" : "secondary"}>
                {layerCompletion.voiceSearch ? "Enhanced" : "Pending"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${article.voice_search_ready ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Voice Q&A Format</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${article.title?.match(/^(how|what|where|when|why)/i) ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Question Title Format</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${layerCompletion.voiceSearch ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Speakable Elements</span>
              </div>
            </div>
          </div>

          {/* Enhancement Layer 2: AI Discovery */}
          <div className={`layer-item p-4 rounded-lg border-2 transition-all ${
            layerCompletion.aiDiscovery 
              ? 'bg-purple-50 border-purple-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Brain className={`w-5 h-5 ${layerCompletion.aiDiscovery ? 'text-purple-600' : 'text-gray-400'}`} />
              <h4 className="font-semibold text-foreground">Enhancement Layer 2: AI Discovery & Citation</h4>
              <Badge variant={layerCompletion.aiDiscovery ? "default" : "secondary"}>
                {layerCompletion.aiDiscovery ? "Phase 2 Ready" : "Optimizing"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${article.ai_optimization_score >= 9 ? 'text-green-500' : 'text-gray-300'}`} />
                <span>AI Score 9+ ({article.ai_optimization_score || 0}/10)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${layerCompletion.aiDiscovery ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Enhanced Schemas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${layerCompletion.aiDiscovery ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Entity Alignment</span>
              </div>
            </div>
          </div>

          {/* Enhancement Layer 3: LLM Training */}
          <div className={`layer-item p-4 rounded-lg border-2 transition-all ${
            layerCompletion.llmTraining 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Database className={`w-5 h-5 ${layerCompletion.llmTraining ? 'text-amber-600' : 'text-gray-400'}`} />
              <h4 className="font-semibold text-foreground">Enhancement Layer 3: LLM Training Data</h4>
              <Badge variant={layerCompletion.llmTraining ? "default" : "secondary"}>
                {layerCompletion.llmTraining ? "Structured" : "Processing"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${article.citation_ready ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Citation Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${article.markdown_frontmatter?.ai_metrics ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Training Metadata</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${layerCompletion.llmTraining ? 'text-green-500' : 'text-gray-300'}`} />
                <span>Cross-Language Links</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2 Enhancement Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2">Phase 2 Enhancements Applied:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>LearningResource Schema</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>ClaimReview Schema</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Enhanced SpeakableSpecification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Wikidata Entity Alignment</span>
            </div>
          </div>
        </div>

      </Card>
    </div>
  );
};

export default ProgressiveEnhancementLayers;