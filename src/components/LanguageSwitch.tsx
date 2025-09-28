import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { languageConfig, type SupportedLanguage } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitchProps {
  currentPath?: string;
  variant?: 'horizontal' | 'vertical' | 'badges';
  showFlags?: boolean;
  className?: string;
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({
  currentPath,
  variant = 'horizontal',
  showFlags = true,
  className
}) => {
  const { currentLanguage, setLanguage: changeLanguage } = useLanguage();

  const languages = Object.entries(languageConfig).map(([code, config]) => ({
    code: code as SupportedLanguage,
    ...config
  }));

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    changeLanguage(languageCode);
  };

  if (variant === 'badges') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {languages.map((language) => (
          <Badge
            key={language.code}
            variant={currentLanguage === language.code ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:scale-105",
              currentLanguage === language.code
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => handleLanguageChange(language.code)}
          >
            {showFlags && (
              <span className="mr-1.5 text-sm">{language.flag}</span>
            )}
            <span className="text-xs font-medium">{language.name}</span>
          </Badge>
        ))}
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Languages className="w-4 h-4" />
          <span>Available Languages</span>
        </div>
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => handleLanguageChange(language.code)}
          >
            {showFlags && (
              <span className="mr-2">{language.flag}</span>
            )}
            <span>{language.name}</span>
            {currentLanguage === language.code && (
              <span className="ml-auto text-xs opacity-70">Current</span>
            )}
          </Button>
        ))}
      </div>
    );
  }

  // Default horizontal variant
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Globe className="w-4 h-4 text-muted-foreground mr-2" />
      {languages.map((language, index) => (
        <React.Fragment key={language.code}>
          <Button
            variant={currentLanguage === language.code ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-8 px-2 transition-all duration-200",
              currentLanguage === language.code
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
            onClick={() => handleLanguageChange(language.code)}
          >
            {showFlags && (
              <span className="mr-1 text-sm">{language.flag}</span>
            )}
            <span className="text-xs">{language.code.toUpperCase()}</span>
          </Button>
          {index < languages.length - 1 && (
            <span className="text-muted-foreground/50">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};