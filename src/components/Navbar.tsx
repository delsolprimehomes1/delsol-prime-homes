
import React, { useState } from 'react';
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

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white/95 via-white/90 to-primary/20 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#" className="group">
              <h1 className="font-heading text-2xl lg:text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                DelSolPrimeHomes
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
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        "text-secondary hover:text-primary relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-1/2 after:bg-primary after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
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
                  className="flex items-center gap-2 bg-white/80 border-primary/20 text-secondary hover:bg-primary/10 hover:border-primary/40"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden xl:inline">{selectedLanguage.name}</span>
                  <span className="xl:hidden">{selectedLanguage.flag}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-md border-primary/20">
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

            {/* CTA Button */}
            <Button className="gold-gradient text-secondary font-semibold px-6 hover-gold">
              Book Viewing
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-secondary hover:bg-primary/10"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-primary/20 shadow-lg animate-fade-in">
            <div className="container mx-auto px-4 py-6">
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

                {/* Mobile CTA */}
                <Button className="gold-gradient text-secondary font-semibold w-full mt-4 hover-gold">
                  Book Viewing
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
