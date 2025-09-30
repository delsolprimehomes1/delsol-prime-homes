import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface DiagramDisplayProps {
  diagram: string;
  title?: string;
  className?: string;
}

export const DiagramDisplay: React.FC<DiagramDisplayProps> = ({ 
  diagram, 
  title,
  className = "" 
}) => {
  // Check if it's a URL (AI-generated image/diagram) or Mermaid syntax
  const isImageUrl = diagram?.startsWith('http') || diagram?.startsWith('data:image');
  const isMermaid = diagram?.includes('graph') || diagram?.includes('flowchart') || diagram?.includes('sequenceDiagram');

  if (!diagram) {
    return null;
  }

  return (
    <div className={`my-8 ${className}`}>
      {/* AI-Generated Image or Diagram (URL) */}
      {isImageUrl && (
        <figure className="rounded-lg overflow-hidden border border-border/40 bg-muted/20">
          <img 
            src={diagram} 
            alt={title || 'Article diagram'}
            className="w-full h-auto"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const errorDiv = target.nextElementSibling as HTMLElement;
              if (errorDiv) errorDiv.style.display = 'block';
            }}
          />
          <div className="hidden p-4 text-center bg-muted">
            <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Image could not be loaded</p>
          </div>
          {title && (
            <figcaption className="p-3 text-sm text-center text-muted-foreground bg-background/50">
              {title}
            </figcaption>
          )}
        </figure>
      )}

      {/* Mermaid Diagram (Display as styled code block) */}
      {!isImageUrl && isMermaid && (
        <div className="rounded-lg border border-border/40 bg-muted/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Visual Diagram</h4>
          </div>
          <pre className="bg-background rounded p-4 overflow-x-auto text-sm">
            <code className="text-foreground/80">{diagram}</code>
          </pre>
          <Alert className="mt-4">
            <AlertDescription className="text-xs">
              This Mermaid diagram syntax can be visualized using tools like mermaid.live
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Unknown format fallback */}
      {!isImageUrl && !isMermaid && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Visual content format not recognized
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DiagramDisplay;
