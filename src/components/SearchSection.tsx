
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
    <section className="py-20 bg-gradient-to-b from-white to-accent/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading-xl mb-4 text-secondary">Find Your Dream Property</h2>
          <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
            Search through our exclusive collection of luxury properties in Costa Del Sol's most prestigious locations.
          </p>
        </div>

        <Card className="card-luxury max-w-6xl mx-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* Location */}
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-secondary mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <Select onValueChange={(value) => setSearchParams({...searchParams, location: value})}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marbella">Marbella</SelectItem>
                  <SelectItem value="estepona">Estepona</SelectItem>
                  <SelectItem value="fuengirola">Fuengirola</SelectItem>
                  <SelectItem value="mijas">Mijas</SelectItem>
                  <SelectItem value="benalmadena">Benalmádena</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Home className="w-4 h-4 inline mr-1" />
                Type
              </label>
              <Select onValueChange={(value) => setSearchParams({...searchParams, propertyType: value})}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Euro className="w-4 h-4 inline mr-1" />
                Price
              </label>
              <Select onValueChange={(value) => setSearchParams({...searchParams, priceRange: value})}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500-1m">€500K - €1M</SelectItem>
                  <SelectItem value="1-2m">€1M - €2M</SelectItem>
                  <SelectItem value="2-5m">€2M - €5M</SelectItem>
                  <SelectItem value="5m+">€5M+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                <Bed className="w-4 h-4 inline mr-1" />
                Bedrooms
              </label>
              <Select onValueChange={(value) => setSearchParams({...searchParams, bedrooms: value})}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                className="w-full h-12 gold-gradient text-secondary font-semibold hover-gold"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="border-t border-border pt-6">
            <p className="text-sm font-medium text-secondary mb-3">Popular Searches:</p>
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
                  className="px-4 py-2 text-sm bg-accent/50 text-secondary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SearchSection;
