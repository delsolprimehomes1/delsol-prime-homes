// Enhanced GEO Signals for Phase 7
// Comprehensive geographic targeting with service area definitions

import { GeoCoordinates, GeoAreaData, COSTA_DEL_SOL_COORDINATES } from './geo-data';

export interface EnhancedGeoData extends GeoAreaData {
  serviceRadius?: number; // in km
  postalCodes?: string[];
  neighborhoods?: string[];
  landmarks?: string[];
  regionType?: 'coastal' | 'urban' | 'rural' | 'mountain';
}

export interface LocalBusinessSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address: {
    '@type': string;
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  areaServed: Array<{
    '@type': string;
    name: string;
    geo?: {
      '@type': string;
      latitude: number;
      longitude: number;
    };
  }>;
  openingHours?: string;
  priceRange?: string;
  aggregateRating?: {
    '@type': string;
    ratingValue: number;
    reviewCount: number;
  };
}

/**
 * Generate enhanced Place schema with precise coordinates and service area
 */
export const generateEnhancedPlaceSchema = (
  city: string,
  article?: any
): any => {
  const coordinates = COSTA_DEL_SOL_COORDINATES[city] || COSTA_DEL_SOL_COORDINATES['Marbella'];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    'name': city,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': city,
      'addressRegion': 'Malaga',
      'addressCountry': 'ES'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': coordinates.lat,
      'longitude': coordinates.lng
    },
    'containedInPlace': {
      '@type': 'AdministrativeArea',
      'name': 'Costa del Sol',
      'containedInPlace': {
        '@type': 'AdministrativeArea',
        'name': 'Andalusia',
        'addressCountry': 'Spain'
      }
    },
    'description': `${city} is a prime location on the Costa del Sol, known for luxury real estate and Mediterranean lifestyle.`,
    'url': `https://delsolprimehomes.com/locations/${city.toLowerCase()}`,
    'image': article?.image_url || `https://delsolprimehomes.com/images/locations/${city.toLowerCase()}.jpg`,
    'sameAs': [
      `https://en.wikipedia.org/wiki/${city}`,
      `https://www.google.com/maps/place/${city},+Spain`
    ]
  };
};

/**
 * Generate comprehensive local business schema
 */
export const generateLocalBusinessSchema = (
  city: string = 'Marbella'
): LocalBusinessSchema => {
  const coordinates = COSTA_DEL_SOL_COORDINATES[city] || COSTA_DEL_SOL_COORDINATES['Marbella'];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    'name': `DelSolPrimeHomes - ${city} Office`,
    'description': `Premium real estate agency specializing in luxury properties in ${city} and Costa del Sol region.`,
    'url': 'https://delsolprimehomes.com',
    'telephone': '+34-952-123-456',
    'email': 'info@delsolprimehomes.com',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': city,
      'addressRegion': 'Malaga',
      'addressCountry': 'ES'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': coordinates.lat,
      'longitude': coordinates.lng
    },
    'areaServed': Object.keys(COSTA_DEL_SOL_COORDINATES).map(location => ({
      '@type': 'City',
      'name': location,
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': COSTA_DEL_SOL_COORDINATES[location].lat,
        'longitude': COSTA_DEL_SOL_COORDINATES[location].lng
      }
    })),
    'openingHours': 'Mo-Fr 09:00-18:00, Sa 10:00-14:00',
    'priceRange': '€€€',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': 4.8,
      'reviewCount': 156
    }
  };
};

/**
 * Extract location mentions from content
 */
export const extractLocationMentions = (content: string): string[] => {
  const locations = Object.keys(COSTA_DEL_SOL_COORDINATES);
  const mentions = new Set<string>();
  
  locations.forEach(location => {
    const regex = new RegExp(`\\b${location}\\b`, 'gi');
    if (regex.test(content)) {
      mentions.add(location);
    }
  });
  
  return Array.from(mentions);
};

/**
 * Calculate location relevance score
 */
