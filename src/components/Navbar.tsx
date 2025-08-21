
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
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);

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
    { name: 'Home', href: '#' },
    { name: 'Properties', href: '#properties' },
    { name: 'Blog', href: '#blog' },
    { name: 'FAQ', href: '#faq' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-lg will-change-scroll transition-all duration-300",
      isOverHero 
        ? "bg-transparent border-white/20 lg:bg-transparent md:bg-white/20 sm:bg-white/30 bg-white/95" // Mobile gets background, desktop transparent
        : "bg-white/96 border-primary/20"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Enhanced Responsive Logo */}
          <div className="flex items-center">
            <a href="#" className="group">
              <h1 className={cn(
                "font-heading text-xl sm:text-2xl lg:text-3xl font-bold hover:scale-105 transition-all duration-300 will-change-transform",
                isOverHero 
                  ? "text-white" 
                  : "bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent"
              )}>
                <span className="sm:hidden">DelSol</span>
                <span className="hidden sm:inline">DelSolPrimeHomes</span>
              </h1>
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
                        isOverHero 
                          ? "text-white/90 hover:text-white after:bg-white hover:bg-white/10" 
                          : "text-secondary hover:text-primary after:bg-primary hover:bg-accent"
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
                    isOverHero
                      ? "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                      : "bg-white/80 border-primary/20 text-secondary hover:bg-primary/10 hover:border-primary/40"
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
                    onClick={() => setSelectedLanguage(language)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="text-secondary">{language.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced CTA Button */}
            <Button className="gold-gradient text-secondary font-semibold px-4 sm:px-6 py-2 hover-gold transition-all duration-300 hover:scale-105 will-change-transform">
              <span className="hidden sm:inline">Book Viewing</span>
              <span className="sm:hidden text-xs">Book</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "transition-all duration-300",
                isOverHero
                  ? "text-white hover:bg-white/10"
                  : "text-secondary hover:bg-primary/10"
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
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/96 backdrop-blur-md border-t border-primary/30 shadow-xl animate-fade-in will-change-transform z-[60]">
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-secondary hover:text-primary font-medium py-2 px-4 rounded-md hover:bg-primary/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                
                {/* Mobile Language Selection */}
                <div className="pt-4 border-t border-primary/20">
                  <p className="text-sm text-secondary/70 mb-3">Language</p>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setSelectedLanguage(language);
                          setIsMobileMenuOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-md transition-colors text-left",
                          selectedLanguage.code === language.code
                            ? "bg-primary/20 text-secondary"
                            : "hover:bg-primary/10 text-secondary/80"
                        )}
                      >
                        <span>{language.flag}</span>
                        <span className="text-sm">{language.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Mobile CTA */}
                <Button className="gold-gradient text-secondary font-semibold w-full mt-4 hover-gold mobile-touch-target py-3 transition-all duration-300">
                  Book Your Viewing
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
