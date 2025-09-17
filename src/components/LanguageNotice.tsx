import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, ChevronRight } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { SupportedLanguage } from '@/i18n';

interface LanguageNoticeProps {
  availableLanguages?: SupportedLanguage[];
  contentType?: 'article' | 'page' | 'section';
}

export const LanguageNotice: React.FC<LanguageNoticeProps> = ({
  availableLanguages = ['en'],
  contentType = 'page'
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  // Don't show if current language is available
  if (availableLanguages.includes(currentLanguage)) {
    return null;
  }

  const languageNames = {
    en: 'English',
    nl: 'Nederlands', 
    fr: 'Français',
    de: 'Deutsch',
    pl: 'Polski',
    sv: 'Svenska',
    da: 'Dansk'
  };

  return (
    <div className="py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium text-sm">
                    Content currently available in:
                  </span>
                </div>
                <div className="flex gap-2">
                  {availableLanguages.map(lang => (
                    <Badge 
                      key={lang} 
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {languageNames[lang]}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <span>Switch language:</span>
                <LanguageSwitcher variant="compact" className="h-8" />
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-200/50">
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <ChevronRight className="h-3 w-3" />
                <span>
                  We're working on expanding our multilingual content. 
                  Currently showing the most comprehensive version available.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};