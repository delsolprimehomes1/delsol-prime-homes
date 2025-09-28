
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Home, Euro, Bed, Bath } from 'lucide-react';

const SearchSection = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState({
    location: '',
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
  });

  const handleSearch = () => {
    console.log('Search params:', searchParams);
    // Implement search functionality
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white" data-section="search">
      {/* FAQ Schema for SERP Optimization */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What's the average price of a villa in Marbella Golden Mile?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Prices range from €1.5M to €10M depending on size, location, and amenities. The Golden Mile is Marbella's most prestigious area with luxury beachfront and golf course properties."
              }
            },
            {
              "@type": "Question", 
              "name": "Where can I find beachfront apartments in Estepona?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Use our search filters under 'Location' and 'Type' to browse beachfront apartments in Estepona's prime coastal areas. Estepona offers excellent value with new developments and sea views."
              }
            },
            {
              "@type": "Question",
              "name": "Are there luxury penthouses available in Puerto Banús?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Puerto Banús offers exclusive penthouses with marina views, luxury amenities, and prime locations. Filter by 'Penthouse' type and 'Marbella' location to see available properties."
              }
            }
          ]
        })
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 text-secondary">{t('search.title')}</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Search villas, apartments, and beachfront homes in Marbella, Estepona, Fuengirola, and beyond.
          </p>
          
          {/* Conversational AEO Layer */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="sleek-card p-4 rounded-xl bg-accent/20 border border-primary/20">
              <p className="text-sm text-secondary font-medium">
                💬 Ask us: "Where can I find a sea-view villa in Marbella under €2M?" 
                <span className="text-muted-foreground font-normal ml-1">
                  Use the filters below to discover your perfect match.
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Enhanced Mobile-First Search Container */}
          <div className="sleek-card p-4 sm:p-6 lg:p-8 rounded-2xl mb-6 sm:mb-8 desktop-hover">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {/* Enhanced Location Field */}
              <div className="sm:col-span-2 xl:col-span-2 group">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select onValueChange={(value) => setSearchParams({...searchParams, location: value})}>
                    <SelectTrigger className="h-12 sm:h-14 pl-10 border-0 bg-muted/30 hover:bg-muted/50 focus:bg-muted/60 minimal-hover rounded-lg text-sm font-medium mobile-touch-target transition-all duration-200" itemProp="location">
                      <SelectValue placeholder={t('search.selectLocation')} />
                    </SelectTrigger>
                    <SelectContent className="sleek-dropdown z-50 bg-white/95 backdrop-blur-md">
                      <SelectItem value="marbella-golden-mile">Marbella Golden Mile</SelectItem>
                      <SelectItem value="puerto-banus">Puerto Banús</SelectItem>
                      <SelectItem value="marbella">Marbella Centro</SelectItem>
                      <SelectItem value="estepona-beachfront">Estepona Beachfront</SelectItem>
                      <SelectItem value="estepona">Estepona</SelectItem>
                      <SelectItem value="fuengirola">Fuengirola</SelectItem>
                      <SelectItem value="mijas-golf">Mijas Golf</SelectItem>
                      <SelectItem value="benalmadena">Benalmádena</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Property Type Field */}
              <div className="group">
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select onValueChange={(value) => setSearchParams({...searchParams, propertyType: value})}>
                    <SelectTrigger className="h-12 pl-10 border-0 bg-muted/30 hover:bg-muted/50 minimal-hover rounded-lg text-sm font-medium" itemProp="propertyType">
                      <SelectValue placeholder={t('search.propertyType')} />
                    </SelectTrigger>
                    <SelectContent className="sleek-dropdown">
                      <SelectItem value="luxury-villa">Luxury Villa</SelectItem>
                      <SelectItem value="beachfront-apartment">Beachfront Apartment</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="golf-property">Golf Course Property</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="new-development">New Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range Field */}
              <div className="group">
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select onValueChange={(value) => setSearchParams({...searchParams, priceRange: value})}>
                    <SelectTrigger className="h-12 pl-10 border-0 bg-muted/30 hover:bg-muted/50 minimal-hover rounded-lg text-sm font-medium" itemProp="priceRange">
                      <SelectValue placeholder={t('search.priceRange')} />
                    </SelectTrigger>
                    <SelectContent className="sleek-dropdown">
                      <SelectItem value="500k-1m">€500K - €1M</SelectItem>
                      <SelectItem value="1-2m">€1M - €2M</SelectItem>
                      <SelectItem value="2-5m">€2M - €5M</SelectItem>
                      <SelectItem value="5-10m">€5M - €10M</SelectItem>
                      <SelectItem value="10m+">€10M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bedrooms Field */}
              <div className="group">
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select onValueChange={(value) => setSearchParams({...searchParams, bedrooms: value})}>
                    <SelectTrigger className="h-12 pl-10 border-0 bg-muted/30 hover:bg-muted/50 minimal-hover rounded-lg text-sm font-medium">
                      <SelectValue placeholder={t('search.bedrooms')} />
                    </SelectTrigger>
                    <SelectContent className="sleek-dropdown">
                      <SelectItem value="1">1+ Bedroom</SelectItem>
                      <SelectItem value="2">2+ Bedrooms</SelectItem>
                      <SelectItem value="3">3+ Bedrooms</SelectItem>
                      <SelectItem value="4">4+ Bedrooms</SelectItem>
                      <SelectItem value="5">5+ Bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enhanced Search Button */}
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg professional-hover mobile-touch-target transition-all duration-300 hover:scale-105"
                  aria-label="Search luxury properties in Costa Del Sol"
                >
                  <Search className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{t('search.button')}</span>
                  <span className="sm:hidden">{t('search.button')}</span>
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50 my-6"></div>

            {/* Enhanced Popular Searches with GEO Targeting */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Popular Property Searches in Costa Del Sol
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Luxury Villas Marbella Golden Mile',
                  'Estepona Golf Course Properties', 
                  'Puerto Banús Beachfront Apartments',
                  'Fuengirola Sea View Penthouses',
                  'New Developments Costa Del Sol',
                  'Investment Properties Marbella',
                  'Benalmádena Marina Apartments',
                  'Mijas Golf Villas'
                ].map((filter, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 text-xs bg-muted/50 text-muted-foreground rounded-full hover:bg-primary hover:text-primary-foreground minimal-hover font-medium border border-border/30"
                    aria-label={`Search for ${filter}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Mobile-Responsive FAQ Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="sleek-card p-4 sm:p-5 rounded-xl desktop-hover animate-on-scroll">
              <h3 className="font-bold text-secondary mb-2 text-sm sm:text-base">Average Villa Prices in Marbella?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">€1.5M-€10M in Golden Mile, depending on size and amenities.</p>
            </div>
            <div className="sleek-card p-4 sm:p-5 rounded-xl desktop-hover animate-on-scroll">
              <h3 className="font-bold text-secondary mb-2 text-sm sm:text-base">Best Areas for Beachfront Properties?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Estepona, Puerto Banús, and Fuengirola offer prime coastal locations.</p>
            </div>
            <div className="sleek-card p-4 sm:p-5 rounded-xl desktop-hover animate-on-scroll">
              <h3 className="font-bold text-secondary mb-2 text-sm sm:text-base">Investment Opportunities Available?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">New developments and off-plan properties offer excellent ROI potential.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
