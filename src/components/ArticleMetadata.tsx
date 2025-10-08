import { useTranslation } from 'react-i18next';
import { Calendar, UserCheck, User } from 'lucide-react';

interface ArticleMetadataProps {
  updatedAt: string;
  author: string;
  reviewer?: string;
  language: string;
}

export function ArticleMetadata({ updatedAt, author, reviewer, language }: ArticleMetadataProps) {
  const { i18n } = useTranslation();
  
  const formatDate = (date: string, locale: string) => {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-l-4 border-gold pl-4 mb-8 py-3 bg-gold/5 rounded-r-md">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gold" />
        <span className="font-semibold text-navy">Last Updated:</span>
        <time dateTime={updatedAt} className="text-gold font-medium">
          {formatDate(updatedAt, language)}
        </time>
      </div>
      
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-navy" />
        <span className="font-semibold text-navy">Author:</span>
        <span>{author}</span>
      </div>

      {reviewer && (
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-navy" />
          <span className="font-semibold text-navy">Reviewed by:</span>
          <span>{reviewer}</span>
        </div>
      )}
    </div>
  );
}
