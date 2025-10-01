
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { languageConfig, type SupportedLanguage } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import logo from '@/assets/DelSolPrimeHomes-Logo.png';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const currentLang = currentLanguage as SupportedLanguage;

  // Scroll detection using scroll event
  useEffect(() => {
    const handleScroll = () => {
      const searchSection = document.querySelector('section[data-section="search"]');
      if (searchSection) {
        const rect = searchSection.getBoundingClientRect();
        const navbarHeight = 80; // Account for navbar height
        setIsOverHero(rect.top > navbarHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.properties'), href: '#properties' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.qa'), href: '/faq' },
  ];

  // Generate languages array from languageConfig
  const languages = Object.entries(languageConfig).map(([code, config]) => ({
    code,
    name: config.name,
    flag: config.flag,
  }));

  const selectedLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const handleLanguageChange = (language: { code: string; name: string; flag: string }) => {
    setLanguage(language.code as SupportedLanguage);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-lg will-change-scroll transition-all duration-300",
      isOverHero 
        ? "bg-secondary/90 border-white/20" // Branded navy background with high opacity
        : "bg-secondary/95 border-primary/20" // Consistent branded background
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Enhanced Responsive Logo */}
          <div className="flex items-center">
            <a href="/" className="group">
              <img 
                src={logo} 
                alt="DelSol Prime Homes - Luxury Real Estate Costa del Sol" 
                className="h-16 w-auto sm:h-20 lg:h-24 hover:scale-105 transition-all duration-300 will-change-transform"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList className="space-x-6">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      href={item.href}
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        "relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-1/2 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0",
                        "text-white/90 hover:text-white after:bg-white hover:bg-white/10"
                      )}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                  )}
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden xl:inline">{selectedLanguage.name}</span>
                  <span className="xl:hidden">{selectedLanguage.flag}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-md border-primary/20 z-[60]">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="text-secondary">{language.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced CTA Button */}
            <a href="/book-viewing">
                <Button className="gold-gradient text-secondary font-semibold px-4 sm:px-6 py-2 hover-gold transition-all duration-300 hover:scale-105 will-change-transform">
                  <span className="hidden sm:inline">{t('cta.bookViewing')}</span>
                  <span className="sm:hidden text-xs">{t('cta.bookViewing')}</span>
                </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "transition-all duration-300",
                "text-white hover:bg-white/10"
              )}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Menu with Better Performance */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-secondary/95 backdrop-blur-md border-t border-white/20 shadow-xl animate-fade-in will-change-transform z-[60]">
            <div className="container mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white hover:text-yellow-300 font-medium py-3 px-4 rounded-md hover:bg-white/10 transition-colors text-lg mobile-touch-target"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                
                {/* Mobile Language Selection */}
                <div className="pt-4 border-t border-white/20">
                  <p className="text-sm text-white/70 mb-3">{t('nav.language')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          handleLanguageChange(language);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-md transition-colors text-left mobile-touch-target",
                          selectedLanguage.code === language.code
                            ? "bg-white/20 text-white"
                            : "hover:bg-white/10 text-white/80"
                        )}
                      >
                        <span>{language.flag}</span>
                        <span className="text-sm">{language.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Mobile CTA */}
                <a href="/book-viewing">
                  <Button className="gold-gradient text-secondary font-semibold w-full mt-4 hover-gold mobile-touch-target py-3 transition-all duration-300">
                    {t('cta.bookViewing')}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
