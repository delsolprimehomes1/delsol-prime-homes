import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, TrendingUp, MapPin, Home } from 'lucide-react';

interface BlogDiagramSectionProps {
  title: string;
  description?: string;
  diagramType: 'process' | 'comparison' | 'timeline' | 'map';
  content: React.ReactNode;
  className?: string;
}

export const BlogDiagramSection: React.FC<BlogDiagramSectionProps> = ({
  title,
  description,
  diagramType,
  content,
  className = ''
}) => {
  const getIcon = () => {
    switch (diagramType) {
      case 'process':
        return <TrendingUp className="w-5 h-5" />;
      case 'map':
        return <MapPin className="w-5 h-5" />;
      case 'comparison':
        return <Home className="w-5 h-5" />;
      default:
        return <ImageIcon className="w-5 h-5" />;
    }
  };

  return (
    <Card className={`p-6 bg-muted/20 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-primary">
          {getIcon()}
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        <Badge variant="outline" className="ml-auto text-xs">
          Visual Guide
        </Badge>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
      )}
      
      <div className="rounded-lg overflow-hidden bg-background/60 backdrop-blur-sm p-4">
        {content}
      </div>
    </Card>
  );
};

export default BlogDiagramSection;
