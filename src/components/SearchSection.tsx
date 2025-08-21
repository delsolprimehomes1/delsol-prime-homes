
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Home, Euro, Bed, Bath } from 'lucide-react';

const SearchSection = () => {
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
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="heading-lg mb-4 text-secondary">Find Your Dream Property</h2>
          <p className="body-md text-muted-foreground max-w-xl mx-auto">
            Search through our exclusive collection of luxury properties in Costa Del Sol's most prestigious locations.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Unified Search Container */}
          <div className="sleek-card p-6 rounded-2xl mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Location Field */}
              <div className="xl:col-span-2 group">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select onValueChange={(value) => setSearchParams({...searchParams, location: value})}>
                    <SelectTrigger className="h-12 pl-10 border-0 bg-muted/30 hover:bg-muted/50 minimal-hover rounded-lg text-sm font-medium">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="sleek-dropdown">
                      <SelectItem value="marbella">Marbella</SelectItem>
                      <SelectItem value="estepona">Estepona</SelectItem>
                      <SelectItem value="fuengirola">Fuengirola</SelectItem>
                      <SelectItem value="mijas">Mijas</SelectItem>
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
                    <SelectTrigger className="h-12 pl-10 border-0 bg-muted/30 hover:bg-muted/50 minimal-hover rounded-lg text-sm font-medium">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="sleek-dropdown">
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range Field */}
              <div className="group">
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select onValueChange={(value) => setSearchParams({...searchParams, priceRange: value})}>
                    <SelectTrigger className="h-12 pl-10 border-0 bg-muted/30 hover:bg-muted/50 minimal-hover rounded-lg text-sm font-medium">
                      <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent className="sleek-dropdown">
                      <SelectItem value="500-1m">€500K - €1M</SelectItem>
                      <SelectItem value="1-2m">€1M - €2M</SelectItem>
                      <SelectItem value="2-5m">€2M - €5M</SelectItem>
                      <SelectItem value="5m+">€5M+</SelectItem>
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
                      <SelectValue placeholder="Beds" />
                    </SelectTrigger>
                    <SelectContent className="sleek-dropdown">
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg professional-hover"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50 my-6"></div>

            {/* Quick Filters */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Luxury Villas Marbella',
                  'Beachfront Apartments',
                  'Golf Properties',
                  'New Developments',
                  'Sea View Properties',
                  'Investment Opportunities'
                ].map((filter, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 text-xs bg-muted/50 text-muted-foreground rounded-full hover:bg-primary hover:text-primary-foreground minimal-hover font-medium border border-border/30"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
