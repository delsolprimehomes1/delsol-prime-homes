import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation } from 'lucide-react';
import { COSTA_DEL_SOL_COORDINATES, type GeoAreaData } from '@/utils/geo-data';

interface ServiceAreasSectionProps {
  geoData: GeoAreaData;
  className?: string;
}

export const ServiceAreasSection: React.FC<ServiceAreasSectionProps> = ({
  geoData,
  className = ''
}) => {
  const handleAreaClick = (city: string) => {
    // Navigate to city-filtered content
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/qa?city=${citySlug}`;
  };

  return (
    <Card className={`p-6 bg-muted/20 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Service Areas</h3>
        <Badge variant="outline" className="text-xs">
          <Navigation className="w-3 h-3 mr-1" />
          {geoData.areaServed.length} locations
        </Badge>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Expert property guidance across Costa del Sol's premium locations
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {geoData.areaServed.slice(0, 8).map((area, index) => {
            const coords = COSTA_DEL_SOL_COORDINATES[area];
            const isMainCity = area === geoData.mainCity;
            
            return (
              <button
                key={index}
                onClick={() => handleAreaClick(area)}
                className={`
                  p-3 rounded-lg border text-left transition-all duration-200
                  hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20
                  ${isMainCity ? 'border-primary bg-primary/10' : 'border-border bg-background'}
                `}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isMainCity ? 'text-primary' : 'text-foreground'}`}>
                      {area}
                    </span>
                    {isMainCity && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        Featured
                      </Badge>
                    )}
                  </div>
                  {coords && (
                    <div className="text-xs text-muted-foreground">
                      {coords.lat.toFixed(2)}°, {coords.lng.toFixed(2)}°
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        {geoData.areaServed.length > 8 && (
          <div className="text-center">
            <button 
              onClick={() => window.location.href = '/qa'}
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              View all {geoData.areaServed.length} service areas →
            </button>
          </div>
        )}
      </div>
      
      {/* Schema.org markup for geo targeting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            'name': 'Costa del Sol Property Services',
            'areaServed': geoData.areaServed.map(area => ({
              '@type': 'City',
              'name': area,
              'containedInPlace': {
                '@type': 'State',
                'name': 'Andalusia'
              }
            })),
            'serviceType': 'Real Estate Services',
            'provider': {
              '@type': 'Organization',
              'name': 'DelSolPrimeHomes'
            }
          })
        }}
      />
    </Card>
  );
};

export default ServiceAreasSection;