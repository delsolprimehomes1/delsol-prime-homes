import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Award, Calendar, MapPin, TrendingUp } from 'lucide-react';

interface CitationSource {
  title: string;
  url?: string;
  date?: string;
  type: 'internal' | 'external' | 'data' | 'expert';
}

interface CitationReadyBlockProps {
  claimContent: string;
  authorExperience: string;
  areaServed: string;
  sources: CitationSource[];
  confidenceScore?: number;
  lastReviewed?: string;
  dataPoints?: string[];
  className?: string;
}

export const CitationReadyBlock: React.FC<CitationReadyBlockProps> = ({
  claimContent,
  authorExperience,
  areaServed,
  sources,
  confidenceScore = 0.95,
  lastReviewed,
  dataPoints = [],
  className = ''
}) => {
  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'data': return <TrendingUp className="w-4 h-4" />;
      case 'expert': return <Award className="w-4 h-4" />;
      case 'external': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceColor = (type: string) => {
    switch (type) {
      case 'data': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'expert': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'external': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`citation-ready-block ${className}`}>
      <Card className="p-6 bg-amber-50/50 border-amber-200/50">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-foreground">Citation-Ready Information</h3>
              <Badge variant="outline" className="text-xs bg-amber-50">
                Confidence: {Math.round(confidenceScore * 100)}%
              </Badge>
              <Badge variant="secondary" className="text-xs">
                AI Citable
              </Badge>
            </div>

            {/* Main Claim */}
            <div 
              className="citation-claim mb-4 p-4 bg-white rounded-lg border border-amber-100"
              itemScope 
              itemType="https://schema.org/Claim"
            >
              <p 
                className="text-muted-foreground leading-relaxed font-medium"
                itemProp="claimContent"
              >
                {claimContent}
              </p>
            </div>

            {/* Expertise Signal */}
            <div 
              className="expertise-signal mb-4 p-3 bg-white/70 rounded-lg border border-amber-100"
              itemScope 
              itemType="https://schema.org/Person"
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-foreground">Expert Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This analysis comes from our{' '}
                <span itemProp="experienceRequirements" className="font-medium">
                  {authorExperience}
                </span>{' '}
                serving{' '}
                <span itemProp="workLocation" className="font-medium">
                  {areaServed}
                </span>.
              </p>
            </div>

            {/* Data Points */}
            {dataPoints.length > 0 && (
              <div className="data-points mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Data Points
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dataPoints.map((point, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-white rounded border border-amber-100 text-sm"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {sources.length > 0 && (
              <div className="citation-sources">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Sources & References
                </h4>
                <div className="space-y-2">
                  {sources.map((source, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded border ${getSourceColor(source.type)}`}
                    >
                      {getSourceIcon(source.type)}
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {source.url ? (
                            <a 
                              href={source.url} 
                              className="hover:underline"
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {source.title}
                            </a>
                          ) : (
                            source.title
                          )}
                        </span>
                        {source.date && (
                          <span className="text-xs ml-2 opacity-70">
                            {source.date}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Date */}
            {lastReviewed && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Last reviewed: {lastReviewed}
              </div>
            )}

            {/* Hidden Citation Metadata */}
            <div className="hidden citation-data">
              {JSON.stringify({
                confidenceScore,
                evidenceStrength: confidenceScore >= 0.9 ? 'strong' : confidenceScore >= 0.7 ? 'medium' : 'weak',
                lastReviewed: lastReviewed || new Date().toISOString().split('T')[0],
                authorCredentials: authorExperience,
                locationSpecific: areaServed,
                sourceCount: sources.length,
                dataPointCount: dataPoints.length
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CitationReadyBlock;