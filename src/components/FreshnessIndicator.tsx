import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

interface FreshnessIndicatorProps {
  lastUpdated: string;
  dateModified?: string;
  className?: string;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  lastUpdated,
  dateModified,
  className = ''
}) => {
  const getDateDifference = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const daysSinceUpdate = getDateDifference(lastUpdated);
  const isRecent = daysSinceUpdate <= 30;
  const isStale = daysSinceUpdate > 90;

  const getBadgeVariant = () => {
    if (isRecent) return 'default';
    if (isStale) return 'destructive';
    return 'secondary';
  };

  const getIcon = () => {
    if (isRecent) return <CheckCircle className="w-3 h-3" />;
    if (isStale) return <Clock className="w-3 h-3" />;
    return <Calendar className="w-3 h-3" />;
  };

  const getStatusText = () => {
    if (isRecent) return 'Recently Updated';
    if (isStale) return 'Under Review';
    return 'Last Verified';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getBadgeVariant()} className="text-xs gap-1">
        {getIcon()}
        {getStatusText()}
      </Badge>
      
      <span className="text-xs text-muted-foreground">
        {formatDate(dateModified || lastUpdated)}
      </span>
      
      {daysSinceUpdate <= 7 && (
        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
          Fresh Content
        </Badge>
      )}
      
      {/* Structured data for freshness signals */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            'dateModified': dateModified || lastUpdated,
            'datePublished': lastUpdated,
            'maintenanceFrequency': 'Monthly',
            'reviewDate': dateModified || lastUpdated
          })
        }}
      />
    </div>
  );
};

export default FreshnessIndicator;