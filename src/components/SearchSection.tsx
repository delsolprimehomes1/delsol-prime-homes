
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Home, Euro, Sparkles, Zap } from 'lucide-react';

const SearchSection = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    propertyType: '',
    priceRange: '',
    aiMatching: false,
  });

  const handleSearch = () => {
    console.log('Search params:', searchParams);
    // Implement search functionality with structured data event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'property_search', {
        event_category: 'Real Estate',
        event_label: 'Property Search',
        location: searchParams.location,
        property_type: searchParams.propertyType,
        price_range: searchParams.priceRange
      });
    }
  };

  const popularSearches = [
    'Luxury Villas',
    'Beachfront Apartments', 
    'Golf Course Homes',
    'New Construction',
    'Sea View Properties',
    'Investment Opportunities'
  ];

  return (
    <>
      {/* JSON-LD Structured Data for Search Action */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://delsolprimehomes.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://delsolprimehomes.com/properties?location={search_term_string}&type={property_type}&price={price_range}",
            },
            "query-input": "required name=search_term_string"
          }
        })
      }} />

      <section className="py-24 bg-gradient-to-b from-secondary via-secondary/95 to-secondary/90 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">AI-Powered Property Discovery</span>
            </div>
            <h2 className="heading-xl mb-6 text-white">
              Find Your Dream Home in{' '}
              <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                Costa Del Sol
              </span>{' '}
              in 60 Seconds
            </h2>
            <p className="body-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Experience our revolutionary AI property matching system. Input your preferences and let our advanced algorithms find your perfect luxury home instantly.
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-6xl mx-auto bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl animate-scale-in">
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Location */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    Location
                  </label>
                  <Select onValueChange={(value) => setSearchParams({...searchParams, location: value})}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-sm">
                      <SelectValue placeholder="Choose location" className="text-white/70" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="marbella">Marbella - Golden Mile</SelectItem>
                      <SelectItem value="estepona">Estepona - New Golden Mile</SelectItem>
                      <SelectItem value="fuengirola">Fuengirola - Beachfront</SelectItem>
                      <SelectItem value="mijas">Mijas - Golf Valley</SelectItem>
                      <SelectItem value="benalmadena">Benalmádena - Marina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Type */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Home className="w-4 h-4 text-primary" />
                    </div>
                    Property Type
                  </label>
                  <Select onValueChange={(value) => setSearchParams({...searchParams, propertyType: value})}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-sm">
                      <SelectValue placeholder="Property type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="villa">Luxury Villa</SelectItem>
                      <SelectItem value="apartment">Premium Apartment</SelectItem>
                      <SelectItem value="penthouse">Exclusive Penthouse</SelectItem>
                      <SelectItem value="townhouse">Modern Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Euro className="w-4 h-4 text-primary" />
                    </div>
                    Price Range
                  </label>
                  <Select onValueChange={(value) => setSearchParams({...searchParams, priceRange: value})}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-sm">
                      <SelectValue placeholder="Budget" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="500-1m">€500K - €1M</SelectItem>
                      <SelectItem value="1-2m">€1M - €2M</SelectItem>
                      <SelectItem value="2-5m">€2M - €5M</SelectItem>
                      <SelectItem value="5m+">€5M+ Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Matching Toggle */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/90">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Zap className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    AI Property Matching
                  </label>
                  <button
                    onClick={() => setSearchParams({...searchParams, aiMatching: !searchParams.aiMatching})}
                    className={`h-14 w-full rounded-lg border-2 transition-all duration-300 backdrop-blur-sm ${
                      searchParams.aiMatching 
                        ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/25' 
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className={`w-5 h-5 ${searchParams.aiMatching ? 'animate-pulse' : ''}`} />
                      <span className="font-medium">
                        {searchParams.aiMatching ? 'AI Enabled' : 'Enable AI'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center mb-8">
                <Button 
                  onClick={handleSearch}
                  className="h-16 px-12 gold-gradient text-secondary font-bold text-lg hover-gold shadow-2xl transform transition-all duration-300 hover:scale-105"
                >
                  <Search className="w-6 h-6 mr-3" />
                  Find My Perfect Home
                </Button>
              </div>

              {/* Popular Searches */}
              <div className="border-t border-white/10 pt-8">
                <p className="text-sm font-semibold text-white/80 mb-4 text-center">Popular Searches:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      className="px-6 py-3 text-sm bg-white/10 text-white rounded-full border border-white/20 hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all duration-300 backdrop-blur-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Microcopy */}
          <div className="text-center mt-8 animate-fade-in-delay">
            <p className="text-sm text-white/60">
              ⚡ Instant results • 🏆 25,000+ luxury properties • 🔒 Secure & private
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default SearchSection;
