import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Globe } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { SupportedLanguage } from '@/i18n';

interface MultilingualAlertProps {
  availableLanguages?: SupportedLanguage[];
  currentPath?: string;
}

export const MultilingualAlert: React.FC<MultilingualAlertProps> = ({ 
  availableLanguages = [],
  currentPath 
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as SupportedLanguage;

  // Only show alert if content is not available in current language
  if (currentLanguage === 'en' || availableLanguages.includes(currentLanguage)) {
    return null;
  }

  const messages = {
    en: "Content not available in your selected language. Showing English version.",
    nl: "Content niet beschikbaar in de geselecteerde taal. Nederlandse versie wordt weergegeven.",
    fr: "Contenu non disponible dans la langue sélectionnée. Version française affichée.",
    de: "Inhalt in der ausgewählten Sprache nicht verfügbar. Deutsche Version wird angezeigt.",
    pl: "Treść niedostępna w wybranym języku. Pokazuje się wersja polska.",
    sv: "Innehåll inte tillgängligt på det valda språket. Svensk version visas.",
    da: "Indhold ikke tilgængeligt på det valgte sprog. Dansk version vises."
  };

  return (
    <div className="py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">
                {messages[currentLanguage] || messages.en}
              </span>
            </div>
            <LanguageSwitcher 
              variant="compact" 
              currentPath={currentPath}
              className="ml-4"
            />
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};