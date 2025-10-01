import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProcessStep {
  number: number;
  title: string;
  description: string;
  duration?: string;
}

interface PropertyProcessDiagramProps {
  title?: string;
  steps: ProcessStep[];
  className?: string;
}

export const PropertyProcessDiagram: React.FC<PropertyProcessDiagramProps> = ({
  title = 'Property Purchase Process',
  steps,
  className = ''
}) => {
  return (
    <Card className={`p-6 bg-muted/20 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        <Badge variant="outline" className="ml-auto text-xs">
          Step-by-Step Guide
        </Badge>
      </div>
      
      <div className="relative">
        {/* Process Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-primary/20 -z-10" />
              )}
              
              <div className="flex gap-4 items-start">
                {/* Step Number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold shadow-lg">
                  {step.number}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">
                      {step.title}
                    </h4>
                    {step.duration && (
                      <Badge variant="secondary" className="text-xs">
                        {step.duration}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Completion Indicator */}
                <CheckCircle2 className="w-5 h-5 text-primary/30 flex-shrink-0 mt-2" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Completion Arrow */}
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-2 text-primary">
          <span className="text-sm font-medium">Process Complete</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
};

export default PropertyProcessDiagram;
