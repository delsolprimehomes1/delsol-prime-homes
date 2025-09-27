import React from 'react';
import { AIOptimizationStatus } from './AIOptimizationStatus';
import { ComprehensiveAIOptimizer } from './ComprehensiveAIOptimizer';
import ComprehensiveAIActivator from './ComprehensiveAIActivator';
import { AIScoreFixDashboard } from './AIScoreFixDashboard';
import { Phase1CompletionStatus } from './Phase1CompletionStatus';
import { Phase2CompletionDashboard } from './Phase2CompletionDashboard';
import { Phase3CompletionDashboard } from './Phase3CompletionDashboard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, TrendingUp, Target, Zap, CheckCircle2, Globe, Map } from 'lucide-react';

const AIOptimizationDashboard = () => {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Complete AI/LLM Optimization Suite</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
          Phase 1 (AI Scoring) + Phase 2 (Advanced Schemas) + Phase 3 (Funnel Intelligence) = Maximum AI discoverability
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-green-50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Phase 1 Complete
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            <Globe className="w-3 h-3 mr-1" />
            Phase 2 Complete
          </Badge>
          <Badge variant="outline" className="bg-purple-50">
            <Map className="w-3 h-3 mr-1" />
            Phase 3 Ready
          </Badge>
          <Badge variant="secondary">
            <Target className="w-3 h-3 mr-1" />
            9.8+ AI Target
          </Badge>
        </div>
      </div>

      {/* Phase 1 Completion Status */}
      <Phase1CompletionStatus />

      {/* Phase 2 Advanced Schema & Speakable Optimization */}
      <Phase2CompletionDashboard />

      {/* Phase 3 Funnel Intelligence & Smart Linking */}
      <Phase3CompletionDashboard />

      {/* AI Score Management */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          AI Score Management & Testing
        </h2>
        <AIScoreFixDashboard />
      </Card>

      {/* Current Optimization Status */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bot className="w-6 h-6 text-green-600" />
          Current Optimization Status
        </h2>
        <AIOptimizationStatus />
      </Card>

      {/* Advanced AI Content Optimizer */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          Advanced AI Content Optimizer
        </h2>
        <ComprehensiveAIOptimizer />
      </Card>

      {/* Comprehensive AI Activator */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-600" />
          Comprehensive AI Activator
        </h2>
        <ComprehensiveAIActivator />
      </Card>

    </div>
  );
};

export default AIOptimizationDashboard;