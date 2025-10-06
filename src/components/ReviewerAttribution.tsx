import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

interface ReviewerAttributionProps {
  reviewer?: {
    name: string;
    credentials?: string[];
    reviewDate?: string;
  };
  variant?: 'full' | 'short' | 'badge';
  className?: string;
}

export const ReviewerAttribution: React.FC<ReviewerAttributionProps> = ({
  reviewer,
  variant = 'full',
  className = ''
}) => {
  const { t } = useTranslation('common');
  
  const defaultReviewer = {
    name: 'Hans Beeckman',
    credentials: ['Accredited Property Specialist'],
  };
  
  const activeReviewer = reviewer || defaultReviewer;
  
  if (variant === 'full') {
    return (
      <h4 className={`text-lg font-semibold text-foreground mb-2 ${className}`}>
        Content reviewed and verified by {activeReviewer.credentials?.[0]} — {activeReviewer.name}
      </h4>
    );
  }
  
  if (variant === 'short') {
    return (
      <span className={`text-foreground ${className}`}>
        {activeReviewer.name}, {activeReviewer.credentials?.[0]}
      </span>
    );
  }
  
  if (variant === 'badge') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm">
          Reviewed by {activeReviewer.name}
        </span>
      </div>
    );
  }
  
  return null;
};
