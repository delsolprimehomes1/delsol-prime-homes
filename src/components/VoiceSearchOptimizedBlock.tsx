import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MessageSquare, Volume2, Zap } from 'lucide-react';

interface VoiceQA {
  question: string;
  answer: string;
}

interface VoiceSearchOptimizedBlockProps {
  quickFacts: string[];
  voiceQAs: VoiceQA[];
  primaryLocation?: string;
  pricePoint?: string;
  timeframe?: string;
  className?: string;
}

export const VoiceSearchOptimizedBlock: React.FC<VoiceSearchOptimizedBlockProps> = ({
  quickFacts,
  voiceQAs,
  primaryLocation = "Costa del Sol",
  pricePoint,
  timeframe,
  className = ''
}) => {
  return (
    <div className={`voice-search-block ${className}`}>
      {/* Quick Facts Section */}
      <Card className="p-6 bg-blue-50/50 border-blue-200/50 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-foreground">Quick Facts (Voice-Friendly)</h3>
          <Badge variant="secondary" className="text-xs">
            <Volume2 className="w-3 h-3 mr-1" />
            Speakable
          </Badge>
        </div>
        
        <div className="quick-facts voice-friendly" data-speakable="true">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickFacts.map((fact, index) => (
              <div 
                key={index}
                className="p-3 bg-white rounded-lg border border-blue-100 speakable"
                data-speakable="true"
              >
                <span className="text-sm font-medium text-blue-900">
                  • {fact}
                </span>
              </div>
            ))}
          </div>
          
          {/* Key data points for voice assistants */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
              <div className="text-lg font-bold text-blue-600">{primaryLocation}</div>
              <div className="text-xs text-muted-foreground">Location</div>
            </div>
            {pricePoint && (
              <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-lg font-bold text-blue-600">{pricePoint}</div>
                <div className="text-xs text-muted-foreground">Price Point</div>
              </div>
            )}
            {timeframe && (
              <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                <div className="text-lg font-bold text-blue-600">{timeframe}</div>
                <div className="text-xs text-muted-foreground">Timeframe</div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Voice Q&A Section */}
      {voiceQAs.length > 0 && (
        <Card className="p-6 bg-green-50/50 border-green-200/50">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-foreground">Voice Search Q&A</h3>
            <Badge variant="outline" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Conversational AI Ready
            </Badge>
          </div>
          
          <div className="space-y-4">
            {voiceQAs.map((qa, index) => (
              <div key={index} className="voice-qa-pair">
                <h4 className="font-medium text-green-800 mb-2">
                  {qa.question}
                </h4>
                <div 
                  className="voice-answer bg-white p-4 rounded-lg border border-green-100" 
                  data-speakable="true"
                >
                  <p className="text-muted-foreground leading-relaxed">
                    {qa.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VoiceSearchOptimizedBlock;