export const calculateLocationRelevance = (article: any, targetCity: string): number => {
  let score = 0;
  const content = (article.content || '').toLowerCase();
  const title = (article.title || '').toLowerCase();
  const targetLower = targetCity.toLowerCase();
  
  // Title mentions (highest weight)
  if (title.includes(targetLower)) score += 40;
  
  // City tag exact match
  if (article.city?.toLowerCase() === targetLower) score += 30;
  
  // Content mentions (frequency matters)
  const regex = new RegExp(`\\b${targetLower}\\b`, 'gi');
  const matches = content.match(regex);
  if (matches) {
    score += Math.min(20, matches.length * 2);
  }
  
  // Tags/keywords
  if (article.city_tags?.some((tag: string) => tag.toLowerCase().includes(targetLower))) {
    score += 10;
  }
  
  return Math.min(100, score);
};

/**
 * Generate service area definition for schema
 */
export const generateServiceAreaSchema = (
  primaryCity: string,
  includeAllCostaDelSol: boolean = true
) => {
  const serviceAreas = includeAllCostaDelSol
    ? Object.keys(COSTA_DEL_SOL_COORDINATES)
    : [primaryCity];
  
  return {
    '@type': 'GeoCircle',
    'geoMidpoint': {
      '@type': 'GeoCoordinates',
      'latitude': COSTA_DEL_SOL_COORDINATES[primaryCity]?.lat || 36.5099,
      'longitude': COSTA_DEL_SOL_COORDINATES[primaryCity]?.lng || -4.8857
    },
    'geoRadius': '50000', // 50km radius
    'description': `Service area covering ${serviceAreas.join(', ')} and surrounding areas`,
    'areaServed': serviceAreas.map(city => ({
      '@type': 'City',
      'name': city,
      'containedInPlace': {
        '@type': 'AdministrativeArea',
        'name': 'Costa del Sol'
      }
    }))
  };
};

/**
 * Integrate EXIF GPS data with GEO signals
 */
export const integrateEXIFGeoData = (
  imageMetadata: any,
  article: any
): {
  hasGeoData: boolean;
  coordinates?: GeoCoordinates;
  nearestCity?: string;
  schema: any;
} => {
  const hasGeoData = !!(imageMetadata?.exif_latitude && imageMetadata?.exif_longitude);
  
  if (!hasGeoData) {
    return {
      hasGeoData: false,
      schema: null
    };
  }
  
  const coordinates: GeoCoordinates = {
    lat: imageMetadata.exif_latitude,
    lng: imageMetadata.exif_longitude
  };
  
  // Find nearest city
  let nearestCity = 'Marbella';
  let minDistance = Infinity;
  
  Object.entries(COSTA_DEL_SOL_COORDINATES).forEach(([city, coords]) => {
    const distance = calculateDistance(coordinates, coords);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });
  
  // Generate enhanced schema with EXIF data
  const schema = {
    '@type': 'ImageObject',
    'contentUrl': imageMetadata.storage_path,
    'description': imageMetadata.description || article.title,
    'exifData': {
      '@type': 'PropertyValue',
      'name': 'GPS Coordinates',
      'value': `${coordinates.lat}, ${coordinates.lng}`
    },
    'contentLocation': {
      '@type': 'Place',
      'name': imageMetadata.exif_location_name || nearestCity,
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': coordinates.lat,
        'longitude': coordinates.lng
      }
    }
  };
  
  return {
    hasGeoData: true,
    coordinates,
    nearestCity,
    schema
  };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (coord1: GeoCoordinates, coord2: GeoCoordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Generate comprehensive GEO metadata for article
 */
export const generateComprehensiveGeoMetadata = (article: any) => {
  const primaryCity = article.city || 'Marbella';
  const locationMentions = extractLocationMentions(article.content || '');
  const relevanceScore = calculateLocationRelevance(article, primaryCity);
  
  return {
    primaryLocation: primaryCity,
    coordinates: COSTA_DEL_SOL_COORDINATES[primaryCity],
    locationMentions,
    relevanceScore,
    placeSchema: generateEnhancedPlaceSchema(primaryCity, article),
    serviceAreaSchema: generateServiceAreaSchema(primaryCity, true),
    localBusinessSchema: generateLocalBusinessSchema(primaryCity),
    areaServed: Object.keys(COSTA_DEL_SOL_COORDINATES)
  };
};

export default {
  generateEnhancedPlaceSchema,
  generateLocalBusinessSchema,
  extractLocationMentions,
  calculateLocationRelevance,
  generateServiceAreaSchema,
  integrateEXIFGeoData,
  generateComprehensiveGeoMetadata
};
