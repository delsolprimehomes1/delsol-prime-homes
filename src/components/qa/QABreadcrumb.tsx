import React from 'react';
import { ChevronRight, Home, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface QABreadcrumbProps {
  title: string;
  topic: string;
  funnelStage?: string;
  className?: string;
}

export const QABreadcrumb: React.FC<QABreadcrumbProps> = ({
  title,
  topic,
  funnelStage,
  className = ''
}) => {
  const stageLabels = {
    TOFU: 'Getting Started',
    MOFU: 'Researching',
    BOFU: 'Ready to Buy'
  };

  const stageColors = {
    TOFU: 'bg-blue-500/10 text-blue-700',
    MOFU: 'bg-amber-500/10 text-amber-700',
    BOFU: 'bg-green-500/10 text-green-700'
  };

  // Truncate title for mobile
  const truncatedTitle = title.length > 50 ? `${title.substring(0, 47)}...` : title;

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto pb-2 ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-1 whitespace-nowrap">
        <Link
          to="/"
          className="flex items-center hover:text-foreground transition-colors"
          aria-label="Home"
        >
          <Home className="w-4 h-4" />
        </Link>
        
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
        
        <Link
          to="/qa"
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Q&A</span>
        </Link>
        
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
        
        <Link
          to={`/qa?topic=${encodeURIComponent(topic)}`}
          className="hover:text-foreground transition-colors"
        >
          <Badge variant="outline" className="text-xs">
            {topic}
          </Badge>
        </Link>
      </div>
      
      <div className="flex-1 min-w-0 ml-2">
        <span className="text-foreground font-medium truncate block">
          <span className="hidden sm:inline">{title}</span>
          <span className="sm:hidden">{truncatedTitle}</span>
        </span>
      </div>
    </nav>
  );
};

export default QABreadcrumb;