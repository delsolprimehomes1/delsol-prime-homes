
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
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-white"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="heading-xl mb-6 text-secondary">Find Your Dream Property</h2>
          <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
            Search through our exclusive collection of luxury properties in Costa Del Sol's most prestigious locations.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {/* Location Field */}
            <div className="xl:col-span-2 group">
              <div className="field-3d">
                <label className="block text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </label>
                <Select onValueChange={(value) => setSearchParams({...searchParams, location: value})}>
                  <SelectTrigger className="h-14 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base">
                    <SelectValue placeholder="Choose location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
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
              <div className="field-3d">
                <label className="block text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
                  Type
                </label>
                <Select onValueChange={(value) => setSearchParams({...searchParams, propertyType: value})}>
                  <SelectTrigger className="h-14 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base">
                    <SelectValue placeholder="Property type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
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
              <div className="field-3d">
                <label className="block text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
                  <Euro className="w-4 h-4 text-primary" />
                  Price
                </label>
                <Select onValueChange={(value) => setSearchParams({...searchParams, priceRange: value})}>
                  <SelectTrigger className="h-14 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base">
                    <SelectValue placeholder="Price range" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
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
              <div className="field-3d">
                <label className="block text-sm font-semibold text-secondary mb-3 flex items-center gap-2">
                  <Bed className="w-4 h-4 text-primary" />
                  Bedrooms
                </label>
                <Select onValueChange={(value) => setSearchParams({...searchParams, bedrooms: value})}>
                  <SelectTrigger className="h-14 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-base">
                    <SelectValue placeholder="Beds" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl">
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
            <div className="flex items-end group">
              <div className="field-3d w-full">
                <Button 
                  onClick={handleSearch}
                  className="w-full h-14 gold-gradient text-secondary font-semibold hover-gold rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="field-3d bg-white/60 backdrop-blur-sm p-8 rounded-2xl">
            <p className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Popular Searches:
            </p>
            <div className="flex flex-wrap gap-3">
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
                  className="px-6 py-3 text-sm bg-white/80 text-secondary rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
