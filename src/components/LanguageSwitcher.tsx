import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { languageConfig, type SupportedLanguage } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  currentPath?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  currentPath,
  className,
  variant = 'default'
}) => {
  const { currentLanguage, setLanguage, getContentCount } = useLanguage();

  const languages = Object.entries(languageConfig).map(([code, config]) => ({
    code: code as SupportedLanguage,
    ...config,
    contentCount: getContentCount(code as SupportedLanguage)
  }));

  const selectedLanguage = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (language: typeof languages[0]) => {
    setLanguage(language.code);
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Globe className="w-4 h-4 text-muted-foreground" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 px-2 text-sm hover:bg-muted"
            >
              <span className="mr-1">{selectedLanguage.flag}</span>
              <span className="hidden sm:inline">{selectedLanguage.name}</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={cn(
                  "flex items-center gap-3 cursor-pointer",
                  currentLanguage === language.code && "bg-accent"
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span>{language.name}</span>
                  {language.contentCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {language.contentCount} articles
                    </span>
                  )}
                </div>
                {currentLanguage === language.code && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 transition-all duration-300",
            "bg-background/80 border-border hover:bg-accent",
            className
          )}
        >
          <Globe className="w-4 h-4" />
          <span className="hidden md:inline">{selectedLanguage.name}</span>
          <span className="md:hidden">{selectedLanguage.flag}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              currentLanguage === language.code && "bg-accent"
            )}
          >
            <span className="text-lg">{language.flag}</span>
            <div className="flex flex-col">
              <span>{language.name}</span>
              {language.contentCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {language.contentCount} articles
                </span>
              )}
            </div>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};